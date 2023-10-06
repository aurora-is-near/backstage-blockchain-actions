"use strict";
exports.id = 795;
exports.ids = [795];
exports.modules = {

/***/ 25498:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "d": () => (/* binding */ MultisigsCollector)
/* harmony export */ });
/* harmony import */ var _backstage_catalog_model__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(33631);

class MultisigsCollector {
    constructor(entities) {
        this.systemComponents = [];
        this.entities = [];
        this.apiEntities = [];
        this.resourceEntities = [];
        this.multisigs = [];
        this.contracts = [];
        this.accessKeys = [];
        this.entities = entities;
        this.apiEntities = this.entities.filter(_backstage_catalog_model__WEBPACK_IMPORTED_MODULE_0__/* .isApiEntity */ .$R);
        this.resourceEntities = this.entities.filter(_backstage_catalog_model__WEBPACK_IMPORTED_MODULE_0__/* .isResourceEntity */ .p7);
        this.multisigs = this.apiEntities.filter((item) => { var _a; return ((_a = item.spec) === null || _a === void 0 ? void 0 : _a.type) === "multisig-deployment"; });
        this.contracts = this.apiEntities.filter((item) => { var _a; return ((_a = item.spec) === null || _a === void 0 ? void 0 : _a.type) === "contract-deployment"; });
        this.accessKeys = this.resourceEntities.filter((item) => { var _a; return ((_a = item.spec) === null || _a === void 0 ? void 0 : _a.type) === "access-key"; });
        this.systemComponents = this.collectSystems();
    }
    normalizeEntities(list) {
        return [...new Set(list)].sort((a, b) => a.localeCompare(b));
    }
    collectSystems() {
        const systemRefs = this.normalizeEntities(this.multisigs.map((item) => item.spec.system));
        return systemRefs
            .map((systemRef) => {
            const system = this.entities.find((item) => (0,_backstage_catalog_model__WEBPACK_IMPORTED_MODULE_0__/* .stringifyEntityRef */ .eE)(item) === systemRef);
            const components = this.collectComponents(system);
            return {
                title: system.metadata.title || system.metadata.name,
                system,
                components,
            };
        })
            .sort((a, b) => a.system.metadata.name.localeCompare(b.system.metadata.name));
    }
    collectComponents(system) {
        const componentRefs = system.relations.filter((r) => r.type === _backstage_catalog_model__WEBPACK_IMPORTED_MODULE_0__/* .RELATION_HAS_PART */ .aS &&
            (0,_backstage_catalog_model__WEBPACK_IMPORTED_MODULE_0__/* .parseEntityRef */ .of)(r.targetRef).kind === "component");
        return componentRefs
            .map((componentRef) => {
            const component = this.entities.find((item) => (0,_backstage_catalog_model__WEBPACK_IMPORTED_MODULE_0__/* .stringifyEntityRef */ .eE)(item) === componentRef.targetRef);
            return {
                title: component.metadata.title || component.metadata.name,
                component,
                multisigs: this.multisigs
                    .filter((item) => item.relations.some((r) => r.type === "apiProvidedBy" &&
                    r.targetRef === componentRef.targetRef))
                    .map((ms) => ({
                    entity: ms,
                    signers: this.collectSigners(ms),
                })),
            };
        })
            .sort((a, b) => a.component.metadata.name.localeCompare(b.component.metadata.name));
    }
    collectSigners(multisig) {
        return multisig
            .relations.filter((r) => r.type === _backstage_catalog_model__WEBPACK_IMPORTED_MODULE_0__/* .RELATION_OWNED_BY */ .S4 &&
            (0,_backstage_catalog_model__WEBPACK_IMPORTED_MODULE_0__/* .parseEntityRef */ .of)(r.targetRef).kind !== "group")
            .map((r) => {
            const signer = this.entities.find((e) => (0,_backstage_catalog_model__WEBPACK_IMPORTED_MODULE_0__/* .stringifyEntityRef */ .eE)(e) === r.targetRef);
            const owner = this.entities.find((e) => (0,_backstage_catalog_model__WEBPACK_IMPORTED_MODULE_0__/* .stringifyEntityRef */ .eE)(e) === signer.spec.owner);
            return {
                signer,
                owner,
            };
        })
            .sort((a, b) => a.owner.metadata.name.localeCompare(b.owner.metadata.name));
    }
    getAllApis() {
        return this.apiEntities;
    }
    getAllResources() {
        return this.resourceEntities;
    }
    getMultisigs() {
        return this.systemComponents.flatMap((system) => system.components.flatMap((component) => component.multisigs));
    }
    getNearContracts() {
        return this.contracts.filter((entity) => { var _a; return ((_a = entity.spec) === null || _a === void 0 ? void 0 : _a.network) === "near"; });
    }
    getSigners() {
        const allSigners = this.getMultisigs().flatMap((ms) => ms.signers);
        const uniqueSigners = allSigners.reduce((acc, signer) => {
            const uid = signer.signer.metadata.uid;
            if (uid && uid in allSigners) {
                return acc;
            }
            if (!this.isQualifiedEntity(signer.signer)) {
                return acc;
            }
            return Object.assign(Object.assign({}, acc), { [uid]: signer });
        }, {});
        return Object.values(uniqueSigners);
    }
    getMultisigAccessKeys() {
        const signers = this.getSigners().filter((value) => { var _a; return ((_a = value.signer.spec) === null || _a === void 0 ? void 0 : _a.network) === "near"; });
        const keys = signers.flatMap((value) => {
            if (!value.signer.relations) {
                return [];
            }
            return value.signer.relations
                .filter((r) => r.type === _backstage_catalog_model__WEBPACK_IMPORTED_MODULE_0__/* .RELATION_API_CONSUMED_BY */ .X9 &&
                (0,_backstage_catalog_model__WEBPACK_IMPORTED_MODULE_0__/* .parseEntityRef */ .of)(r.targetRef).kind === "resource")
                .map((relation) => {
                const key = this.entities.find((e) => (0,_backstage_catalog_model__WEBPACK_IMPORTED_MODULE_0__/* .stringifyEntityRef */ .eE)(e) === relation.targetRef);
                return key;
            });
        });
        return keys.filter(this.isEntity).filter(this.isQualifiedEntity);
    }
    getAccessKeysPerSigner() {
        const signers = this.getSigners().filter((value) => { var _a; return ((_a = value.signer.spec) === null || _a === void 0 ? void 0 : _a.network) === "near"; });
        const keysPerSigner = signers.reduce((acc, value) => {
            if (!value.signer.relations) {
                return acc;
            }
            const spec = JSON.parse(JSON.stringify(value.signer.spec));
            const signer = spec.address;
            const keys = value.signer.relations
                .filter((r) => r.type === _backstage_catalog_model__WEBPACK_IMPORTED_MODULE_0__/* .RELATION_API_CONSUMED_BY */ .X9 &&
                (0,_backstage_catalog_model__WEBPACK_IMPORTED_MODULE_0__/* .parseEntityRef */ .of)(r.targetRef).kind === "resource")
                .map((relation) => {
                const key = this.entities.find((e) => (0,_backstage_catalog_model__WEBPACK_IMPORTED_MODULE_0__/* .stringifyEntityRef */ .eE)(e) === relation.targetRef);
                return key;
            })
                .filter(this.isEntity);
            return Object.assign(Object.assign({}, acc), { [signer]: {
                    owner: value.owner,
                    signer: value.signer,
                    keys,
                } });
        }, {});
        return keysPerSigner;
    }
    getContractAccessKeys() {
        const keys = this.contracts.flatMap((value) => {
            if (!value.relations) {
                return [];
            }
            return value.relations
                .filter((r) => r.type === _backstage_catalog_model__WEBPACK_IMPORTED_MODULE_0__/* .RELATION_API_CONSUMED_BY */ .X9 &&
                (0,_backstage_catalog_model__WEBPACK_IMPORTED_MODULE_0__/* .parseEntityRef */ .of)(r.targetRef).kind === "resource")
                .map((relation) => {
                const key = this.entities.find((e) => (0,_backstage_catalog_model__WEBPACK_IMPORTED_MODULE_0__/* .stringifyEntityRef */ .eE)(e) === relation.targetRef);
                return key;
            });
        });
        return keys.filter(this.isEntity);
    }
    getAllAccessKeys() {
        return this.accessKeys;
    }
    getDeprecatedAccessKeys() {
        const keys = this.getAllAccessKeys();
        const deprecated = keys.filter((entity) => { var _a; return (_a = entity.metadata.tags) === null || _a === void 0 ? void 0 : _a.includes("deprecated"); });
        return deprecated;
    }
    getUnknownAccessKeys() {
        const keys = this.getAllAccessKeys();
        const unknown = keys.filter((entity) => { var _a; return (_a = entity.metadata.tags) === null || _a === void 0 ? void 0 : _a.includes("unknown"); });
        return unknown;
    }
    isQualifiedEntity(entity) {
        var _a, _b;
        return (!((_a = entity.metadata.tags) === null || _a === void 0 ? void 0 : _a.includes("retired")) &&
            !((_b = entity.metadata.tags) === null || _b === void 0 ? void 0 : _b.includes("allow-unknown")));
    }
    isEntity(entity) {
        return entity !== undefined;
    }
}


