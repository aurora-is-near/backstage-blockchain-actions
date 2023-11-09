import { BaseCollector } from "./base-collector";
import { CollectorOptions, SignerInfo } from "../types";
import {
  Entity,
  RELATION_API_CONSUMED_BY,
  parseEntityRef,
} from "@backstage/catalog-model";

export class AddressCollector extends BaseCollector {
  collectAddresses(opts: CollectorOptions): SignerInfo[] {
    const entities = opts.scope
      ? this.getResourceEntities().filter((e) => e.spec?.owner === opts.scope)
      : this.getResourceEntities();
    return entities
      .filter((e) => e.spec?.type === "signer-address")
      .map((signer) => {
        const owner = this.entityCatalog[signer.spec!.owner!.toString()];
        return {
          signer,
          owner,
          keys: this.collectKeys(signer),
        };
      })
      .sort((a, b) => this.sortByName(a.signer, b.signer));
  }

  collectKeys(contract: Entity): Entity[] {
    return contract
      .relations!.filter(
        (r) =>
          r.type === RELATION_API_CONSUMED_BY &&
          parseEntityRef(r.targetRef).kind === "resource",
      )
      .reduce<Entity[]>((acc, r) => {
        const accessKey = this.entityCatalog[r.targetRef];
        return [...acc, accessKey];
      }, [])
      .sort((a, b) => this.sortByName(a, b));
  }
}
