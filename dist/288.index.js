"use strict";
exports.id = 288;
exports.ids = [288];
exports.modules = {

/***/ 80288:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.generateComponentMatrix = exports.GenerateComponentMatrix = void 0;
const core = __importStar(__webpack_require__(68434));
const github_1 = __webpack_require__(86764);
const get_changed_files_1 = __webpack_require__(87473);
const path_1 = __webpack_require__(71017);
const fs_1 = __webpack_require__(57147);
const glob_1 = __webpack_require__(17364);
const get_backstage_entities_1 = __webpack_require__(53249);
class GenerateComponentMatrix {
}
exports.GenerateComponentMatrix = GenerateComponentMatrix;
const DEFAULT_GO_VERSION = "1.18";
function parseGoVersion(modFilePath) {
    if ((0, fs_1.existsSync)(modFilePath)) {
        const regex = /^go\s+(\S+)/m;
        const match = regex.exec((0, fs_1.readFileSync)(modFilePath, "utf8"));
        if (match)
            return match[1];
    }
    core.warning("unable to detect go version");
    return DEFAULT_GO_VERSION;
}
function securityTier(entity) {
    if (!entity.metadata.annotations)
        return -1;
    const tier = entity.metadata.annotations["aurora.dev/security-tier"];
    if (!tier)
        return -1;
    return parseInt(tier, 10);
}
// the annotation will have "url:" prefix - not a relative path
function sourceLocation(entity) {
    if (!entity.metadata.annotations)
        return;
    const loc = entity.metadata.annotations["backstage.io/source-location"];
    return loc;
}
function sourceLocationRelative(entity) {
    const loc = sourceLocation(entity);
    return loc.split("/").slice(7).join("/");
}
function sourceLocationDir(entity) {
    const loc = sourceLocation(entity);
    return loc.split("/").slice(7, -1).join("/");
}
function explicitRelativeLocation(loc) {
    if (loc.startsWith("./"))
        return loc;
    return [".", ...loc.split("/")].join("/");
}
/**
 * Finds the first parent directory that contains rootFile.
 * If the rootFile is not found, returns ./
 */
function findRoot(dirName, rootFile) {
    const dirs = dirName.split("/");
    core.info(`searching ${rootFile} for ${dirName}`);
    for (;;) {
        const testFile = (0, path_1.join)("./", ...dirs, rootFile);
        core.info(`checking: ${testFile}`);
        if ((0, fs_1.existsSync)(testFile)) {
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
function hasInRoot(dirName, rootFilePattern) {
    const dirs = dirName.split("/");
    const testFilePattern = (0, path_1.join)("./", ...dirs, rootFilePattern);
    if ((0, glob_1.sync)(testFilePattern).length > 0) {
        core.info(`Found ${testFilePattern}`);
        return true;
    }
    core.info(`Unable to find ${rootFilePattern} in ${dirName}`);
    return false;
}
function inspectComponents(message, items) {
    core.info(`${message} (${items.length}):`);
    items.forEach((item) => core.info(` - ${item.metadata.name} at "${sourceLocationRelative(item)}"`));
}
function componentConfig(item, runTests, ignoreFailures) {
    const path = sourceLocationDir(item);
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
function runTestsPolicy(entity, changed, eventName, workflow_force_all_checks_flag) {
    if (workflow_force_all_checks_flag) {
        core.info(`${entity.metadata.name}: CI runs because of workflow config (force_all_checks: true)`);
        return true;
    }
    if (eventName !== "pull_request") {
        core.info(`${entity.metadata.name}: CI runs because it's not a PR`);
        return true;
    }
    if (entity.metadata.tags?.includes("ci-sec-changed-only")) {
        core.info(`${entity.metadata.name}: CI runs for changed only (changed: ${changed}) - via ci-sec-changed-only tag`);
        return changed;
    }
    core.info(`${entity.metadata.name}: CI runs by default for all components (changed: ${changed}) - no ci-sec-changed-only tag`);
    return true;
}
function ignoreFailuresPolicy(entity, _changed, _eventName, workflow_ignore_failures) {
    if (workflow_ignore_failures) {
        core.info(`${entity.metadata.name}: ignoring failures because of workflow config (ignore_failures: true)`);
        return true;
    }
    if (entity.metadata.tags?.includes("ci-sec-disable")) {
        core.info(`${entity.metadata.name}: ignoring falures via ci-sec-disable tag`);
        return true;
    }
    const tier = securityTier(entity);
    const ignoreFailures = tier < 0;
    core.info(`${entity.metadata.name}: CI runs will ignore failures based on security tier (${tier}: ${ignoreFailures})`);
    return ignoreFailures;
}
const generateComponentMatrix = async ({ backstage_url, backstage_entities_repo, force_all_checks, ignore_failures, }) => {
    const entities = await (0, get_backstage_entities_1.getBackstageEntities)({
        backstage_url,
        backstage_entities_repo,
    });
    const serverUrl = process.env.GITHUB_SERVER_URL || "https://github.com";
    const repoUrl = [serverUrl, github_1.context.repo.owner, github_1.context.repo.repo].join("/");
    const componentItems = entities
        .filter((item) => sourceLocation(item)?.startsWith(`url:${repoUrl}/`))
        .filter((item) => item.kind === "Component");
    inspectComponents("Component entities in this repo", componentItems);
    const eventName = process.env.GITHUB_EVENT_NAME;
    const changedFiles = await (0, get_changed_files_1.getChangedFiles)(eventName);
    core.info(`Changed files count: ${changedFiles.length}`);
    const changedComponents = componentItems.filter((item) => changedFiles.some((file) => {
        const loc = sourceLocationRelative(item);
        return file.file.startsWith(loc);
    }));
    inspectComponents("Changed components", changedComponents);
    core.info("Generating component matrix...");
    const matrix = {
        include: componentItems.map((item) => {
            const changed = changedComponents.includes(item);
            const runTests = runTestsPolicy(item, changed, eventName, force_all_checks);
            const ignoreFailures = ignoreFailuresPolicy(item, changed, eventName, ignore_failures);
            return componentConfig(item, runTests, ignoreFailures);
        }),
    };
    core.info(JSON.stringify(matrix, null, 2));
    return matrix;
};
exports.generateComponentMatrix = generateComponentMatrix;


/***/ }),

/***/ 46594:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


/*
Copyright 2021 Expedia, Inc.
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.octokit = void 0;
const core = __importStar(__webpack_require__(68434));
const github_1 = __webpack_require__(86764);
const githubToken = core.getInput("github_token", { required: true });
exports.octokit = (0, github_1.getOctokit)(githubToken).rest;


/***/ }),

/***/ 53249:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getBackstageEntities = void 0;
const core = __importStar(__webpack_require__(68434));
const catalog_client_1 = __webpack_require__(55497);
const simple_git_1 = __webpack_require__(84543);
const getBackstageEntities = async ({ backstage_url: backstageUrl, backstage_entities_repo: backstageEntitiesRepo, }) => {
    if (backstageUrl) {
        try {
            return fetchBackstageEntitiesFromURL(backstageUrl);
        }
        catch (err) {
            /* empty */
        }
    }
    // repo used as fallback to the URL in order to avoid unnecessary runtime
    // dependency
    if (backstageEntitiesRepo) {
        return fetchBackstageEntitiesFromRepo(backstageEntitiesRepo);
    }
    throw new Error("Backstage URL or entities repo is required. Set BACKSTAGE_URL (github secret) or pass backstage_entities_repo argument to this action");
};
exports.getBackstageEntities = getBackstageEntities;
async function getFileContentFromRepo(repoUrl, filePath) {
    const cloneDir = `/tmp/github-helpers-${Date.now()}`;
    const git = (0, simple_git_1.simpleGit)();
    try {
        await git.clone(repoUrl, cloneDir, ["--depth=1"]);
        await git.cwd(cloneDir);
        const { current } = await git.branch();
        const defaultBranch = current || "main";
        const fileContent = await git.show([
            `${defaultBranch}:${filePath}`,
        ]);
        await git.raw(["rm", "-rf", "."]);
        return fileContent;
    }
    catch (error) {
        throw new Error(`Failed to fetch ${repoUrl}/${filePath}: ${error}`);
    }
}
async function fetchBackstageEntitiesFromURL(backstageUrl) {
    core.info("Connecting to Backstage to fetch available entities");
    const discoveryApi = {
        async getBaseUrl() {
            return `${backstageUrl}/api/catalog`;
        },
    };
    const catalogClient = new catalog_client_1.CatalogClient({
        discoveryApi,
    });
    const entities = await catalogClient.getEntities({});
    core.info(`Total backstage entities: ${entities.items.length}`);
    return entities.items;
}
async function fetchBackstageEntitiesFromRepo(backstageEntitiesRepo) {
    const serverUrl = process.env.GITHUB_SERVER_URL || "https://github.com";
    const repoUrl = `${serverUrl}/${backstageEntitiesRepo}`;
    core.info(`Cloning ${repoUrl}`);
    const content = await getFileContentFromRepo(repoUrl, "filteredEntities.json");
    return JSON.parse(content);
}


/***/ }),