/***/ }),

/***/ 27795:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "BackstageExport": () => (/* binding */ BackstageExport),
  "backstageExport": () => (/* binding */ backstageExport)
});

// EXTERNAL MODULE: ./node_modules/.pnpm/@actions+core@1.10.1/node_modules/@actions/core/lib/core.js
var core = __webpack_require__(68434);
// EXTERNAL MODULE: ./node_modules/.pnpm/glob@10.3.10/node_modules/glob/dist/esm/index.js + 15 modules
var esm = __webpack_require__(45059);
// EXTERNAL MODULE: external "fs"
var external_fs_ = __webpack_require__(57147);
var external_fs_default = /*#__PURE__*/__webpack_require__.n(external_fs_);
// EXTERNAL MODULE: ./node_modules/.pnpm/simple-git@3.20.0/node_modules/simple-git/dist/esm/index.js
var dist_esm = __webpack_require__(6808);
// EXTERNAL MODULE: ./node_modules/.pnpm/handlebars@4.7.8/node_modules/handlebars/lib/index.js
var lib = __webpack_require__(80474);
var lib_default = /*#__PURE__*/__webpack_require__.n(lib);
// EXTERNAL MODULE: ./src/core/multisigs-collector.ts
var multisigs_collector = __webpack_require__(25498);
;// CONCATENATED MODULE: ./src/core/pick.ts
function getNestedValue(obj, key) {
    return key
        .split(".")
        .reduce((o, k) => o && typeof o === "object" && k in o
        ? o[k]
        : undefined, obj);
}
function setNestedValue(obj, path, value) {
    const keys = path.split(".");
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (typeof current === "object" && current !== null && !(key in current)) {
            current[key] = {};
        }
        current = current[key];
    }
    if (typeof current === "object" && current !== null) {
        current[keys[keys.length - 1]] = value;
    }
}
function pick(obj, whitelist) {
    return whitelist.reduce((newObj, key) => {
        const value = getNestedValue(obj, key);
        if (value !== undefined) {
            setNestedValue(newObj, key, value);
        }
        return newObj;
    }, {});
}

