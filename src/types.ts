import { Entity } from "@backstage/catalog-model";

export type CollectorOptions = {
  scope?: string;
  lifecycle?: string;
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
  tags?: string[];
};

export type ContractInfo = {
  entity: Entity;
  keys?: KeyInfo[];
  admins?: AdminInfo[];
  roles?: RoleInfo[];
  addresses?: SignerInfo[];
  tags?: string[];
};

export type MultisigInfo = {
  entity: Entity;
  signers: SignerInfo[];
  tags?: string[];
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
  tags?: string[];
}>;

export type SignerInfo = OwnedEntity<{
  signer: Entity;
  keys?: Entity[];
  tags?: string[];
}>;

export type AddressInfo = OwnedEntity<{
  signer: Entity;
  keys?: Entity[];
  roles?: Entity[];
  contracts?: Entity[];
}>;

export type MultiKeyInfo = {
  signer: Entity;
  owner: Entity;
  keys: Entity[];
  tags: string[];
};

type OwnedEntity<T> = {
  [K in keyof T]: T[K];
} & {
  owner?: Entity;
};
