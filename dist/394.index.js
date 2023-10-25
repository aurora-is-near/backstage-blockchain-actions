"use strict";
exports.id = 394;
exports.ids = [394];
exports.modules = {

/***/ 30062:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AccessKeyCollector = void 0;
const catalog_model_1 = __webpack_require__(70606);
class AccessKeyCollector {
    constructor(entities, opts = {}) {
        this.systemComponents = [];
        this.entities = [];
        this.contracts = [];
        this.accessKeys = [];
        this.entities = entities;
        const apiEntities = this.entities.filter(catalog_model_1.isApiEntity);
        const resourceEntities = this.entities.filter(catalog_model_1.isResourceEntity);
        this.contracts = apiEntities.filter((item) => item.spec?.type === "contract-deployment");
        this.accessKeys = resourceEntities.filter((item) => item.spec?.type === "access-key");
        this.systemComponents = this.collectSystems(opts);
    }
    normalizeEntities(list) {
        return [...new Set(list)].sort((a, b) => a.localeCompare(b));
    }
    collectSystems(opts) {
        const systemRefs = this.normalizeEntities(this.contracts
            .filter((c) => !!c.spec?.system)
            .map((c) => c.spec.system));
        return systemRefs
            .reduce((acc, systemRef) => {
            const system = this.entities.find((item) => (0, catalog_model_1.stringifyEntityRef)(item) === systemRef);
            if (opts.scope && system.spec?.owner !== opts.scope) {
                return acc;
            }
            const components = this.collectComponents(system);
            if (components.some((c) => c.contracts.length)) {
                return [
                    ...acc,
                    {
                        title: system.metadata.title || system.metadata.name,
                        system,
                        components,
                    },
                ];
            }
            return acc;
        }, [])
            .sort((a, b) => a.system.metadata.name.localeCompare(b.system.metadata.name));
    }
    collectComponents(system) {
        const componentRefs = system.relations.filter((r) => r.type === catalog_model_1.RELATION_HAS_PART &&
            (0, catalog_model_1.parseEntityRef)(r.targetRef).kind === "component");
        return componentRefs
            .reduce((acc, componentRef) => {
            const component = this.entities.find((item) => (0, catalog_model_1.stringifyEntityRef)(item) === componentRef.targetRef);
            const contracts = this.collectContracts(componentRef).filter((c) => c.keys.length > 0);
            if (contracts.length) {
                return [
                    ...acc,
                    {
                        title: component.metadata.title || component.metadata.name,
                        component,
                        contracts,
                    },
                ];
            }
            return acc;
        }, [])
            .sort((a, b) => a.component.metadata.name.localeCompare(b.component.metadata.name));
    }
    collectContracts(componentRef) {
        return this.contracts
            .filter((item) => item.relations.some((r) => r.type === catalog_model_1.RELATION_API_PROVIDED_BY &&
            r.targetRef === componentRef.targetRef) &&
            item.spec?.network === "near" &&
            // item.spec.nearKeys &&
            // ((item.spec.nearKeys as JsonObject).keys as JsonArray).length > 0 &&
            item.spec?.lifecycle === "production")
            .map((entity) => ({
            entity,
            keys: this.collectKeys(entity),
        }));
    }
    collectKeys(contract) {
        return contract
            .relations.filter((r) => r.type === catalog_model_1.RELATION_API_CONSUMED_BY &&
            (0, catalog_model_1.parseEntityRef)(r.targetRef).kind === "resource")
            .reduce((acc, r) => {
            const accessKey = this.accessKeys.find((e) => (0, catalog_model_1.stringifyEntityRef)(e) === r.targetRef);
            if (accessKey && accessKey.spec && accessKey.spec.owner) {
                const ownerRef = (0, catalog_model_1.parseEntityRef)(accessKey.spec.owner);
                const owner = this.entities.find((e) => e.metadata.name === ownerRef.name);
                if (owner) {
                    return [...acc, { key: accessKey, owner }];
                }
            }
            return acc;
        }, [])
            .sort((a, b) => a.key.metadata.name.localeCompare(b.key.metadata.name));
    }
}
exports.AccessKeyCollector = AccessKeyCollector;


/***/ }),

/***/ 99872:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FilteredCollector = void 0;
const pick_1 = __webpack_require__(46202);
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
    constructor(entities, opts = {}) {
        this.srcEntities = entities;
        this.entities = this.filterEntities(opts);
    }
    filterSpec(spec) {
        if (!spec)
            return {};
        return (0, pick_1.pick)(spec, ALLOWED_SPEC_FIELDS);
    }
    filterMetadata(metadata) {
        return (0, pick_1.pick)(metadata, ALLOWED_METADATA_FIELDS);
    }
    filterEntities(opts) {
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
            };
        });
    }
}
exports.FilteredCollector = FilteredCollector;


