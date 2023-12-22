import { type Entity } from "@backstage/catalog-model";
import { AccessKeyCollector } from "./access-key-collector";
import { MultisigsCollector } from "./multisigs-collector";
import { RbacCollector } from "./rbac-collector";
import { CollectorOptions, SystemInfo } from "../types";

export class UnknownCollector {
  private entities: Entity[] = [];

  constructor(entities: Entity[]) {
    this.entities = entities;
  }

  public collectEntities(opts: CollectorOptions = {}): SystemInfo[] {
    const accessKeyCollector = new AccessKeyCollector(this.entities);
    const multisigCollector = new MultisigsCollector(this.entities);
    const rbacCollector = new RbacCollector(this.entities);
    const unknownMultisigs = multisigCollector
      .collectSystems(opts)
      .reduce<SystemInfo[]>((acc, system) => {
        return [
          ...acc,
          {
            ...system,
            components: system.components
              .map((component) => {
                return {
                  ...component,
                  multisigs:
                    component.multisigs &&
                    component.multisigs.filter((multisig) =>
                      multisig.signers.some(
                        (info) => info.signer.metadata.namespace === "stub",
                      ),
                    ),
                };
              })
              .filter(
                (component) =>
                  component.multisigs &&
                  component.multisigs.some((multisig) =>
                    multisig.signers.some(
                      (info) => info.signer.metadata.namespace === "stub",
                    ),
                  ),
              ),
          },
        ];
      }, [])
      .filter((system) => system.components.length > 0);

    const unknownRbac = rbacCollector
      .collectSystems(opts)
      .reduce<SystemInfo[]>((acc, system) => {
        return [
          ...acc,
          {
            ...system,
            components: system.components
              .map((component) => {
                return {
                  ...component,
                  contracts:
                    component.contracts &&
                    component.contracts.filter(
                      (contract) =>
                        contract.roles &&
                        contract.roles.some((role) =>
                          role.members.some(
                            (info) => info.member.metadata.namespace === "stub",
                          ),
                        ),
                    ),
                };
              })
              .filter(
                (component) =>
                  component.contracts &&
                  component.contracts.some(
                    (contract) =>
                      contract.roles &&
                      contract.roles.some((role) =>
                        role.members.some(
                          (info) => info.member.metadata.namespace === "stub",
                        ),
                      ),
                  ),
              ),
          },
        ];
      }, [])
      .filter((system) => system.components.length > 0);

    const unknownAccessKeys = accessKeyCollector
      .collectSystems(opts)
      .reduce<SystemInfo[]>((acc, system) => {
        return [
          ...acc,
          {
            ...system,
            components: system.components.filter(
              (component) =>
                component.contracts &&
                component.contracts.some(
                  (contract) =>
                    contract.keys &&
                    contract.keys.some(
                      (info) => info.key.metadata.namespace === "stub",
                    ),
                ),
            ),
          },
        ];
      }, [])
      .filter((system) => system.components.length > 0);
    return [...unknownAccessKeys, ...unknownRbac, ...unknownMultisigs];
  }
}
