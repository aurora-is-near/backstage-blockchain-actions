"use strict";
exports.id = 394;
exports.ids = [394];
exports.modules = {

/***/ 30062:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AccessKeyCollector = void 0;
const catalog_model_1 = __webpack_require__(70606);
const base_collector_1 = __webpack_require__(19933);
class AccessKeyCollector extends base_collector_1.BaseCollector {
    collectSystems(opts) {
        return this.getSystemEntities().reduce((acc, system) => {
            if (opts.scope && system.spec?.owner !== opts.scope) {
                return acc;
            }
            const components = this.collectComponents(system, opts);
            if (components.some((c) => c.contracts?.length)) {
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
        }, []);
    }
    collectComponents(system, opts = {}) {
        const componentRefs = system.relations.filter((r) => r.type === catalog_model_1.RELATION_HAS_PART &&
            (0, catalog_model_1.parseEntityRef)(r.targetRef).kind === "component");
        return componentRefs
            .reduce((acc, componentRef) => {
            const component = this.entityCatalog[componentRef.targetRef];
            if (opts.lifecycle && component.spec?.lifecycle !== opts.lifecycle) {
                return acc;
            }
            const contracts = this.collectContracts(componentRef).filter((c) => c.keys && c.keys.length > 0);
            if (contracts.length) {
                return [
                    ...acc,
                    {
                        title: component.metadata.title || component.metadata.name,
                        component,
                        contracts,
                        tags: this.getEntityTags(component),
                    },
                ];
            }
            return acc;
        }, [])
            .sort((a, b) => a.component.metadata.name.localeCompare(b.component.metadata.name));
    }
    collectContracts(componentRef) {
        return this.getApiEntities()
            .filter((item) => item.spec?.type === "contract-deployment" &&
            item.spec.network === "near" &&
            item.spec.lifecycle === "production" &&
            item.relations.some((r) => r.type === catalog_model_1.RELATION_API_PROVIDED_BY &&
                r.targetRef === componentRef.targetRef))
            .map((entity) => ({
            entity,
            keys: this.collectKeys(entity),
            tags: this.getEntityTags(entity),
        }));
    }
    collectKeys(contract) {
        return contract
            .relations.filter((r) => {
            const keyEntity = this.entityCatalog[r.targetRef];
            return (r.type === catalog_model_1.RELATION_API_CONSUMED_BY &&
                (0, catalog_model_1.parseEntityRef)(r.targetRef).kind === "resource" &&
                keyEntity &&
                keyEntity.spec?.type === "access-key");
        })
            .reduce((acc, r) => {
            const accessKey = this.entityCatalog[r.targetRef];
            if (accessKey && accessKey.spec && accessKey.spec.owner) {
                const ownerRef = (0, catalog_model_1.parseEntityRef)(accessKey.spec.owner);
                const owner = this.entityCatalog[(0, catalog_model_1.stringifyEntityRef)(ownerRef)];
                if (owner) {
                    return [
                        ...acc,
                        {
                            key: accessKey,
                            owner,
                            tags: this.getEntityTags(accessKey),
                        },
                    ];
                }
            }
            return acc;
        }, [])
            .sort((a, b) => a.key.metadata.name.localeCompare(b.key.metadata.name));
    }
}
exports.AccessKeyCollector = AccessKeyCollector;


/***/ }),

/***/ 59038:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AddressCollector = void 0;
const base_collector_1 = __webpack_require__(19933);
const catalog_model_1 = __webpack_require__(70606);
class AddressCollector extends base_collector_1.BaseCollector {
    collectAddresses(opts) {
        return this.getResourceEntities()
            .filter((entity) => (entity.spec?.type === "signer-address" ||
            entity.spec?.type?.toString().includes("-address")) &&
            (opts.lifecycle ? entity.spec?.lifecycle === opts.lifecycle : true) &&
            (opts.scope
                ? entity.spec?.owner?.toString().includes(opts.scope)
                : true))
            .reduce((acc, signer) => {
            const contracts = signer
                .relations.filter((relation) => relation.type === catalog_model_1.RELATION_CONSUMES_API &&
                this.entityCatalog[relation.targetRef] &&
                this.entityCatalog[relation.targetRef].spec?.type ===
                    "contract-deployment")
                .map((relation) => this.entityCatalog[relation.targetRef]);
            const roles = signer
                .relations.filter((relation) => relation.type === catalog_model_1.RELATION_MEMBER_OF &&
                this.entityCatalog[relation.targetRef] &&
                this.entityCatalog[relation.targetRef].spec?.type ===
                    "role-group")
                .map((relation) => this.entityCatalog[relation.targetRef]);
            const keys = signer
                .relations.filter((relation) => relation.type === catalog_model_1.RELATION_OWNER_OF &&
                this.entityCatalog[relation.targetRef] &&
                this.entityCatalog[relation.targetRef].spec?.type ===
                    "access-key")
                .map((relation) => this.entityCatalog[relation.targetRef]);
            return [...acc, { signer, contracts, roles, keys }];
        }, [])
            .filter((info) => info.keys?.length || info.contracts?.length || info.roles?.length);
    }
}
exports.AddressCollector = AddressCollector;


