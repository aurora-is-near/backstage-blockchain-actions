/*
Copyright 2022 Aurora Labs
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    https://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import * as core from "@actions/core";
import { context } from "@actions/github";
import { getChangedFiles } from "../utils/get-changed-files";
import { Entity } from "@backstage/catalog-model";
import { join } from "path";
import { existsSync, readFileSync } from "fs";
import { sync } from "glob";
import { getBackstageEntities } from "../utils/get-backstage-entities";

export class GenerateComponentMatrix {
  backstage_url?: string;
  backstage_entities_repo?: string;
  force_all_checks?: string;
  ignore_failures?: string;
}

const DEFAULT_GO_VERSION = "1.18";

function parseGoVersion(modFilePath: string): string {
  if (existsSync(modFilePath)) {
    const regex = /^go\s+(\S+)/m;
    const match = regex.exec(readFileSync(modFilePath, "utf8"));
    if (match) return match[1];
  }
  core.warning("unable to detect go version");
  return DEFAULT_GO_VERSION;
}

function securityTier(entity: Entity) {
  if (!entity.metadata.annotations) return -1;
  const tier = entity.metadata.annotations["aurora.dev/security-tier"];
  if (!tier) return -1;
  return parseInt(tier, 10);
}

// the annotation will have "url:" prefix - not a relative path
function sourceLocation(entity: Entity) {
  if (!entity.metadata.annotations) return;
  const loc = entity.metadata.annotations["backstage.io/source-location"];
  return loc;
}

function sourceLocationRelative(entity: Entity) {
  const loc = sourceLocation(entity)!;
  return loc.split("/").slice(7).join("/");
}

function sourceLocationDir(entity: Entity) {
  const loc = sourceLocation(entity)!;
  return loc.split("/").slice(7, -1).join("/");
}

function explicitRelativeLocation(loc: string) {
  if (loc.startsWith("./")) return loc;
  return [".", ...loc.split("/")].join("/");
}

/**
 * Finds the first parent directory that contains rootFile.
 * If the rootFile is not found, returns ./
 */
function findRoot(dirName: string, rootFile: string) {
  const dirs = dirName.split("/");
  core.info(`searching ${rootFile} for ${dirName}`);

  for (;;) {
    const testFile = join("./", ...dirs, rootFile);
    core.info(`checking: ${testFile}`);
    if (existsSync(testFile)) {
      core.info(`Found ${rootFile} root for ${dirName}:`);
      core.info(dirs.join("/"));
      break;
    }
    if (dirs.length === 0) {
      core.info(`Unable to find ${rootFile} for ${dirName}, using the default`);
      break;
    }
    dirs.pop();
  }
  return dirs.length > 0 ? dirs.join("/") : ".";
}

function hasInRoot(dirName: string, rootFilePattern: string) {
  const dirs = dirName.split("/");
  const testFilePattern = join("./", ...dirs, rootFilePattern);
  if (sync(testFilePattern).length > 0) {
    core.info(`Found ${testFilePattern}`);
    return true;
  }
  core.info(`Unable to find ${rootFilePattern} in ${dirName}`);
  return false;
}

function inspectComponents(message: string, items: Entity[]) {
  core.info(`${message} (${items.length}):`);
  items.forEach((item) =>
    core.info(` - ${item.metadata.name} at "${sourceLocationRelative(item)}"`),
  );
}

