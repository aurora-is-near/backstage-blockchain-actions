import { Entity } from "@backstage/catalog-model";

export type CollectorOptions = {
  scope?: string;
};

export type EntityCatalog = {
  [ref: string]: Entity;
};

export type SystemInfo = {
  title: string;
  system: Entity;
  components: ComponentInfo[];
};

export type ComponentInfo = {
  title: string;
  component: Entity;
  contracts?: ContractInfo[];
  multisigs?: MultisigInfo[];
};

export type ContractInfo = {
  entity: Entity;
  keys?: KeyInfo[];
  roles?: RoleInfo[];
  addresses?: SignerInfo[];
};

export type MultisigInfo = {
  entity: Entity;
  signers: SignerInfo[];
};

export type RoleInfo = {
  role: Entity;
  members: MemberInfo[];
};

export type MemberInfo = OwnedEntity<{
  member: Entity;
}>;

export type KeyInfo = OwnedEntity<{
  key: Entity;
}>;

export type SignerInfo = OwnedEntity<{
  signer: Entity;
  keys?: Entity[];
}>;

export type AddressInfo = OwnedEntity<{
  signer: Entity;
  keys?: Entity[];
  roles?: Entity[];
  contracts?: Entity[];
}>;

type OwnedEntity<T> = {
  [K in keyof T]: T[K];
} & {
  owner?: Entity;
};
