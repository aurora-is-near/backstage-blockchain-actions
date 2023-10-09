import type { JsonObject } from "@backstage/types";
import type { Entity } from "@backstage/catalog-model";
import { pick } from "./pick";

const ALLOWED_KINDS = ["Component", "System", "API"];
const ALLOWED_SPEC_FIELDS = [
  "type",
  "deployedAt",
  "address",
  "network",
  "networkType",
  "deployment.source.startBlock",
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

  constructor(entities: Entity[]) {
    this.srcEntities = entities;
    this.entities = this.filterEntities();
  }

  filterSpec(spec?: JsonObject) {
    if (!spec) return {};
    return pick(spec, ALLOWED_SPEC_FIELDS);
  }

  filterMetadata(metadata: JsonObject) {
    return pick(metadata, ALLOWED_METADATA_FIELDS);
  }

  filterEntities() {
    return this.srcEntities
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
