import { BaseCollector } from "./base-collector";
import {
  CollectorOptions,
  ComponentInfo,
  ContractInfo,
  SignerInfo,
  SystemInfo,
} from "../types";
import {
  Entity,
  RELATION_API_CONSUMED_BY,
  RELATION_HAS_PART,
  RELATION_PROVIDES_API,
  parseEntityRef,
} from "@backstage/catalog-model";

export class AddressCollector extends BaseCollector {
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

  collectComponents(system: Entity, opts: CollectorOptions): ComponentInfo[] {
    return system
      .relations!.filter(
        (r) =>
          r.type === RELATION_HAS_PART &&
          parseEntityRef(r.targetRef).kind === "component",
      )
      .reduce<ComponentInfo[]>((acc, componentRef) => {
        const component = this.entityCatalog[componentRef.targetRef];
        const contracts = this.collectContracts(component, opts).filter(
          (c) => c.addresses && c.addresses.length > 0,
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
      .sort((a, b) => this.sortByName(a.component, b.component));
  }

  collectContracts(component: Entity, opts: CollectorOptions): ContractInfo[] {
    return component
      .relations!.filter(
        (r) =>
          r.type === RELATION_PROVIDES_API &&
          parseEntityRef(r.targetRef).kind === "api",
      )
      .map((contractRef) => {
        const entity = this.entityCatalog[contractRef.targetRef];
        return {
          entity,
          addresses: this.collectAddresses(entity, opts),
        };
      })
      .sort((a, b) => this.sortByName(a.entity, b.entity));
  }

  collectAddresses(contract: Entity, opts: CollectorOptions): SignerInfo[] {
    return contract
      .relations!.filter(
        (r) =>
          r.type === RELATION_API_CONSUMED_BY &&
          parseEntityRef(r.targetRef).kind === "resource" &&
          this.entityCatalog[r.targetRef]?.spec?.type
            ?.toString()
            .includes("address") &&
          (opts.scope
            ? contract.spec?.owner?.toString().includes(opts.scope)
            : true),
      )
      .map((resource) => {
        const signer = this.entityCatalog[resource.targetRef];
        return {
          signer,
          ...(signer.spec?.owner
            ? { owner: this.entityCatalog[signer.spec!.owner.toString()] }
            : {}),
        };
      })
      .sort((a, b) => this.sortByName(a.signer, b.signer));
  }
}