/***/ 87473:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getChangedFiles = exports.ChangeType = void 0;
const github = __importStar(__webpack_require__(86764));
const core = __importStar(__webpack_require__(68434));
const octokit_1 = __webpack_require__(46594);
var ChangeType;
(function (ChangeType) {
    ChangeType[ChangeType["add"] = 0] = "add";
    ChangeType[ChangeType["edit"] = 1] = "edit";
    ChangeType[ChangeType["delete"] = 2] = "delete";
    ChangeType[ChangeType["any"] = 3] = "any";
})(ChangeType || (exports.ChangeType = ChangeType = {}));
async function getChangedFiles(eventName) {
    if (!eventName) {
        return [];
    }
    switch (eventName) {
        case "push":
            return getChangesFromSha();
        default:
            return getChangesFromPR();
    }
}
exports.getChangedFiles = getChangedFiles;
async function getChangesFromSha() {
    const beforeSha = github.context.payload.before;
    const afterSha = github.context.payload.after;
    const owner = github.context.payload.repository?.owner?.name;
    const repo = github.context.payload.repository?.name;
    if (!beforeSha || !afterSha || !repo || !owner) {
        return [];
    }
    const changedFiles = await octokit_1.octokit.repos.compareCommits({
        owner,
        repo,
        base: beforeSha,
        head: afterSha,
        mediaType: { format: "sha" },
    });
    const changes = changedFiles.data.files.map((f) => ({
        file: f.filename,
        changeType: parseStatus(f.status),
        patch: f.patch,
    }));
    core.debug("found changed files:");
    for (const change of changes) {
        core.debug(`  ${change.file}`);
    }
    return changes;
}
async function getChangesFromPR() {
    const pullRequest = github.context.payload.pull_request;
    if (!pullRequest) {
        return [];
    }
    const listFilesResponse = await octokit_1.octokit.pulls.listFiles({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        pull_number: pullRequest.number,
    });
    const changes = listFilesResponse.data.map((f) => ({
        file: f.filename,
        changeType: parseStatus(f.status),
        patch: f.patch,
    }));
    core.debug("found changed files:");
    for (const change of changes) {
        core.debug(`  ${change.file}`);
    }
    return changes;
}
function parseStatus(status) {
    switch (status) {
        case "added":
            return ChangeType.add;
        case "removed":
            return ChangeType.delete;
        case "modified":
            return ChangeType.edit;
        default:
            return ChangeType.edit;
    }
}


/***/ })

};
;
//# sourceMappingURL=288.index.js.map