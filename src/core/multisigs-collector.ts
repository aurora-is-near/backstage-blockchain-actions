import {
  RELATION_API_PROVIDED_BY,
  RELATION_OWNED_BY,
  RELATION_HAS_PART,
  parseEntityRef,
} from "@backstage/catalog-model";
import type { Entity, EntityRelation } from "@backstage/catalog-model";
import { BaseCollector } from "./base-collector";
import {
  CollectorOptions,
  ComponentInfo,
  MultisigInfo,
  SignerInfo,
  SystemInfo,
} from "../types";

export class MultisigsCollector extends BaseCollector {
  collectSystems(opts: CollectorOptions): SystemInfo[] {
    return this.getSystemEntities()
      .reduce<SystemInfo[]>((acc, system) => {
        if (opts.scope && system.spec?.owner !== opts.scope) {
          return acc;
        }
        const components = this.collectComponents(system, opts);

        if (components.some((c) => c.multisigs?.length)) {
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
      }, [])
      .sort((a, b) => this.sortByName(a.system, b.system));
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

        const multisigs = this.collectMultisigs(componentRef);
        if (multisigs.length) {
          return [
            ...acc,
            {
              title: component.metadata.title || component.metadata.name,
              component,
              multisigs,
              tags: this.getEntityTags(component),
            },
          ];
        }
        return acc;
      }, [])
      .sort((a, b) => this.sortByName(a.component, b.component));
  }

  collectMultisigs(componentRef: EntityRelation): MultisigInfo[] {
    return this.getApiEntities()
      .filter((item) =>
        item.relations!.some(
          (r) =>
            item.spec?.type === "multisig-deployment" &&
            r.type === RELATION_API_PROVIDED_BY &&
            r.targetRef === componentRef.targetRef,
        ),
      )
      .map((entity) => ({
        entity: entity,
        signers: this.collectSigners(entity),
        tags: this.getEntityTags(entity),
      }));
  }

  collectSigners(multisig: Entity): SignerInfo[] {
    return multisig
      .relations!.filter(
        (r) =>
          r.type === RELATION_OWNED_BY &&
          parseEntityRef(r.targetRef).kind !== "group",
      )
      .map((r) => {
        const signer = this.entityCatalog[r.targetRef];
        const owner = this.entityCatalog[signer.spec!.owner!.toString()];
        return {
          signer,
          owner,
          tags: this.getEntityTags(signer),
        };
      })
      .sort((a, b) => this.sortByName(a.owner, b.owner));
  }
}