/***/ }),

/***/ 19933:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BaseCollector = void 0;
const catalog_model_1 = __webpack_require__(70606);
class BaseCollector {
    constructor(entities) {
        this.entities = [];
        this.entityCatalog = {};
        this.entities = entities;
        this.entityCatalog = entities.reduce((acc, e) => ({ ...acc, [(0, catalog_model_1.stringifyEntityRef)(e)]: e }), {});
    }
    getSystemEntities() {
        return this.entities.filter(catalog_model_1.isSystemEntity).sort(this.sortByName);
    }
    getApiEntities() {
        return this.entities.filter(catalog_model_1.isApiEntity).sort(this.sortByName);
    }
    getResourceEntities() {
        return this.entities.filter(catalog_model_1.isResourceEntity).sort(this.sortByName);
    }
    getUserEntities() {
        return this.entities.filter(catalog_model_1.isUserEntity).sort(this.sortByName);
    }
    getEntityTags(entity) {
        return entity.metadata.tags || [];
    }
    sortByName(a, b) {
        return a.metadata.name.localeCompare(b.metadata.name);
    }
}
exports.BaseCollector = BaseCollector;


/***/ }),

/***/ 99872:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FilteredCollector = void 0;
const pick_1 = __webpack_require__(23274);
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
const base_collector_1 = __webpack_require__(19933);
class MultisigsCollector extends base_collector_1.BaseCollector {
    collectSystems(opts) {
        return this.getSystemEntities()
            .reduce((acc, system) => {
            if (opts.scope && system.spec?.owner !== opts.scope) {
                return acc;
            }
            const components = this.collectComponents(system, opts);
            if (components.some((c) => c.multisigs?.length)) {
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
            .sort((a, b) => this.sortByName(a.system, b.system));
    }
    collectComponents(system, opts = {}) {
        const componentRefs = system.relations.filter((r) => r.type === catalog_model_1.RELATION_HAS_PART &&
            (0, catalog_model_1.parseEntityRef)(r.targetRef).kind === "component");
        return componentRefs
            .reduce((acc, componentRef) => {
            const component = this.entityCatalog[componentRef.targetRef];
            if (opts.lifecycle && component.spec?.lifecycle !== opts.lifecycle) {
                return acc;
            }
            const multisigs = this.collectMultisigs(componentRef);
            if (multisigs.length) {
                return [
                    ...acc,
                    {
                        title: component.metadata.title || component.metadata.name,
                        component,
                        multisigs,
                        tags: this.getEntityTags(component),
                    },
                ];
            }
            return acc;
        }, [])
            .sort((a, b) => this.sortByName(a.component, b.component));
    }
    collectMultisigs(componentRef) {
        return this.getApiEntities()
            .filter((item) => item.relations.some((r) => item.spec?.type === "multisig-deployment" &&
            r.type === catalog_model_1.RELATION_API_PROVIDED_BY &&
            r.targetRef === componentRef.targetRef))
            .map((entity) => ({
            entity: entity,
            signers: this.collectSigners(entity),
            tags: this.getEntityTags(entity),
        }));
    }
    collectSigners(multisig) {
        return multisig
            .relations.filter((r) => r.type === catalog_model_1.RELATION_OWNED_BY &&
            (0, catalog_model_1.parseEntityRef)(r.targetRef).kind !== "group")
            .map((r) => {
            const signer = this.entityCatalog[r.targetRef];
            const owner = this.entityCatalog[signer.spec.owner.toString()];
            return {
                signer,
                owner,
                tags: this.getEntityTags(signer),
            };
        })
            .sort((a, b) => this.sortByName(a.owner, b.owner));
    }
}
exports.MultisigsCollector = MultisigsCollector;


/***/ }),

/***/ 21802:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RbacCollector = void 0;
const catalog_model_1 = __webpack_require__(70606);
const base_collector_1 = __webpack_require__(19933);
class RbacCollector extends base_collector_1.BaseCollector {
    collectSystems(opts) {
        return this.getSystemEntities().reduce((acc, system) => {
            if (opts.scope && system.spec?.owner !== opts.scope) {
                return acc;
            }
            const components = this.collectComponents(system, opts);
            if (components.some((c) => c.contracts?.length)) {
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
        }, []);
    }
    collectComponents(system, opts = {}) {
        const componentRefs = system.relations.filter((r) => r.type === catalog_model_1.RELATION_HAS_PART &&
            (0, catalog_model_1.parseEntityRef)(r.targetRef).kind === "component");
        return componentRefs
            .reduce((acc, componentRef) => {
            const component = this.entityCatalog[componentRef.targetRef];
            if (opts.lifecycle && component.spec?.lifecycle !== opts.lifecycle) {
                return acc;
            }
            const contracts = this.collectContracts(componentRef);
            if (contracts.length) {
                return [
                    ...acc,
                    {
                        title: component.metadata.title || component.metadata.name,
                        component,
                        contracts,
                        tags: this.getEntityTags(component),
                    },
                ];
            }
            return acc;
        }, [])
            .sort((a, b) => a.component.metadata.name.localeCompare(b.component.metadata.name));
    }
    collectContracts(componentRef) {
        return this.getApiEntities()
            .filter((item) => item.spec?.type === "contract-deployment" &&
            item.spec.lifecycle === "production" &&
            item.metadata.tags?.includes("rbac") &&
            item.relations.some((r) => r.type === catalog_model_1.RELATION_API_PROVIDED_BY &&
                r.targetRef === componentRef.targetRef))
            .map((entity) => ({
            entity,
            admins: this.collectAdmins(entity),
            roles: this.collectRoles(entity),
            tags: this.getEntityTags(entity),
        }));
    }
    collectRoles(contract) {
        return contract
            .relations.filter((r) => r.type === catalog_model_1.RELATION_DEPENDS_ON &&
            (0, catalog_model_1.parseEntityRef)(r.targetRef).kind === "api")
            .reduce((acc, r) => {
            const roleGroup = this.entityCatalog[r.targetRef];
            if (roleGroup &&
                roleGroup.spec &&
                roleGroup.spec.members &&
                roleGroup.spec.roleId !== roleGroup.spec.admin) {
                const specMembers = roleGroup.spec.members;
                const members = specMembers.reduce((accMembers, m) => {
                    const member = this.entities.find((e) => e.spec &&
                        // filter out role-groups since they are modeled with
                        // the same fields as a blockchain address
                        e.spec.type !== "role-group" &&
                        e.spec.address?.toString().toLowerCase() === m &&
                        e.spec.network === roleGroup.spec?.network &&
                        e.spec.networkType === roleGroup.spec?.networkType);
                    if (member) {
                        const ownerRef = (0, catalog_model_1.parseEntityRef)(member.spec?.owner);
                        const owner = this.entityCatalog[(0, catalog_model_1.stringifyEntityRef)(ownerRef)];
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
    collectAdmins(contract) {
        return contract
            .relations.filter((r) => r.type === catalog_model_1.RELATION_DEPENDS_ON &&
            (0, catalog_model_1.parseEntityRef)(r.targetRef).kind === "api")
            .reduce((acc, r) => {
            const roleGroup = this.entityCatalog[r.targetRef];
            if (roleGroup && roleGroup.spec?.roleId === roleGroup.spec?.admin) {
                const specMembers = roleGroup.spec?.members;
                const members = specMembers.reduce((accMembers, m) => {
                    const member = this.entities.find((e) => e.spec &&
                        // filter out role-groups since they are modeled with
                        // the same fields as a blockchain address
                        e.spec.type !== "role-group" &&
                        e.spec.address?.toString().toLowerCase() === m &&
                        e.spec.network === roleGroup.spec?.network &&
                        e.spec.networkType === roleGroup.spec?.networkType);
                    if (member) {
                        const ownerRef = (0, catalog_model_1.parseEntityRef)(member.spec?.owner);
                        const owner = this.entityCatalog[(0, catalog_model_1.stringifyEntityRef)(ownerRef)];
                        return [...accMembers, { member, owner }];
                    }
                    return accMembers;
                }, []);
                return [...acc, { adminRole: roleGroup, members }];
            }
            return acc;
        }, [])
            .sort((a, b) => this.sortByName(a.adminRole, b.adminRole));
    }
}
exports.RbacCollector = RbacCollector;


/***/ }),

/***/ 95204:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UnknownCollector = void 0;
const access_key_collector_1 = __webpack_require__(30062);
const multisigs_collector_1 = __webpack_require__(25498);
const rbac_collector_1 = __webpack_require__(21802);
class UnknownCollector {
    constructor(entities) {
        this.entities = [];
        this.entities = entities;
    }
    collectEntities(opts = {}) {
        const accessKeyCollector = new access_key_collector_1.AccessKeyCollector(this.entities);
        const multisigCollector = new multisigs_collector_1.MultisigsCollector(this.entities);
        const rbacCollector = new rbac_collector_1.RbacCollector(this.entities);
        const unknownMultisigs = multisigCollector
            .collectSystems(opts)
            .reduce((acc, system) => {
            return [
                ...acc,
                {
                    ...system,
                    components: system.components
                        .map((component) => {
                        return {
                            ...component,
                            multisigs: component.multisigs &&
                                component.multisigs.filter((multisig) => multisig.signers.some((info) => info.signer.metadata.namespace === "stub")),
                        };
                    })
                        .filter((component) => component.multisigs &&
                        component.multisigs.some((multisig) => multisig.signers.some((info) => info.signer.metadata.namespace === "stub"))),
                },
            ];
        }, [])
            .filter((system) => system.components.length > 0);
        const unknownRbac = rbacCollector
            .collectSystems(opts)
            .reduce((acc, system) => {
            return [
                ...acc,
                {
                    ...system,
                    components: system.components
                        .map((component) => {
                        return {
                            ...component,
                            contracts: component.contracts &&
                                component.contracts.filter((contract) => contract.roles &&
                                    contract.roles.some((role) => role.members.some((info) => info.member.metadata.namespace === "stub"))),
                        };
                    })
                        .filter((component) => component.contracts &&
                        component.contracts.some((contract) => contract.roles &&
                            contract.roles.some((role) => role.members.some((info) => info.member.metadata.namespace === "stub")))),
                },
            ];
        }, [])
            .filter((system) => system.components.length > 0);
        const unknownAccessKeys = accessKeyCollector
            .collectSystems(opts)
            .reduce((acc, system) => {
            return [
                ...acc,
                {
                    ...system,
                    components: system.components.filter((component) => component.contracts &&
                        component.contracts.some((contract) => contract.keys &&
                            contract.keys.some((info) => info.key.metadata.namespace === "stub"))),
                },
            ];
        }, [])
            .filter((system) => system.components.length > 0);
        return [...unknownAccessKeys, ...unknownRbac, ...unknownMultisigs];
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
const handlebars_1 = __importDefault(__webpack_require__(80474));
const multisigs_collector_1 = __webpack_require__(25498);
const filtered_collector_1 = __webpack_require__(99872);
const rbac_collector_1 = __webpack_require__(21802);
const access_key_collector_1 = __webpack_require__(30062);
const unknown_collector_1 = __webpack_require__(95204);
const address_collector_1 = __webpack_require__(59038);
const get_backstage_entities_1 = __webpack_require__(53249);
class BackstageExport {
    constructor() {
        this.template_path = "";
        this.output_path = "";
    }
}
exports.BackstageExport = BackstageExport;
const backstageExport = async ({ backstage_url, backstage_entities_repo, template_path, output_path, scope, lifecycle, testing, }) => {
    if (!template_path || !output_path) {
        throw new Error("set template_path and output_path for handlebars templating");
    }
    const entities = await (0, get_backstage_entities_1.getBackstageEntities)({
        backstage_url,
        backstage_entities_repo,
    });
    const filteredCollector = new filtered_collector_1.FilteredCollector(entities, {
        scope,
        lifecycle,
    });
    const multisigsCollector = new multisigs_collector_1.MultisigsCollector(entities);
    const rbacCollector = new rbac_collector_1.RbacCollector(entities);
    const accessKeyCollector = new access_key_collector_1.AccessKeyCollector(entities);
    const unknownCollector = new unknown_collector_1.UnknownCollector(entities);
    const addressCollector = new address_collector_1.AddressCollector(entities);
    const changedFiles = (0, glob_1.sync)(`${template_path}**/*.hbs`).reduce((acc, templatePath) => {
        const templateData = {
            multisigSystemComponents: multisigsCollector.collectSystems({
                scope,
                lifecycle,
            }),
            contractSystemComponents: rbacCollector.collectSystems({
                scope,
                lifecycle,
            }),
            accessKeySystemComponents: accessKeyCollector.collectSystems({
                scope,
                lifecycle,
            }),
            unknownSystemComponents: unknownCollector.collectEntities({
                scope,
                lifecycle,
            }),
            addresses: addressCollector.collectAddresses({ scope, lifecycle }),
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
    const hasChangedFiles = changedFiles.length !== 0;
    if (hasChangedFiles) {
        core.info(`${changedFiles.length} changed files`);
    }
    else {
        core.info("No changed files");
    }
    return testing ? true : hasChangedFiles;
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

/***/ 23274:
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


/***/ })

};
;
//# sourceMappingURL=394.index.js.map