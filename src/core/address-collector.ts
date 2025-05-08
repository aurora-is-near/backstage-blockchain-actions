import { BaseCollector } from "./base-collector";
import { AddressInfo, CollectorOptions, MultiKeyInfo } from "../types";
import {
  RELATION_CONSUMES_API,
  RELATION_MEMBER_OF,
  RELATION_OWNER_OF,
  RELATION_API_CONSUMED_BY,
  parseEntityRef,
} from "@backstage/catalog-model";
import type { Entity } from "@backstage/catalog-model";

export class AddressCollector extends BaseCollector {
  collectAddresses(opts: CollectorOptions): AddressInfo[] {
    return this.getResourceEntities()
      .filter(
        (entity) =>
          (entity.spec?.type === "signer-address" ||
            entity.spec?.type?.toString().includes("-address")) &&
          (opts.lifecycle ? entity.spec?.lifecycle === opts.lifecycle : true) &&
          (opts.scope
            ? entity.spec?.owner?.toString().includes(opts.scope)
            : true),
      )
      .reduce<AddressInfo[]>((acc, signer) => {
        const contracts = signer
          .relations!.filter(
            (relation) =>
              relation.type === RELATION_CONSUMES_API &&
              this.entityCatalog[relation.targetRef] &&
              this.entityCatalog[relation.targetRef].spec?.type ===
                "contract-deployment",
          )
          .map((relation) => this.entityCatalog[relation.targetRef]);
        const roles = signer
          .relations!.filter(
            (relation) =>
              relation.type === RELATION_MEMBER_OF &&
              this.entityCatalog[relation.targetRef] &&
              this.entityCatalog[relation.targetRef].spec?.type ===
                "role-group",
          )
          .map((relation) => this.entityCatalog[relation.targetRef]);
        const keys = signer
          .relations!.filter(
            (relation) =>
              relation.type === RELATION_OWNER_OF &&
              this.entityCatalog[relation.targetRef] &&
              this.entityCatalog[relation.targetRef].spec?.type ===
                "access-key",
          )
          .map((relation) => this.entityCatalog[relation.targetRef]);
        return [...acc, { signer, contracts, roles, keys }];
      }, [])
      .filter(
        (info) =>
          info.keys?.length || info.contracts?.length || info.roles?.length,
      );
  }

  collectMultiKeyAccounts(opts: CollectorOptions): MultiKeyInfo[] {
    // Get all mainnet signer addresses with valid metadata and relations
    const signers = this.getResourceEntities().filter(
      (entity) =>
        entity.metadata?.name &&
        entity.spec?.type === "signer-address" &&
        entity.spec?.network === "near" &&
        entity.spec?.networkType === "mainnet" &&
        (opts.lifecycle ? entity.spec?.lifecycle === opts.lifecycle : true) &&
        (!opts.scope ||
          (typeof entity.spec?.owner?.toString() === "string" &&
            entity.spec.owner.toString().includes(opts.scope))),
    );

    // For each signer, collect their keys
    const multiKeyAccounts = signers.reduce<MultiKeyInfo[]>((acc, signer) => {
      // Skip signers without relations
      if (!signer.relations?.length) {
        return acc;
      }

      const keys = signer.relations
        .filter(
          (r) =>
            r.type === RELATION_API_CONSUMED_BY &&
            r.targetRef && // ensure targetRef exists
            parseEntityRef(r.targetRef).kind === "resource",
        )
        .map((r) => this.entityCatalog[r.targetRef])
        .filter((key): key is Entity => {
          if (key === undefined) return false;
          if (!key.metadata?.name) return false;
          return key.spec?.type === "access-key";
        });

      // Only include accounts with multiple keys
      if (keys.length > 1) {
        const owner = signer.spec?.owner
          ? this.entityCatalog[signer.spec.owner.toString()]
          : undefined;

        // Skip if owner exists but has no metadata
        if (owner && !owner.metadata?.name) {
          return acc;
        }

        // Skip if owner is required but not found
        if (!owner) {
          return acc;
        }

        return [
          ...acc,
          {
            signer,
            owner,
            keys,
            tags: this.getEntityTags(signer),
          },
        ];
      }
      return acc;
    }, []);

    return multiKeyAccounts.sort((a, b) =>
      (a.signer.metadata.name || "").localeCompare(
        b.signer.metadata.name || "",
      ),
    );
  }
}