;// CONCATENATED MODULE: ./src/core/filtered-collector.ts

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
class FilteredCollector {
    constructor(entities) {
        this.srcEntities = entities;
        this.entities = this.filterEntities();
    }
    normalizeEntities(list) {
        return [...new Set(list)].sort((a, b) => a.localeCompare(b));
    }
    filterSpec(spec) {
        if (!spec)
            return {};
        return pick(spec, ALLOWED_SPEC_FIELDS);
    }
    filterMetadata(metadata) {
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
            };
        });
    }
}

// EXTERNAL MODULE: ./src/utils/get-backstage-entities.ts
var get_backstage_entities = __webpack_require__(53249);
;// CONCATENATED MODULE: ./src/helpers/backstage-export.ts
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};








class BackstageExport {
}
const backstageExport = ({ backstage_url, template_path, output_path, testing, }) => __awaiter(void 0, void 0, void 0, function* () {
    if (!template_path || !output_path) {
        throw new Error("set template_path and output_path for handlebars templating");
    }
    const entities = yield (0,get_backstage_entities/* getBackstageEntities */.g)({ backstage_url });
    const multisigsCollector = new multisigs_collector/* MultisigsCollector */.d(entities);
    const filteredCollector = new FilteredCollector(entities);
    // console.log(JSON.stringify(multisigsCollector.systemComponents[0], null, 2));
    const changedFiles = (0,esm/* sync */.Z_)(`${template_path}**/*.hbs`).reduce((acc, templatePath) => {
        const templateData = {
            multisigSystemComponents: multisigsCollector.systemComponents,
            filteredEntities: JSON.stringify(filteredCollector.entities, null, 2),
            testing,
        };
        if (reexportTemplate({
            backstage_url,
            output_path,
            template_path,
            templatePath,
            templateData,
        })) {
            return [templatePath, ...acc];
        }
        return acc;
    }, []);
    if (testing) {
        core.info(`Testing mode: ${changedFiles.length} changed files, exiting`);
        return true;
    }
    if (changedFiles.length === 0) {
        core.info("No changed files, nothing to commit");
        return false;
    }
    yield commitAndPushChanges(output_path);
    return true;
});
function reexportTemplate(inputs) {
    const outputPath = inputs.output_path +
        inputs.templatePath.replace(inputs.template_path, "").replace(".hbs", "");
    const compiledTemplate = lib_default().compile(external_fs_default().readFileSync(inputs.templatePath, { encoding: "utf8" }), {
        strict: true,
    });
    const options = {
        helpers: {
            backstageLink: (entity) => {
                if (!entity)
                    return "undefined";
                const md = entity.metadata;
                return `${inputs.backstage_url}/catalog/${md.namespace}/${entity.kind}/${md.name}`;
            },
        },
    };
    const compiledContent = compiledTemplate(inputs.templateData, options);
    const existingContent = external_fs_default().existsSync(outputPath) &&
        external_fs_default().readFileSync(outputPath, {
            encoding: "utf-8",
        });
    if (compiledContent !== existingContent) {
        core.info(`Writing ${outputPath}: changed content`);
        external_fs_default().writeFileSync(outputPath, compiledContent);
        return true;
    }
    return false;
}
function commitAndPushChanges(path) {
    return __awaiter(this, void 0, void 0, function* () {
        const git = (0,dist_esm/* simpleGit */.o5)(".");
        yield git.addConfig("user.email", "security@aurora.dev");
        yield git.addConfig("user.name", "Backstage Exporter");
        yield git.add(path);
        const msg = "chore(backstage): 🥷🏽 automatic re-export";
        yield git.commit(msg, undefined);
        yield git.push();
        core.info("Updated and pushed the changes");
        return true;
    });
}


