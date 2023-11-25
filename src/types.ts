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
  admins?: AdminInfo[];
  roles?: RoleInfo[];
};

export type MultisigInfo = {
  entity: Entity;
  signers: SignerInfo[];
};

export type AdminInfo = {
  adminRole: Entity;
  members: MemberInfo[];
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

type OwnedEntity<T> = {
  [K in keyof T]: T[K];
} & {
  owner?: Entity;
};