/***/ }),

/***/ 25498:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MultisigsCollector = void 0;
const catalog_model_1 = __webpack_require__(70606);
class MultisigsCollector {
    constructor(entities, opts = {}) {
        this.systemComponents = [];
        this.entities = [];
        this.apiEntities = [];
        this.resourceEntities = [];
        this.multisigs = [];
        this.contracts = [];
        this.accessKeys = [];
        this.entities = entities;
        this.apiEntities = this.entities.filter(catalog_model_1.isApiEntity);
        this.resourceEntities = this.entities.filter(catalog_model_1.isResourceEntity);
        this.multisigs = this.apiEntities.filter((item) => item.spec?.type === "multisig-deployment");
        this.contracts = this.apiEntities.filter((item) => item.spec?.type === "contract-deployment");
        this.accessKeys = this.resourceEntities.filter((item) => item.spec?.type === "access-key");
        this.systemComponents = this.collectSystems(opts);
    }
    normalizeEntities(list) {
        return [...new Set(list)].sort((a, b) => a.localeCompare(b));
    }
    collectSystems(opts) {
        const systemRefs = this.normalizeEntities(this.multisigs.map((item) => item.spec.system));
        return systemRefs
            .reduce((acc, systemRef) => {
            const system = this.entities.find((item) => (0, catalog_model_1.stringifyEntityRef)(item) === systemRef);
            if (opts.scope && system.spec?.owner !== opts.scope) {
                return acc;
            }
            const components = this.collectComponents(system);
            return [
                ...acc,
                {
                    title: system.metadata.title || system.metadata.name,
                    system,
                    components,
                },
            ];
        }, [])
            .sort((a, b) => a.system.metadata.name.localeCompare(b.system.metadata.name));
    }
    collectComponents(system) {
        const componentRefs = system.relations.filter((r) => r.type === catalog_model_1.RELATION_HAS_PART &&
            (0, catalog_model_1.parseEntityRef)(r.targetRef).kind === "component");
        return componentRefs
            .map((componentRef) => {
            const component = this.entities.find((item) => (0, catalog_model_1.stringifyEntityRef)(item) === componentRef.targetRef);
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
            .relations.filter((r) => r.type === catalog_model_1.RELATION_OWNED_BY &&
            (0, catalog_model_1.parseEntityRef)(r.targetRef).kind !== "group")
            .map((r) => {
            const signer = this.entities.find((e) => (0, catalog_model_1.stringifyEntityRef)(e) === r.targetRef);
            const owner = this.entities.find((e) => (0, catalog_model_1.stringifyEntityRef)(e) === signer.spec.owner);
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
        return this.contracts.filter((entity) => entity.spec?.network === "near");
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
            return { ...acc, [uid]: signer };
        }, {});
        return Object.values(uniqueSigners);
    }
    getMultisigAccessKeys() {
        const signers = this.getSigners().filter((value) => value.signer.spec?.network === "near");
        const keys = signers.flatMap((value) => {
            if (!value.signer.relations) {
                return [];
            }
            return value.signer.relations
                .filter((r) => r.type === catalog_model_1.RELATION_API_CONSUMED_BY &&
                (0, catalog_model_1.parseEntityRef)(r.targetRef).kind === "resource")
                .map((relation) => {
                const key = this.entities.find((e) => (0, catalog_model_1.stringifyEntityRef)(e) === relation.targetRef);
                return key;
            });
        });
        return keys.filter(this.isEntity).filter(this.isQualifiedEntity);
    }
    getAccessKeysPerSigner() {
        const signers = this.getSigners().filter((value) => value.signer.spec?.network === "near");
        const keysPerSigner = signers.reduce((acc, value) => {
            if (!value.signer.relations) {
                return acc;
            }
            const spec = JSON.parse(JSON.stringify(value.signer.spec));
            const signer = spec.address;
            const keys = value.signer.relations
                .filter((r) => r.type === catalog_model_1.RELATION_API_CONSUMED_BY &&
                (0, catalog_model_1.parseEntityRef)(r.targetRef).kind === "resource")
                .map((relation) => {
                const key = this.entities.find((e) => (0, catalog_model_1.stringifyEntityRef)(e) === relation.targetRef);
                return key;
            })
                .filter(this.isEntity);
            return {
                ...acc,
                [signer]: {
                    owner: value.owner,
                    signer: value.signer,
                    keys,
                },
            };
        }, {});
        return keysPerSigner;
    }
    getContractAccessKeys() {
        const keys = this.contracts.flatMap((value) => {
            if (!value.relations) {
                return [];
            }
            return value.relations
                .filter((r) => r.type === catalog_model_1.RELATION_API_CONSUMED_BY &&
                (0, catalog_model_1.parseEntityRef)(r.targetRef).kind === "resource")
                .map((relation) => {
                const key = this.entities.find((e) => (0, catalog_model_1.stringifyEntityRef)(e) === relation.targetRef);
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
        const deprecated = keys.filter((entity) => entity.metadata.tags?.includes("deprecated"));
        return deprecated;
    }
    getUnknownAccessKeys() {
        const keys = this.getAllAccessKeys();
        const unknown = keys.filter((entity) => entity.metadata.tags?.includes("unknown"));
        return unknown;
    }
    isQualifiedEntity(entity) {
        return (!entity.metadata.tags?.includes("retired") &&
            !entity.metadata.tags?.includes("allow-unknown"));
    }
    isEntity(entity) {
        return entity !== undefined;
    }
}
exports.MultisigsCollector = MultisigsCollector;


/***/ }),

/***/ 46202:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.pick = void 0;
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
        if (key === "__proto__" || key === "constructor" || key === "prototype") {
            return;
        }
        if (typeof current === "object" && current !== null && !(key in current)) {
            current[key] = {};
        }
        current = current[key];
    }
    const lastKey = keys[keys.length - 1];
    if (lastKey === "__proto__" ||
        lastKey === "constructor" ||
        lastKey === "prototype") {
        return;
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
exports.pick = pick;


/***/ }),

/***/ 21802:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RbacCollector = void 0;
const catalog_model_1 = __webpack_require__(70606);
class RbacCollector {
    constructor(entities, opts = {}) {
        this.systemComponents = [];
        this.entities = [];
        this.contracts = [];
        this.roleGroups = [];
        this.entities = entities;
        const apiEntities = this.entities.filter(catalog_model_1.isApiEntity);
        this.contracts = apiEntities.filter((item) => item.spec?.type === "contract-deployment");
        this.roleGroups = apiEntities.filter((item) => item.spec?.type === "role-group");
        this.systemComponents = this.collectSystems(opts);
    }
    normalizeEntities(list) {
        return [...new Set(list)].sort((a, b) => a.localeCompare(b));
    }
    collectSystems(opts) {
        const systemRefs = this.normalizeEntities(this.contracts
            .filter((c) => !!c.spec?.system)
            .map((c) => c.spec.system));
        return systemRefs
            .reduce((acc, systemRef) => {
            const system = this.entities.find((item) => (0, catalog_model_1.stringifyEntityRef)(item) === systemRef);
            if (opts.scope && system.spec?.owner !== opts.scope) {
                return acc;
            }
            const components = this.collectComponents(system);
            if (components.some((c) => c.contracts.length)) {
                return [
                    ...acc,
                    {
                        title: system.metadata.title || system.metadata.name,
                        system,
                        components,
                    },
                ];
            }
            return acc;
        }, [])
            .sort((a, b) => a.system.metadata.name.localeCompare(b.system.metadata.name));
    }
    collectComponents(system) {
        const componentRefs = system.relations.filter((r) => r.type === catalog_model_1.RELATION_HAS_PART &&
            (0, catalog_model_1.parseEntityRef)(r.targetRef).kind === "component");
        return componentRefs
            .reduce((acc, componentRef) => {
            const component = this.entities.find((item) => (0, catalog_model_1.stringifyEntityRef)(item) === componentRef.targetRef);
            const contracts = this.collectContracts(componentRef);
            if (contracts.length) {
                return [
                    ...acc,
                    {
                        title: component.metadata.title || component.metadata.name,
                        component,
                        contracts,
                    },
                ];
            }
            return acc;
        }, [])
            .sort((a, b) => a.component.metadata.name.localeCompare(b.component.metadata.name));
    }
    collectContracts(componentRef) {
        return this.contracts
            .filter((item) => item.relations.some((r) => r.type === catalog_model_1.RELATION_API_PROVIDED_BY &&
            r.targetRef === componentRef.targetRef) &&
            item.metadata.tags?.includes("rbac") &&
            item.spec?.lifecycle === "production")
            .map((entity) => ({
            entity,
            roles: this.collectRoles(entity),
        }));
    }
    collectRoles(contract) {
        return contract
            .relations.filter((r) => r.type === catalog_model_1.RELATION_DEPENDS_ON &&
            (0, catalog_model_1.parseEntityRef)(r.targetRef).kind === "api")
            .reduce((acc, r) => {
            const roleGroup = this.roleGroups.find((e) => (0, catalog_model_1.stringifyEntityRef)(e) === r.targetRef);
            if (roleGroup && roleGroup.spec && roleGroup.spec.members) {
                const specMembers = roleGroup.spec.members;
                const members = specMembers.reduce((accMembers, m) => {
                    const member = this.entities.find((e) => e.spec?.type &&
                        // filter out role-groups since they are modeled with
                        // the same fields as a blockchain address
                        e.spec.type.toString() !== "role-group" &&
                        e.spec.address?.toString().toLowerCase() === m &&
                        e.spec.network === roleGroup.spec?.network &&
                        e.spec.networkType === roleGroup.spec?.networkType);
                    if (member) {
                        const ownerRef = (0, catalog_model_1.parseEntityRef)(member.spec?.owner);
                        const owner = this.entities.find((e) => e.metadata.name === ownerRef.name);
                        return [...accMembers, { member, owner }];
                    }
                    return accMembers;
                }, []);
                return [...acc, { role: roleGroup, members }];
            }
            return acc;
        }, [])
            .sort((a, b) => a.role.metadata.name.localeCompare(b.role.metadata.name));
    }
}
exports.RbacCollector = RbacCollector;


/***/ }),

