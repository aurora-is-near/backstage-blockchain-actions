import {
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
  private multisigs: Entity[] = [];

  constructor(entities: Entity[]) {
    super(entities);
    this.multisigs = this.getApiEntities().filter(
      (item) => item.spec?.type === "multisig-deployment",
    );
  }

  normalizeEntities(list: string[]) {
    return [...new Set(list)].sort((a, b) => a.localeCompare(b));
  }

  collectSystems(opts: CollectorOptions): SystemInfo[] {
    const systemRefs = this.normalizeEntities(
      this.multisigs.map((item) => item.spec!.system! as string),
    );
    return systemRefs
      .reduce<SystemInfo[]>((acc, systemRef) => {
        const system = this.entityCatalog[systemRef];
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
      .sort((a, b) =>
        a.system.metadata.name.localeCompare(b.system.metadata.name),
      );
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
        return [
          ...acc,
          {
            title: component.metadata.title || component.metadata.name,
            component,
            multisigs: this.collectMultisigs(componentRef),
            tags: this.getEntityTags(component),
          },
        ];
      }, [])
      .sort((a, b) =>
        a.component.metadata.name.localeCompare(b.component.metadata.name),
      );
  }

  collectMultisigs(componentRef: EntityRelation): MultisigInfo[] {
    return this.multisigs
      .filter((item) =>
        item.relations!.some(
          (r) =>
            r.type === "apiProvidedBy" &&
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
      .sort((a, b) =>
        a.owner.metadata.name.localeCompare(b.owner.metadata.name),
      );
  }
}
