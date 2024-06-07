import type { JsonObject } from "@backstage/types";
import type { Entity } from "@backstage/catalog-model";
import { pick } from "../utils/pick";
import { CollectorOptions } from "../types";

const ALLOWED_KINDS = ["Component", "System", "API"];
const ALLOWED_SPEC_FIELDS = [
  "type",
  "deployedAt",
  "address",
  "network",
  "networkType",
];
const ALLOWED_METADATA_FIELDS = [
  "uid",
  "namespace",
  "name",
  "title",
  "annotations",
  "tags",
];

export class FilteredCollector {
  entities: Entity[];
  private srcEntities: Entity[];

  constructor(entities: Entity[], opts: CollectorOptions = {}) {
    this.srcEntities = entities;
    this.entities = this.filterEntities(opts);
  }

  filterSpec(spec?: JsonObject) {
    if (!spec) return {};
    return pick(spec, ALLOWED_SPEC_FIELDS);
  }

  filterMetadata(metadata: JsonObject) {
    return pick(metadata, ALLOWED_METADATA_FIELDS);
  }

  filterEntities(opts: CollectorOptions) {
    const source = opts.scope
      ? this.srcEntities.filter((e) => e.spec?.owner === opts.scope)
      : this.srcEntities;
    return source
      .filter((e) => ALLOWED_KINDS.includes(e.kind))
      .map((e) => {
        return {
          apiVersion: e.apiVersion,
          kind: e.kind,
          metadata: this.filterMetadata(e.metadata),
          spec: this.filterSpec(e.spec),
        } as Entity;
      });
  }
}
