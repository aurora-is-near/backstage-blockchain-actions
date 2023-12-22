import {
  parseEntityRef,
  RELATION_API_CONSUMED_BY,
  RELATION_API_PROVIDED_BY,
  RELATION_HAS_PART,
  stringifyEntityRef,
} from "@backstage/catalog-model";
import type { Entity, EntityRelation } from "@backstage/catalog-model";
import { BaseCollector } from "./base-collector";
import {
  CollectorOptions,
  ComponentInfo,
  ContractInfo,
  KeyInfo,
  SystemInfo,
} from "../types";

export class AccessKeyCollector extends BaseCollector {
  collectSystems(opts: CollectorOptions): SystemInfo[] {
    return this.getSystemEntities().reduce<SystemInfo[]>((acc, system) => {
      if (opts.scope && system.spec?.owner !== opts.scope) {
        return acc;
      }

      const components = this.collectComponents(system, opts);

      if (components.some((c) => c.contracts?.length)) {
        return [
          ...acc,
          {
            title: system.metadata.title || system.metadata.name,
            system,
            components,
          },
        ];
      }
      return acc;
    }, []);
  }

  collectComponents(
    system: Entity,
    opts: CollectorOptions = {},
  ): ComponentInfo[] {
    const componentRefs = system.relations!.filter(
      (r) =>
        r.type === RELATION_HAS_PART &&
        parseEntityRef(r.targetRef).kind === "component",
    );
    return componentRefs
      .reduce<ComponentInfo[]>((acc, componentRef) => {
        const component = this.entityCatalog[componentRef.targetRef];
        if (opts.lifecycle && component.spec?.lifecycle !== opts.lifecycle) {
          return acc;
        }

        const contracts = this.collectContracts(componentRef).filter(
          (c) => c.keys && c.keys.length > 0,
        );
        if (contracts.length) {
          return [
            ...acc,
            {
              title: component.metadata.title || component.metadata.name,
              component,
              contracts,
              tags: this.getEntityTags(component),
            },
          ];
        }
        return acc;
      }, [])
      .sort((a, b) =>
        a.component.metadata.name.localeCompare(b.component.metadata.name),
      );
  }

  collectContracts(componentRef: EntityRelation): ContractInfo[] {
    return this.getApiEntities()
      .filter(
        (item) =>
          item.spec?.type === "contract-deployment" &&
          item.spec.network === "near" &&
          item.spec.lifecycle === "production" &&
          item.relations!.some(
            (r) =>
              r.type === RELATION_API_PROVIDED_BY &&
              r.targetRef === componentRef.targetRef,
          ),
      )
      .map((entity) => ({
        entity,
        keys: this.collectKeys(entity),
        tags: this.getEntityTags(entity),
      }));
  }

  collectKeys(contract: Entity): KeyInfo[] {
    return contract
      .relations!.filter(
        (r) =>
          r.type === RELATION_API_CONSUMED_BY &&
          parseEntityRef(r.targetRef).kind === "resource" &&
          this.entityCatalog[r.targetRef].spec?.type === "access-key",
      )
      .reduce<KeyInfo[]>((acc, r) => {
        const accessKey = this.entityCatalog[r.targetRef];
        if (accessKey && accessKey.spec && accessKey.spec.owner) {
          const ownerRef = parseEntityRef(accessKey.spec.owner as string);
          const owner = this.entityCatalog[stringifyEntityRef(ownerRef)];
          if (owner) {
            return [
              ...acc,
              {
                key: accessKey,
                owner,
                tags: this.getEntityTags(accessKey),
              },
            ];
          }
        }
        return acc;
      }, [])
      .sort((a, b) => a.key.metadata.name.localeCompare(b.key.metadata.name));
  }
}