function componentConfig(
  item: Entity,
  runTests: boolean,
  ignoreFailures: boolean,
) {
  const path = sourceLocationDir(item)!;

  const isSolidity = hasInRoot(path, "**/*.sol");
  const isRust = hasInRoot(path, "Cargo.toml");
  const isGo = hasInRoot(path, "go.mod");
  const isNode = hasInRoot(path, "package.json");

  const runSlither = isSolidity && runTests;
  const runClippy = isRust && runTests;
  const runGoStaticChecks = isGo && runTests;
  const runBiome = isNode && runTests;

  // Slither is executed from monorepo's root, not from the "path"
  // with the path passed as a target
  // because of that the slither config will be in a subdir of the working dir
  // and slither action won't find it automatically
  const slitherArgs = hasInRoot(path, "slither.config.json")
    ? `--config-file ${explicitRelativeLocation(path)}/slither.config.json`
    : '--filter-paths "node_modules|testing|test|lib" --exclude timestamp,solc-version,naming-convention,assembly-usage';

  return {
    name: item.metadata.name,
    tags: item.metadata.tags,
    path,
    securityTier: securityTier(item),

    nodeRoot: findRoot(path, "package.json"),
    goVersion: parseGoVersion("go.mod"),

    runSlither,
    slitherArgs,
    runClippy,
    runGoStaticChecks,
    runBiome,
    ignoreFailures,
    // backwards compatibility
    allowTestsToFail: ignoreFailures,
  };
}

function runTestsPolicy(
  entity: Entity,
  changed: boolean,
  eventName?: string,
  workflow_force_all_checks_flag?: string,
) {
  if (workflow_force_all_checks_flag) {
    core.info(
      `${entity.metadata.name}: CI runs because of workflow config (force_all_checks: true)`,
    );
    return true;
  }
  if (eventName !== "pull_request") {
    core.info(`${entity.metadata.name}: CI runs because it's not a PR`);
    return true;
  }
  if (entity.metadata.tags?.includes("ci-sec-changed-only")) {
    core.info(
      `${entity.metadata.name}: CI runs for changed only (changed: ${changed}) - via ci-sec-changed-only tag`,
    );
    return changed;
  }
  core.info(
    `${entity.metadata.name}: CI runs by default for all components (changed: ${changed}) - no ci-sec-changed-only tag`,
  );
  return true;
}

function ignoreFailuresPolicy(
  entity: Entity,
  _changed: boolean,
  _eventName?: string,
  workflow_ignore_failures?: string,
) {
  if (workflow_ignore_failures) {
    core.info(
      `${entity.metadata.name}: ignoring failures because of workflow config (ignore_failures: true)`,
    );
    return true;
  }
  if (entity.metadata.tags?.includes("ci-sec-disable")) {
    core.info(
      `${entity.metadata.name}: ignoring falures via ci-sec-disable tag`,
    );
    return true;
  }

  const tier = securityTier(entity);
  const ignoreFailures = tier < 0;
  core.info(
    `${entity.metadata.name}: CI runs will ignore failures based on security tier (${tier}: ${ignoreFailures})`,
  );
  return ignoreFailures;
}

export const generateComponentMatrix = async ({
  backstage_url,
  backstage_entities_repo,
  force_all_checks,
  ignore_failures,
}: GenerateComponentMatrix) => {
  const entities = await getBackstageEntities({
    backstage_url,
    backstage_entities_repo,
  });

  const serverUrl = process.env.GITHUB_SERVER_URL || "https://github.com";
  const repoUrl = [serverUrl, context.repo.owner, context.repo.repo].join("/");

  const componentItems = entities
    .filter((item) => sourceLocation(item)?.startsWith(`url:${repoUrl}/`))
    .filter((item) => item.kind === "Component");

  inspectComponents("Component entities in this repo", componentItems);

  const eventName = process.env.GITHUB_EVENT_NAME;
  const changedFiles = await getChangedFiles(eventName);

  core.info(`Changed files count: ${changedFiles.length}`);

  const changedComponents = componentItems.filter((item) =>
    changedFiles.some((file) => {
      const loc = sourceLocationRelative(item)!;
      return file.file.startsWith(loc);
    }),
  );

  inspectComponents("Changed components", changedComponents);

  core.info("Generating component matrix...");
  const matrix = {
    include: componentItems.map((item) => {
      const changed = changedComponents.includes(item);
      const runTests = runTestsPolicy(
        item,
        changed,
        eventName,
        force_all_checks,
      );
      const ignoreFailures = ignoreFailuresPolicy(
        item,
        changed,
        eventName,
        ignore_failures,
      );
      return componentConfig(item, runTests, ignoreFailures);
    }),
  };

  core.info(JSON.stringify(matrix, null, 2));

  return matrix;
};
