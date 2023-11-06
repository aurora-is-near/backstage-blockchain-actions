import { type Entity } from "@backstage/catalog-model";
import { AccessKeyCollector } from "./access-key-collector";
import { MultisigsCollector } from "./multisigs-collector";
import { RbacCollector } from "./rbac-collector";

export class UnknownCollector {
  private entities: Entity[] = [];

  constructor(entities: Entity[]) {
    this.entities = entities;
  }

  public collectEntities(opts: CollectorOptions = {}): SystemInfo[] {
    const accessKeyCollector = new AccessKeyCollector(this.entities, opts);
    const multisigCollector = new MultisigsCollector(this.entities, opts);
    const rbacCollector = new RbacCollector(this.entities, opts);
    const unknownMultisigs = multisigCollector.systemComponents
      .reduce<SystemInfo[]>((acc, system) => {
        return [
          ...acc,
          {
            ...system,
            components: system.components
              .map((component) => {
                return {
                  ...component,
                  multisigs: component.multisigs.filter((m) =>
                    m.signers.some(
                      (info) => info.signer.metadata.namespace === "stub",
                    ),
                  ),
                };
              })
              .filter((component) =>
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

    const unknownRbac = rbacCollector.systemComponents
      .reduce<SystemInfo[]>((acc, system) => {
        return [
          ...acc,
          {
            ...system,
            components: system.components
              .map((component) => {
                return {
                  ...component,
                  contracts: component.contracts.filter((contract) =>
                    contract.roles.some((info) =>
                      info.members.some(
                        (m) => m.member.metadata.namespace === "stub",
                      ),
                    ),
                  ),
                };
              })
              .filter((component) =>
                component.contracts.some((contract) =>
                  contract.roles.some((info) =>
                    info.members.some(
                      (m) => m.member?.metadata.namespace === "stub",
                    ),
                  ),
                ),
              ),
          },
        ];
      }, [])
      .filter((system) => system.components.length > 0);

    const unknownAccessKeys = accessKeyCollector.systemComponents
      .reduce<SystemInfo[]>((acc, system) => {
        return [
          ...acc,
          {
            ...system,
            components: system.components.filter((component) =>
              component.contracts.some((contract) =>
                contract.keys.some(
                  (key) => key.key.metadata.namespace === "stub",
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

type CollectorOptions = {
  scope?: string;
};

type SystemInfo = {
  title: string;
  system: Entity;
  components: ComponentInfo[];
};

type ComponentInfo = {
  title: string;
  component: Entity;
  contracts?: ContractInfo[];
  multisigs?: MultisigInfo[];
};

type ContractInfo = {
  entity: Entity;
  keys?: KeyInfo[];
  roles?: RoleInfo[];
};

type MultisigInfo = {
  entity: Entity;
  signers: SignerInfo[];
};

type RoleInfo = {
  role: Entity;
  members: MemberInfo[];
};

type MemberInfo = {
  member: Entity;
  owner?: Entity;
};

type KeyInfo = {
  key: Entity;
  owner?: Entity;
};

type SignerInfo = {
  signer: Entity;
  owner?: Entity;
};
