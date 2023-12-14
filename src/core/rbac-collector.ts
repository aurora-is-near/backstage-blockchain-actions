import {
  stringifyEntityRef,
  parseEntityRef,
  RELATION_API_PROVIDED_BY,
  RELATION_DEPENDS_ON,
  RELATION_HAS_PART,
} from "@backstage/catalog-model";
import type { Entity, EntityRelation } from "@backstage/catalog-model";
import type { JsonArray } from "@backstage/types";
import { BaseCollector } from "./base-collector";
import {
  AdminInfo,
  CollectorOptions,
  ComponentInfo,
  ContractInfo,
  MemberInfo,
  RoleInfo,
  SystemInfo,
} from "../types";

export class RbacCollector extends BaseCollector {
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

        const contracts = this.collectContracts(componentRef);
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
          item.spec.lifecycle === "production" &&
          item.metadata.tags?.includes("rbac") &&
          item.relations!.some(
            (r) =>
              r.type === RELATION_API_PROVIDED_BY &&
              r.targetRef === componentRef.targetRef,
          ),
      )
      .map((entity) => ({
        entity,
        admins: this.collectAdmins(entity),
        roles: this.collectRoles(entity),
        tags: this.getEntityTags(entity),
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
        const roleGroup = this.entityCatalog[r.targetRef];
        if (
          roleGroup &&
          roleGroup.spec &&
          roleGroup.spec.members &&
          roleGroup.spec.roleId !== roleGroup.spec.admin
        ) {
          const specMembers = roleGroup.spec.members as JsonArray;
          const members = specMembers.reduce<MemberInfo[]>((accMembers, m) => {
            const member = this.entities.find(
              (e) =>
                e.spec &&
                // filter out role-groups since they are modeled with
                // the same fields as a blockchain address
                e.spec.type !== "role-group" &&
                e.spec.address?.toString().toLowerCase() === m &&
                e.spec.network === roleGroup.spec?.network &&
                e.spec.networkType === roleGroup.spec?.networkType,
            );
            if (member) {
              const ownerRef = parseEntityRef(member.spec?.owner as string);
              const owner = this.entityCatalog[stringifyEntityRef(ownerRef)];
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

  collectAdmins(contract: Entity): AdminInfo[] {
    return contract
      .relations!.filter(
        (r) =>
          r.type === RELATION_DEPENDS_ON &&
          parseEntityRef(r.targetRef).kind === "api",
      )
      .reduce<AdminInfo[]>((acc, r) => {
        const roleGroup = this.entityCatalog[r.targetRef];
        if (roleGroup && roleGroup.spec?.roleId === roleGroup.spec?.admin) {
          const specMembers = roleGroup.spec?.members as JsonArray;
          const members = specMembers.reduce<MemberInfo[]>((accMembers, m) => {
            const member = this.entities.find(
              (e) =>
                e.spec &&
                // filter out role-groups since they are modeled with
                // the same fields as a blockchain address
                e.spec.type !== "role-group" &&
                e.spec.address?.toString().toLowerCase() === m &&
                e.spec.network === roleGroup.spec?.network &&
                e.spec.networkType === roleGroup.spec?.networkType,
            );
            if (member) {
              const ownerRef = parseEntityRef(member.spec?.owner as string);
              const owner = this.entityCatalog[stringifyEntityRef(ownerRef)];
              return [...accMembers, { member, owner }];
            }
            return accMembers;
          }, []);
          return [...acc, { adminRole: roleGroup, members }];
        }
        return acc;
      }, [])
      .sort((a, b) => this.sortByName(a.adminRole, b.adminRole));
  }
}
