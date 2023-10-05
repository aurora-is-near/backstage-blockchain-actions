import core from "@actions/core";
import { sync } from "glob";
import type { Entity } from "@backstage/catalog-model";
import fs from "fs";
import { simpleGit } from "simple-git";
import handlebars from "handlebars";

import { MultisigsCollector } from "../core/multisigs-collector";
import { FilteredCollector } from "../core/filtered-collector";
import { getBackstageEntities } from "../utils/get-backstage-entities";

export class BackstageExport {
  backstage_url?: string;
  template_path?: string;
  output_path?: string;
  testing?: boolean;
}

export const backstageExport = async ({
  backstage_url,
  template_path,
  output_path,
  testing,
}: BackstageExport) => {
  if (!template_path || !output_path) {
    throw new Error(
      "set template_path and output_path for handlebars templating",
    );
  }

  const entities = await getBackstageEntities({ backstage_url });

  const multisigsCollector = new MultisigsCollector(entities);
  const filteredCollector = new FilteredCollector(entities);

  // console.log(JSON.stringify(multisigsCollector.systemComponents[0], null, 2));
  const changedFiles = sync(`${template_path}**/*.hbs`).reduce(
    (acc, templatePath) => {
      const templateData = {
        multisigSystemComponents: multisigsCollector.systemComponents,
        filteredEntities: JSON.stringify(filteredCollector.entities, null, 2),
        testing,
      };

      if (
        reexportTemplate({
          backstage_url,
          output_path,
          template_path,
          templatePath,
          templateData,
        })
      ) {
        return [templatePath, ...acc];
      }

      return acc;
    },
    [] as string[],
  );

  if (testing) {
    core.info(`Testing mode: ${changedFiles.length} changed files, exiting`);
    return true;
  }

  if (changedFiles.length === 0) {
    core.info("No changed files, nothing to commit");
    return false;
  }

  await commitAndPushChanges(output_path);
};

function reexportTemplate(
  inputs: BackstageExport & { templatePath: string; templateData: {} },
) {
  const outputPath =
    inputs.output_path! +
    inputs.templatePath.replace(inputs.template_path!, "").replace(".hbs", "");

  const compiledTemplate = handlebars.compile(
    fs.readFileSync(inputs.templatePath, { encoding: "utf8" }),
    {
      strict: true,
    },
  );

  const options = {
    helpers: {
      backstageLink: (entity: Entity) => {
        if (!entity) return "undefined";
        const md = entity.metadata;
        return `${inputs.backstage_url}/catalog/${md.namespace}/${entity.kind}/${md.name}`;
      },
    },
  };

  const compiledContent = compiledTemplate(inputs.templateData, options);

  const existingContent =
    fs.existsSync(outputPath) &&
    fs.readFileSync(outputPath, {
      encoding: "utf-8",
    });
  if (compiledContent !== existingContent) {
    core.info(`Writing ${outputPath}: changed content`);
    fs.writeFileSync(outputPath, compiledContent);
    return true;
  }
  return false;
}

async function commitAndPushChanges(path: string) {
  const git = simpleGit(".");
  await git.addConfig("user.email", "security@aurora.dev");
  await git.addConfig("user.name", "Backstage Exporter");
  await git.add(path);
  const msg = "chore(backstage): 🥷🏽 automatic re-export";
  await git.commit(msg, undefined);
  await git.push();
  core.info("Updated and pushed the changes");
  return true;
}
