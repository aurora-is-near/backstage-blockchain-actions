import {
  isApiEntity,
  stringifyEntityRef,
  parseEntityRef,
  RELATION_API_PROVIDED_BY,
  RELATION_DEPENDS_ON,
  RELATION_HAS_PART,
} from "@backstage/catalog-model";
import type { Entity, EntityRelation } from "@backstage/catalog-model";
import { JsonArray } from "@backstage/types";

export class RbacCollector {
  systemComponents: SystemComponents[] = [];
  private entities: Entity[] = [];
  private contracts: Entity[] = [];
  private roleGroups: Entity[] = [];

  constructor(entities: Entity[]) {
    this.entities = entities;
    const apiEntities = this.entities.filter(isApiEntity);
    this.contracts = apiEntities.filter(
      (item) => item.spec?.type === "contract-deployment",
    );
    this.roleGroups = apiEntities.filter(
      (item) => item.spec?.type === "role-group",
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
        const contracts = this.collectContracts(componentRef);
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
          item.metadata.tags?.includes("rbac") &&
          item.spec?.lifecycle === "production",
      )
      .map((entity) => ({
        entity,
        roles: this.collectRoles(entity),
      }));
  }

  collectRoles(contract: Entity): RoleInfo[] {
    return contract
      .relations!.filter(
        (r) =>
          r.type === RELATION_DEPENDS_ON &&
          parseEntityRef(r.targetRef).kind === "api",
      )
      .reduce<RoleInfo[]>((acc, r) => {
        const roleGroup = this.roleGroups.find(
          (e) => stringifyEntityRef(e) === r.targetRef,
        );
        if (roleGroup && roleGroup.spec && roleGroup.spec.members) {
          const specMembers = roleGroup.spec.members as JsonArray;
          const members = specMembers.reduce<MemberInfo[]>((accMembers, m) => {
            const member = this.entities.find(
              (e) =>
                e.spec?.type &&
                // filter out role-groups since they are modeled with
                // the same fields as a blockchain address
                e.spec.type.toString() !== "role-group" &&
                e.spec.address?.toString().toLowerCase() === m &&
                e.spec.network === roleGroup.spec?.network &&
                e.spec.networkType === roleGroup.spec?.networkType,
            );
            if (member) {
              const ownerRef = parseEntityRef(member.spec?.owner as string);
              const owner = this.entities.find(
                (e) => e.metadata.name === ownerRef.name,
              );
              return [...accMembers, { member, owner }];
            }
            return accMembers;
          }, []);
          return [...acc, { role: roleGroup, members }];
        }
        return acc;
      }, [])
      .sort((a, b) => a.role.metadata.name.localeCompare(b.role.metadata.name));
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
  roles: RoleInfo[];
};

type RoleInfo = {
  role: Entity;
  members: MemberInfo[];
};

type MemberInfo = {
  member: Entity;
  owner?: Entity;
};
