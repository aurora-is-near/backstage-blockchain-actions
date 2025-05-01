import {
  RELATION_API_CONSUMED_BY,
  RELATION_API_PROVIDED_BY,
  parseEntityRef,
} from "@backstage/catalog-model";
import type { Entity } from "@backstage/catalog-model";
import {
  AccessKeyEntity,
  ContractDeploymentEntity,
  MultisigDeploymentEntity,
  SignerEntity,
  isAccessKey,
  isContractDeployment,
  isMultisigDeployment,
  isSigner,
} from "@aurora-is-near/backstage-plugin-blockchainradar-common";
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
    return this.apiEntities
      .filter(isContractDeployment)
      .filter((entity) => entity.spec?.network === "near");
  }

  getNearSigners() {
    return this.resourceEntities
      .filter(isSigner)
      .filter((entity) => entity.spec?.network === "near");
  }

  // to find signers that are part of a multisig council
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

  getMultisigPolicies() {
    const multisigs = this.getMultisigs();
    const policies = multisigs.reduce<
      Array<{ entity: MultisigDeploymentEntity; policy: number }>
    >((acc, { entity }) => {
      if (
        !isMultisigDeployment(entity) ||
        !entity.spec.multisig ||
        !entity.spec.multisig.policy
      ) {
        return acc;
      }
      return [
        ...acc,
        {
          entity,
          policy:
            entity.spec.multisig.policy.threshold /
            (entity.spec.multisig.policy.owners || 1),
        },
      ];
    }, []);

    return policies;
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
    const signers = this.getNearSigners();
    const keysPerSigner = signers.reduce<
      Array<{
        entity: SignerEntity;
        keys: AccessKeyEntity[];
      }>
    >((acc, entity) => {
      if (!entity.relations || entity.relations.length === 0) {
        return acc;
      }
      return [
        ...acc,
        {
          entity,
          keys: entity.relations.reduce<AccessKeyEntity[]>(
            (accKeys, relation) => {
              const key = this.entityCatalog[relation.targetRef];
              if (
                relation.type !== RELATION_API_CONSUMED_BY ||
                !key ||
                !isAccessKey(key)
              ) {
                return accKeys;
              }
              return [...accKeys, key];
            },
            [],
          ),
        },
      ];
    }, []);

    return keysPerSigner;
  }

  getAccessKeysPerContract() {
    const contracts = this.getNearContracts();
    const keysPerContract = contracts.reduce<
      Array<{
        entity: ContractDeploymentEntity;
        component: string | undefined;
        keys: AccessKeyEntity[];
      }>
    >((acc, entity) => {
      if (!entity.relations || entity.relations.length === 0) {
        return acc;
      }
      const component = entity.relations.find(
        (relation) => relation.type === RELATION_API_PROVIDED_BY,
      );
      return [
        ...acc,
        {
          entity,
          component: component?.targetRef,
          keys: entity.relations.reduce<AccessKeyEntity[]>(
            (accKeys, relation) => {
              const key = this.entityCatalog[relation.targetRef];
              if (
                relation.type !== RELATION_API_CONSUMED_BY ||
                !key ||
                !isAccessKey(key)
              ) {
                return accKeys;
              }
              return [...accKeys, key];
            },
            [],
          ),
        },
      ];
    }, []);
    return keysPerContract;
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
