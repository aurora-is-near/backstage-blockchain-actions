import type { Entity } from "@backstage/catalog-model";

export class UnknownCollector {
  private entities: Entity[] = [];

  constructor(entities: Entity[]) {
    this.entities = entities;
  }

  public collectEntities(opts: CollectorOptions = {}): EntityInfo[] {
    return this.entities
      .reduce<EntityInfo[]>((acc, entity) => {
        if (opts.scope && entity.spec?.owner !== opts.scope) {
          return acc;
        }

        if (entity.metadata.namespace === "stub") {
          return [
            ...acc,
            {
              title: entity.metadata.title || entity.metadata.name,
              entity,
            },
          ];
        }
        return acc;
      }, [])
      .sort((a, b) =>
        a.entity.metadata.name.localeCompare(b.entity.metadata.name),
      );
  }
}

type CollectorOptions = {
  scope?: string;
};

type EntityInfo = {
  title: string;
  entity: Entity;
};