/***/ }),

/***/ 53249:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "g": () => (/* binding */ getBackstageEntities)
/* harmony export */ });
/* harmony import */ var _actions_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(68434);
/* harmony import */ var _actions_core__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_actions_core__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _backstage_catalog_client__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(55497);
/* harmony import */ var simple_git__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6808);
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};



function getFileContentFromRepo(repoUrl, filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const cloneDir = `/tmp/github-helpers-${Date.now()}`;
        const git = (0,simple_git__WEBPACK_IMPORTED_MODULE_1__/* .simpleGit */ .o5)();
        try {
            yield git.clone(repoUrl, cloneDir, ["--depth=1"]);
            yield git.cwd(cloneDir);
            const { current } = yield git.branch();
            const defaultBranch = current || "main";
            const fileContent = yield git.show([
                `${defaultBranch}:${filePath}`,
            ]);
            yield git.raw(["rm", "-rf", "."]);
            return fileContent;
        }
        catch (error) {
            throw new Error(`Failed to fetch ${repoUrl}/${filePath}: ${error}`);
        }
    });
}
function fetchBackstageEntitiesFromURL(backstageUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        _actions_core__WEBPACK_IMPORTED_MODULE_0__.info("Connecting to Backstage to fetch available entities");
        const discoveryApi = {
            getBaseUrl() {
                return __awaiter(this, void 0, void 0, function* () {
                    return `${backstageUrl}/api/catalog`;
                });
            },
        };
        const catalogClient = new _backstage_catalog_client__WEBPACK_IMPORTED_MODULE_2__/* .CatalogClient */ .MS({
            discoveryApi,
        });
        const entities = yield catalogClient.getEntities({});
        _actions_core__WEBPACK_IMPORTED_MODULE_0__.info(`Total backstage entities: ${entities.items.length}`);
        return entities.items;
    });
}
function fetchBackstageEntitiesFromRepo(backstageEntitiesRepo) {
    return __awaiter(this, void 0, void 0, function* () {
        const serverUrl = process.env.GITHUB_SERVER_URL || "https://github.com";
        const repoUrl = `${serverUrl}/${backstageEntitiesRepo}`;
        _actions_core__WEBPACK_IMPORTED_MODULE_0__.info(`Cloning ${repoUrl}`);
        const content = yield getFileContentFromRepo(repoUrl, "filteredEntities.json");
        return JSON.parse(content);
    });
}
const getBackstageEntities = ({ backstage_url: backstageUrl, backstage_entities_repo: backstageEntitiesRepo, }) => __awaiter(void 0, void 0, void 0, function* () {
    // repo takes a priority over the URL in order to avoid unnecessary runtime
    // dependency
    if (backstageEntitiesRepo) {
        return fetchBackstageEntitiesFromRepo(backstageEntitiesRepo);
    }
    else if (backstageUrl) {
        return fetchBackstageEntitiesFromURL(backstageUrl);
    }
    throw new Error("Backstage URL or entities repo is required. Set BACKSTAGE_URL (github secret) or pass backstage_entities_repo argument to this action");
});


/***/ })

};
;
//# sourceMappingURL=795.index.js.map