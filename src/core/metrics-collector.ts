import {
  RELATION_API_CONSUMED_BY,
  parseEntityRef,
} from "@backstage/catalog-model";
import type { Entity } from "@backstage/catalog-model";
import { BaseCollector } from "./base-collector";
import { CollectorOptions, MultisigInfo, SignerInfo } from "../types";
import { MultisigsCollector } from "./multisigs-collector";

export class MetricsCollector extends BaseCollector {
  private multisigInfos: MultisigInfo[] = [];
  private apiEntities: Entity[] = [];
  private resourceEntities: Entity[] = [];
  private contracts: Entity[] = [];
  private accessKeys: Entity[] = [];

  constructor(entities: Entity[], opts: CollectorOptions = {}) {
    super(entities);
    this.apiEntities = this.getApiEntities();
    this.resourceEntities = this.getResourceEntities();
    this.contracts = this.apiEntities.filter(
      (item) => item.spec?.type === "contract-deployment",
    );
    this.accessKeys = this.resourceEntities.filter(
      (item) => item.spec?.type === "access-key",
    );
    this.multisigInfos = new MultisigsCollector(entities)
      .collectSystems(opts)
      .flatMap((system) =>
        system.components.flatMap((component) => component.multisigs),
      )
      .filter<MultisigInfo>(this.isDefined);
  }

  getAllApis() {
    return this.apiEntities;
  }

  getAllResources() {
    return this.resourceEntities;
  }

  getMultisigs() {
    return this.multisigInfos;
  }

  getNearContracts() {
    return this.contracts.filter((entity) => entity.spec?.network === "near");
  }

  getSigners() {
    const allSigners = this.getMultisigs().flatMap((ms) => ms.signers);
    const uniqueSigners = allSigners.reduce<{ [uid: string]: SignerInfo }>(
      (acc, signer) => {
        const uid = signer.signer.metadata.uid;
        if (uid && uid in allSigners) {
          return acc;
        }
        if (!this.isQualifiedEntity(signer.signer)) {
          return acc;
        }
        return { ...acc, [uid as string]: signer };
      },
      {},
    );
    return Object.values(uniqueSigners);
  }

  getMultisigAccessKeys(): Entity[] {
    const signers = this.getSigners().filter(
      (value) => value.signer.spec?.network === "near",
    );
    const keys = signers.flatMap((value) => {
      if (!value.signer.relations) {
        return [];
      }
      return value.signer.relations
        .filter(
          (r) =>
            r.type === RELATION_API_CONSUMED_BY &&
            parseEntityRef(r.targetRef).kind === "resource",
        )
        .map((relation) => {
          const key = this.entityCatalog[relation.targetRef];
          return key;
        });
    });

    return keys.filter<Entity>(this.isEntity).filter(this.isQualifiedEntity);
  }

  getAccessKeysPerSigner() {
    const signers = this.getSigners().filter(
      (value) => value.signer.spec?.network === "near",
    );
    const keysPerSigner = signers.reduce<{
      [s: string]: SignerInfo & { keys: Entity[] };
    }>((acc, value) => {
      if (!value.signer.relations) {
        return acc;
      }
      const spec = JSON.parse(JSON.stringify(value.signer.spec));
      const signer: string = spec.address;
      const keys = value.signer.relations
        .filter(
          (r) =>
            r.type === RELATION_API_CONSUMED_BY &&
            parseEntityRef(r.targetRef).kind === "resource",
        )
        .map((relation) => {
          const key = this.entityCatalog[relation.targetRef];
          return key;
        })
        .filter<Entity>(this.isEntity);

      return {
        ...acc,
        [signer]: {
          owner: value.owner,
          signer: value.signer,
          keys,
        },
      };
    }, {});

    return keysPerSigner;
  }

  getContractAccessKeys(): Entity[] {
    const keys = this.contracts.flatMap((value) => {
      if (!value.relations) {
        return [];
      }
      return value.relations
        .filter(
          (r) =>
            r.type === RELATION_API_CONSUMED_BY &&
            parseEntityRef(r.targetRef).kind === "resource",
        )
        .map((relation) => {
          const key = this.entityCatalog[relation.targetRef];
          return key;
        });
    });
    return keys.filter<Entity>(this.isEntity);
  }

  getAllAccessKeys(): Entity[] {
    return this.accessKeys;
  }

  getDeprecatedAccessKeys(): Entity[] {
    const keys = this.getAllAccessKeys();
    const deprecated = keys.filter(
      (entity) => entity.metadata.tags?.includes("deprecated"),
    );
    return deprecated;
  }

  getUnknownAccessKeys(): Entity[] {
    const keys = this.getAllAccessKeys();
    const unknown = keys.filter(
      (entity) => entity.metadata.tags?.includes("unknown"),
    );
    return unknown;
  }

  private isQualifiedEntity(entity: Entity) {
    return (
      !entity.metadata.tags?.includes("retired") &&
      !entity.metadata.tags?.includes("allow-unknown")
    );
  }

  private isEntity(entity: Entity | undefined): entity is Entity {
    return entity !== undefined;
  }

  private isDefined<T = unknown>(entity: T | undefined): entity is T {
    return entity !== undefined;
  }
}
