import { BaseCollector } from "./base-collector";
import { AddressInfo, CollectorOptions } from "../types";
import {
  RELATION_CONSUMES_API,
  RELATION_MEMBER_OF,
  RELATION_OWNER_OF,
} from "@backstage/catalog-model";

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
}
