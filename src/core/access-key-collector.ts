import {
  isApiEntity,
  isResourceEntity,
  stringifyEntityRef,
  parseEntityRef,
  RELATION_API_CONSUMED_BY,
  RELATION_API_PROVIDED_BY,
  RELATION_HAS_PART,
} from "@backstage/catalog-model";
import type { Entity, EntityRelation } from "@backstage/catalog-model";

export class AccessKeyCollector {
  systemComponents: SystemComponents[] = [];
  private entities: Entity[] = [];
  private contracts: Entity[] = [];
  private accessKeys: Entity[] = [];

  constructor(entities: Entity[]) {
    this.entities = entities;
    const apiEntities = this.entities.filter(isApiEntity);
    const resourceEntities = this.entities.filter(isResourceEntity);
    this.contracts = apiEntities.filter(
      (item) => item.spec?.type === "contract-deployment",
    );
    this.accessKeys = resourceEntities.filter(
      (item) => item.spec?.type === "access-key",
    );
    this.systemComponents = this.collectSystems();
  }

  normalizeEntities(list: string[]) {
    return [...new Set(list)].sort((a, b) => a.localeCompare(b));
  }

  collectSystems(): SystemComponents[] {
    const systemRefs = this.normalizeEntities(
      this.contracts
        .filter((c) => !!c.spec?.system)
        .map((c) => c.spec!.system as string),
    );
    return systemRefs
      .reduce<SystemComponents[]>((acc, systemRef) => {
        const system = this.entities.find(
          (item) => stringifyEntityRef(item) === systemRef,
        )!;
        const components = this.collectComponents(system);

        if (components.some((c) => c.contracts.length)) {
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

  collectComponents(system: Entity): ComponentContracts[] {
    const componentRefs = system.relations!.filter(
      (r) =>
        r.type === RELATION_HAS_PART &&
        parseEntityRef(r.targetRef).kind === "component",
    );
    return componentRefs
      .reduce<ComponentContracts[]>((acc, componentRef) => {
        const component = this.entities.find(
          (item) => stringifyEntityRef(item) === componentRef.targetRef,
        )!;
        const contracts = this.collectContracts(componentRef).filter(
          (c) => c.keys.length > 0,
        );
        if (contracts.length) {
          return [
            ...acc,
            {
              title: component.metadata.title || component.metadata.name,
              component,
              contracts,
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
    return this.contracts
      .filter(
        (item) =>
          item.relations!.some(
            (r) =>
              r.type === RELATION_API_PROVIDED_BY &&
              r.targetRef === componentRef.targetRef,
          ) &&
          item.spec?.network === "near" &&
          // item.spec.nearKeys &&
          // ((item.spec.nearKeys as JsonObject).keys as JsonArray).length > 0 &&
          item.spec?.lifecycle === "production",
      )
      .map((entity) => ({
        entity,
        keys: this.collectKeys(entity),
      }));
  }

  collectKeys(contract: Entity): KeyInfo[] {
    return contract
      .relations!.filter(
        (r) =>
          r.type === RELATION_API_CONSUMED_BY &&
          parseEntityRef(r.targetRef).kind === "resource",
      )
      .reduce<KeyInfo[]>((acc, r) => {
        const accessKey = this.accessKeys.find(
          (e) => stringifyEntityRef(e) === r.targetRef,
        );
        if (accessKey && accessKey.spec && accessKey.spec.owner) {
          const ownerRef = parseEntityRef(accessKey.spec.owner as string);
          const owner = this.entities.find(
            (e) => e.metadata.name === ownerRef.name,
          );
          if (owner) {
            return [...acc, { key: accessKey, owner }];
          }
        }
        return acc;
      }, [])
      .sort((a, b) => a.key.metadata.name.localeCompare(b.key.metadata.name));
  }
}

type SystemComponents = {
  title: string;
  system: Entity;
  components: ComponentContracts[];
};

type ComponentContracts = {
  title: string;
  component: Entity;
  contracts: ContractInfo[];
};

type ContractInfo = {
  entity: Entity;
  keys: KeyInfo[];
};

type KeyInfo = {
  key: Entity;
  owner: Entity;
};