/***/ 95204:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UnknownCollector = void 0;
class UnknownCollector {
    constructor(entities) {
        this.entities = [];
        this.entities = entities;
    }
    collectEntities(opts = {}) {
        return this.entities
            .reduce((acc, entity) => {
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
            .sort((a, b) => a.entity.metadata.name.localeCompare(b.entity.metadata.name));
    }
}
exports.UnknownCollector = UnknownCollector;


/***/ }),

/***/ 9394:
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.backstageExport = exports.BackstageExport = void 0;
const core = __importStar(__webpack_require__(68434));
const glob_1 = __webpack_require__(17364);
const fs_1 = __importDefault(__webpack_require__(57147));
const simple_git_1 = __webpack_require__(84543);
const handlebars_1 = __importDefault(__webpack_require__(80474));
const multisigs_collector_1 = __webpack_require__(25498);
const filtered_collector_1 = __webpack_require__(99872);
const rbac_collector_1 = __webpack_require__(21802);
const access_key_collector_1 = __webpack_require__(30062);
const unknown_collector_1 = __webpack_require__(95204);
const get_backstage_entities_1 = __webpack_require__(53249);
class BackstageExport {
    constructor() {
        this.template_path = "";
        this.output_path = "";
    }
}
exports.BackstageExport = BackstageExport;
const backstageExport = async ({ backstage_url, backstage_entities_repo, template_path, output_path, scope, testing, }) => {
    if (!template_path || !output_path) {
        throw new Error("set template_path and output_path for handlebars templating");
    }
    const entities = await (0, get_backstage_entities_1.getBackstageEntities)({
        backstage_url,
        backstage_entities_repo,
    });
    const multisigsCollector = new multisigs_collector_1.MultisigsCollector(entities, { scope });
    const filteredCollector = new filtered_collector_1.FilteredCollector(entities, { scope });
    const rbacCollector = new rbac_collector_1.RbacCollector(entities, { scope });
    const accessKeyCollector = new access_key_collector_1.AccessKeyCollector(entities, { scope });
    const unknownCollector = new unknown_collector_1.UnknownCollector(entities);
    const unknownEntities = unknownCollector.collectEntities({ scope });
    // console.log(JSON.stringify(multisigsCollector.systemComponents[0], null, 2));
    const changedFiles = (0, glob_1.sync)(`${template_path}**/*.hbs`).reduce((acc, templatePath) => {
        const templateData = {
            multisigSystemComponents: multisigsCollector.systemComponents,
            contractSystemComponents: rbacCollector.systemComponents,
            accessKeySystemComponents: accessKeyCollector.systemComponents,
            unknown: unknownEntities,
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
    await commitAndPushChanges(output_path);
    return true;
};
exports.backstageExport = backstageExport;
function reexportTemplate(inputs) {
    const outputPath = inputs.output_path +
        inputs.templatePath.replace(inputs.template_path, "").replace(".hbs", "");
    const compiledTemplate = handlebars_1.default.compile(fs_1.default.readFileSync(inputs.templatePath, { encoding: "utf8" }), {
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
    const existingContent = fs_1.default.existsSync(outputPath) &&
        fs_1.default.readFileSync(outputPath, {
            encoding: "utf-8",
        });
    if (compiledContent !== existingContent) {
        core.info(`Writing ${outputPath}: changed content`);
        fs_1.default.writeFileSync(outputPath, compiledContent);
        return true;
    }
    return false;
}
async function commitAndPushChanges(path) {
    const git = (0, simple_git_1.simpleGit)(".");
    await git.addConfig("user.email", "security@aurora.dev");
    await git.addConfig("user.name", "Backstage Exporter");
    await git.add(path);
    const msg = "chore(backstage): 🥷🏽 automatic re-export";
    await git.commit(msg, undefined);
    await git.push();
    core.info("Updated and pushed the changes");
    return true;
}


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


/***/ })

};
;
//# sourceMappingURL=394.index.js.map