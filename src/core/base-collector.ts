import {
  isApiEntity,
  isResourceEntity,
  isSystemEntity,
  isUserEntity,
  stringifyEntityRef,
} from "@backstage/catalog-model";
import type { Entity } from "@backstage/catalog-model";
import { EntityCatalog } from "../types";

export class BaseCollector {
  entities: Entity[] = [];
  entityCatalog: EntityCatalog = {};

  constructor(entities: Entity[]) {
    this.entities = entities;
    this.entityCatalog = entities.reduce(
      (acc, e) => ({ ...acc, [stringifyEntityRef(e)]: e }),
      {},
    );
  }

  getSystemEntities(): Entity[] {
    return this.entities.filter(isSystemEntity).sort(this.sortByName);
  }

  getApiEntities(): Entity[] {
    return this.entities.filter(isApiEntity).sort(this.sortByName);
  }

  getResourceEntities(): Entity[] {
    return this.entities.filter(isResourceEntity).sort(this.sortByName);
  }

  getUserEntities(): Entity[] {
    return this.entities.filter(isUserEntity).sort(this.sortByName);
  }

  getEntityTags(entity: Entity): string[] {
    return entity.metadata.tags || [];
  }

  sortByName(a: Entity, b: Entity) {
    return a.metadata.name.localeCompare(b.metadata.name);
  }
}
