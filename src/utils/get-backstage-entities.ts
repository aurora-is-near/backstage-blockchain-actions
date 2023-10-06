import * as core from "@actions/core";
import { CatalogClient } from "@backstage/catalog-client";
import type { Entity } from "@backstage/catalog-model";
import { simpleGit } from "simple-git";

interface GetBackstageEntities {
  backstage_url?: string;
  backstage_entities_repo?: string;
}

async function getFileContentFromRepo(
  repoUrl: string,
  filePath: string,
): Promise<string> {
  const cloneDir = `/tmp/github-helpers-${Date.now()}`;
  const git = simpleGit();

  try {
    await git.clone(repoUrl, cloneDir, ["--depth=1"]);
    await git.cwd(cloneDir);

    const { current } = await git.branch();
    const defaultBranch = current || "main";
    const fileContent: string = await git.show([
      `${defaultBranch}:${filePath}`,
    ]);

    await git.raw(["rm", "-rf", "."]);
    return fileContent;
  } catch (error) {
    throw new Error(`Failed to fetch ${repoUrl}/${filePath}: ${error}`);
  }
}

async function fetchBackstageEntitiesFromURL(backstageUrl: string) {
  core.info("Connecting to Backstage to fetch available entities");

  const discoveryApi = {
    async getBaseUrl() {
      return `${backstageUrl}/api/catalog`;
    },
  };
  const catalogClient = new CatalogClient({
    discoveryApi,
  });

  const entities = await catalogClient.getEntities({});
  core.info(`Total backstage entities: ${entities.items.length}`);

  return entities.items;
}

async function fetchBackstageEntitiesFromRepo(backstageEntitiesRepo: string) {
  const serverUrl = process.env.GITHUB_SERVER_URL || "https://github.com";
  const repoUrl = `${serverUrl}/${backstageEntitiesRepo}`;
  core.info(`Cloning ${repoUrl}`);
  const content = await getFileContentFromRepo(
    repoUrl,
    "filteredEntities.json",
  );
  return JSON.parse(content) as Entity[];
}

export const getBackstageEntities = async ({
  backstage_url: backstageUrl,
  backstage_entities_repo: backstageEntitiesRepo,
}: GetBackstageEntities) => {
  // repo takes a priority over the URL in order to avoid unnecessary runtime
  // dependency
  if (backstageEntitiesRepo) {
    return fetchBackstageEntitiesFromRepo(backstageEntitiesRepo);
  } else if (backstageUrl) {
    return fetchBackstageEntitiesFromURL(backstageUrl);
  }
  throw new Error(
    "Backstage URL or entities repo is required. Set BACKSTAGE_URL (github secret) or pass backstage_entities_repo argument to this action",
  );
};
