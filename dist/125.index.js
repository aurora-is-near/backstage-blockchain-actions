"use strict";
exports.id = 125;
exports.ids = [125];
exports.modules = {

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
    sortByName(a, b) {
        return a.metadata.name.localeCompare(b.metadata.name);
    }
}
exports.BaseCollector = BaseCollector;


/***/ }),

/***/ 8554:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MetricsCollector = void 0;
const catalog_model_1 = __webpack_require__(70606);
const base_collector_1 = __webpack_require__(19933);
const multisigs_collector_1 = __webpack_require__(25498);
class MetricsCollector extends base_collector_1.BaseCollector {
    constructor(entities, opts = {}) {
        super(entities);
        this.multisigInfos = [];
        this.apiEntities = [];
        this.resourceEntities = [];
        this.contracts = [];
        this.accessKeys = [];
        this.apiEntities = this.getApiEntities();
        this.resourceEntities = this.getResourceEntities();
        this.contracts = this.apiEntities.filter((item) => item.spec?.type === "contract-deployment");
        this.accessKeys = this.resourceEntities.filter((item) => item.spec?.type === "access-key");
        this.multisigInfos = new multisigs_collector_1.MultisigsCollector(entities)
            .collectSystems(opts)
            .flatMap((system) => system.components.flatMap((component) => component.multisigs))
            .filter(this.isDefined);
    }
    getAllApis() {
        return this.apiEntities;
    }
    getAllResources() {
        return this.resourceEntities;
    }
    getMultisigs() {
        return this.multisigInfos;
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
                const key = this.entityCatalog[relation.targetRef];
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
                const key = this.entityCatalog[relation.targetRef];
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
                const key = this.entityCatalog[relation.targetRef];
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
    isDefined(entity) {
        return entity !== undefined;
    }
}
exports.MetricsCollector = MetricsCollector;


/***/ }),

/***/ 25498:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MultisigsCollector = void 0;
const catalog_model_1 = __webpack_require__(70606);
const base_collector_1 = __webpack_require__(19933);
class MultisigsCollector extends base_collector_1.BaseCollector {
    constructor(entities) {
        super(entities);
        this.multisigs = [];
        this.multisigs = this.getApiEntities().filter((item) => item.spec?.type === "multisig-deployment");
    }
    normalizeEntities(list) {
        return [...new Set(list)].sort((a, b) => a.localeCompare(b));
    }
    collectSystems(opts) {
        const systemRefs = this.normalizeEntities(this.multisigs.map((item) => item.spec.system));
        return systemRefs
            .reduce((acc, systemRef) => {
            const system = this.entityCatalog[systemRef];
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
            const component = this.entityCatalog[componentRef.targetRef];
            return {
                title: component.metadata.title || component.metadata.name,
                component,
                multisigs: this.collectMultisigs(componentRef),
            };
        })
            .sort((a, b) => a.component.metadata.name.localeCompare(b.component.metadata.name));
    }
    collectMultisigs(componentRef) {
        return this.multisigs
            .filter((item) => item.relations.some((r) => r.type === "apiProvidedBy" &&
            r.targetRef === componentRef.targetRef))
            .map((ms) => ({
            entity: ms,
            signers: this.collectSigners(ms),
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
            };
        })
            .sort((a, b) => a.owner.metadata.name.localeCompare(b.owner.metadata.name));
    }
}
exports.MultisigsCollector = MultisigsCollector;


/***/ }),

/***/ 11125:
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
exports.backstageMetrics = exports.BackstageMetrics = void 0;
const core = __importStar(__webpack_require__(68434));
const datadog_api_client_1 = __webpack_require__(86885);
const metrics_collector_1 = __webpack_require__(8554);
const get_backstage_entities_1 = __webpack_require__(53249);
const configuration = datadog_api_client_1.client.createConfiguration();
configuration.setServerVariables({ site: "datadoghq.eu" });
const apiInstance = new datadog_api_client_1.v2.MetricsApi(configuration);
const DATADOG_GAUGE_TYPE = 3;
const SIGNER_POLICY_LIMIT_MS = 180 * 86400 * 1000; // amount of days * seconds in day * milliseconds in second
class BackstageMetrics {
}
exports.BackstageMetrics = BackstageMetrics;
async function backstageMetrics({ backstage_url, testing, }) {
    if (!backstage_url)
        return;
    const entities = await (0, get_backstage_entities_1.getBackstageEntities)({ backstage_url });
    const collector = new metrics_collector_1.MetricsCollector(entities);
    try {
        const multisigSeries = generateMultisigMetrics(collector, backstage_url);
        const signerSeries = generateSignerMetrics(collector, backstage_url);
        const keySeries = generateAccessKeyMetrics(collector, backstage_url);
        const keyCountByOwnerSeries = generateUserAccessKeyMetrics(collector, backstage_url);
        const keyCountByContractSeries = generateContractAccessKeyMetrics(collector, backstage_url);
        const deprecatedKeysSeries = generateDeprecatedAccessKeyMetrics(collector, backstage_url);
        const unknownAccessKeysSeries = generateUnknownAccessKeyMetrics(collector, backstage_url);
        const unknownSignerSeries = generateUnknownSignerMetrics(collector, backstage_url);
        const unknownAddressSeries = generateUnknownAddressMetrics(collector, backstage_url);
        const inactiveSignerSeries = generateInactiveSignerMetrics(collector, backstage_url);
        // const unverifiedContractSeries = generateUnverifiedContractsMetrics(multisigsCollector, backstage_url);
        if (testing) {
            return [];
        }
        const data = await Promise.all([
            submitMetrics(multisigSeries),
            submitMetrics(signerSeries),
            submitMetrics(keySeries),
            submitMetrics(keyCountByOwnerSeries),
            submitMetrics(keyCountByContractSeries),
            submitMetrics(deprecatedKeysSeries),
            submitMetrics(unknownAccessKeysSeries),
            submitMetrics(unknownSignerSeries),
            submitMetrics(unknownAddressSeries),
            submitMetrics(inactiveSignerSeries),
            // submitMetrics(unverifiedContractSeries)
        ]);
        core.info(`API called successfully. Returned data: ${JSON.stringify(data)}`);
        return data;
    }
    catch (error) {
        core.error(error);
    }
}
exports.backstageMetrics = backstageMetrics;
async function submitMetrics(series) {
    const params = {
        body: {
            series,
        },
    };
    core.info(`Data to upload: ${JSON.stringify(params)}`);
    return apiInstance.submitMetrics(params);
}
function generateMultisigMetrics(collector, backstageUrl) {
    const series = collector.getMultisigs().map((multisig) => {
        // entities are typically emitted as API kind,
        // tracking for inconsistencies
        const { kind, metadata } = multisig.entity;
        const { name } = metadata;
        // inferred type is JsonObject, this converts to any
        const spec = JSON.parse(JSON.stringify(multisig.entity.spec));
        const { address, network, networkType, system: rawSystem, owner: rawOwner, } = spec;
        const system = rawSystem.split(":")[1];
        const owner = rawOwner.split(":")[1];
        const timestamp = Math.round(new Date(spec.multisig.fetchDate).getTime() / 1000);
        // this tags timeseries with distinguishing
        // properties for filtering purposes
        const resources = [
            {
                type: "host",
                name: backstageUrl.split("@")[1],
            },
            { type: "api", name },
            { type: "address", name: address },
            { type: "kind", name: kind },
            { type: "network", name: network },
            { type: "networkType", name: networkType },
            { type: "system", name: system },
            { type: "owner", name: owner },
        ];
        const { version } = spec.multisig;
        // datadog requires point value to be scalar
        const value = parseFloat(version);
        const points = [{ timestamp, value }];
        return {
            metric: "backstage.multisigs.version",
            type: DATADOG_GAUGE_TYPE,
            points,
            resources,
        };
    });
    return series;
}
function generateSignerMetrics(collector, backstageUrl) {
    const series = collector.getSigners().map((signer) => {
        // entities are typically emitted as API kind,
        // tracking for inconsistencies
        const { kind, metadata } = signer.signer;
        const { name, namespace } = metadata;
        // inferred type is JsonObject, this converts to any
        const spec = JSON.parse(JSON.stringify(signer.signer.spec));
        const { address, network, networkType, owner: rawOwner } = spec;
        const owner = rawOwner.split(":")[1].split("/")[1];
        // this tags timeseries with distinguishing
        // properties for filtering purposes
        const resources = [
            {
                type: "host",
                name: backstageUrl.split("@")[1],
            },
            { type: "kind", name: kind },
            { type: "name", name },
            { type: "namespace", name: namespace },
            { type: "address", name: address },
            { type: "network", name: network },
            { type: "networkType", name: networkType },
            { type: "owner", name: owner },
        ];
        // datadog requires point value to be scalar, 0 means unknown ownership
        const value = namespace === "stub" ? 0 : 1;
        const timestamp = Math.round(new Date().getTime() / 1000);
        const points = [{ timestamp, value }];
        return {
            metric: "backstage.signers",
            type: DATADOG_GAUGE_TYPE,
            points,
            resources,
        };
    });
    return series;
}
function generateUnknownSignerMetrics(collector, backstageUrl) {
    const unknownSigners = collector
        .getSigners()
        .filter((entry) => entry.signer.metadata.tags?.includes("stub") ||
        entry.signer.metadata.namespace === "stub");
    const series = unknownSigners.map((signer) => {
        // entities are typically emitted as API kind,
        // tracking for inconsistencies
        const { kind, metadata } = signer.signer;
        const { name, namespace } = metadata;
        // inferred type is JsonObject, this converts to any
        const spec = JSON.parse(JSON.stringify(signer.signer.spec));
        const { address, network, networkType, owner: rawOwner } = spec;
        const owner = rawOwner.split(":")[1].split("/")[1];
        // this tags timeseries with distinguishing
        // properties for filtering purposes
        const resources = [
            {
                type: "host",
                name: backstageUrl.split("@")[1],
            },
            { type: "kind", name: kind },
            { type: "name", name },
            { type: "namespace", name: namespace },
            { type: "address", name: address },
            { type: "network", name: network },
            { type: "networkType", name: networkType },
            { type: "owner", name: owner },
        ];
        // datadog requires point value to be scalar, 0 means unknown ownership
        const value = 1;
        const timestamp = Math.round(new Date().getTime() / 1000);
        const points = [{ timestamp, value }];
        return {
            metric: "backstage.signers.unknown",
            type: DATADOG_GAUGE_TYPE,
            points,
            resources,
        };
    });
    return series;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function generateUnverifiedContractsMetrics(collector, backstageUrl) {
    const unverifiedContracts = collector
        .getAllApis()
        .filter((entity) => entity.metadata.tags?.includes("unverified"));
    const series = unverifiedContracts.map((entity) => {
        // entities are typically emitted as API kind,
        // tracking for inconsistencies
        const { kind, metadata } = entity;
        const { name, namespace } = metadata;
        // inferred type is JsonObject, this converts to any
        const spec = JSON.parse(JSON.stringify(entity.spec));
        const { address, network, networkType, owner: rawOwner } = spec;
        const owner = rawOwner.split(":")[1].split("/")[1];
        // this tags timeseries with distinguishing
        // properties for filtering purposes
        const resources = [
            {
                type: "host",
                name: backstageUrl.split("@")[1],
            },
            { type: "kind", name: kind },
            { type: "name", name },
            { type: "namespace", name: namespace },
            { type: "address", name: address },
            { type: "network", name: network },
            { type: "networkType", name: networkType },
            { type: "owner", name: owner },
        ];
        // datadog requires point value to be scalar, 0 means unknown ownership
        const value = 1;
        const timestamp = Math.round(new Date().getTime() / 1000);
        const points = [{ timestamp, value }];
        return {
            metric: "backstage.reports.unverified=contracts",
            type: DATADOG_GAUGE_TYPE,
            points,
            resources,
        };
    });
    return series;
}
function generateUnknownAddressMetrics(collector, backstageUrl) {
    const stubAndStateEntities = collector
        .getAllResources()
        .filter((entry) => entry.metadata.tags?.includes("stub") &&
        entry.metadata.tags?.includes("contract-state"));
    const series = stubAndStateEntities.map((entity) => {
        // entities are typically emitted as API kind,
        // tracking for inconsistencies
        const { kind, metadata } = entity;
        const { name, namespace } = metadata;
        // inferred type is JsonObject, this converts to any
        const spec = JSON.parse(JSON.stringify(entity.spec));
        const { address, network, networkType, owner: rawOwner } = spec;
        const owner = rawOwner.split(":")[1].split("/")[1];
        // this tags timeseries with distinguishing
        // properties for filtering purposes
        const resources = [
            {
                type: "host",
                name: backstageUrl.split("@")[1],
            },
            { type: "kind", name: kind },
            { type: "name", name },
            { type: "namespace", name: namespace },
            { type: "address", name: address },
            { type: "network", name: network },
            { type: "networkType", name: networkType },
            { type: "owner", name: owner },
        ];
        // datadog requires point value to be scalar, 0 means unknown ownership
        const value = 1;
        const timestamp = Math.round(new Date().getTime() / 1000);
        const points = [{ timestamp, value }];
        return {
            metric: "backstage.reports.unknown-addresses",
            type: DATADOG_GAUGE_TYPE,
            points,
            resources,
        };
    });
    return series;
}
function generateAccessKeyMetrics(collector, backstageUrl) {
    const series = collector
        .getMultisigAccessKeys()
        .map((key) => {
        // entities are typically emitted as Resource kind,
        // tracking for inconsistencies
        const { kind, metadata } = key;
        const { name, namespace } = metadata;
        // inferred type is JsonObject, this converts to any
        const spec = JSON.parse(JSON.stringify(key.spec));
        const { owner: rawOwner } = spec;
        const [ownerKind, ownerRef] = rawOwner.split(":");
        const ownerName = ownerRef.split("/")[1];
        // this tags timeseries with distinguishing
        // properties for filtering purposes
        const resources = [
            {
                type: "host",
                name: backstageUrl.split("@")[1],
            },
            { type: "kind", name: kind },
            { type: "name", name },
            { type: "namespace", name: namespace },
            { type: "owner", name: ownerName },
            { type: "ownerKind", name: ownerKind },
        ];
        const value = namespace === "stub" || ownerKind !== "user" ? 0 : 1;
        const timestamp = Math.round(new Date().getTime() / 1000);
        const points = [{ timestamp, value }];
        return {
            metric: "backstage.access_keys",
            type: DATADOG_GAUGE_TYPE,
            points,
            resources,
        };
    });
    return series;
}
function generateDeprecatedAccessKeyMetrics(collector, backstageUrl) {
    const series = collector
        .getDeprecatedAccessKeys()
        .map((key) => {
        // entities are typically emitted as Resource kind,
        // tracking for inconsistencies
        const { kind, metadata } = key;
        const { name, namespace } = metadata;
        // inferred type is JsonObject, this converts to any
        const spec = JSON.parse(JSON.stringify(key.spec));
        const { owner: rawOwner } = spec;
        const [ownerKind, ownerRef] = rawOwner.split(":");
        const ownerName = ownerRef.split("/")[1];
        // this tags timeseries with distinguishing
        // properties for filtering purposes
        const resources = [
            {
                type: "host",
                name: backstageUrl.split("@")[1],
            },
            { type: "kind", name: kind },
            { type: "name", name },
            { type: "namespace", name: namespace },
            { type: "owner", name: ownerName },
            { type: "ownerKind", name: ownerKind },
        ];
        const value = ownerKind !== "user" ? 0 : 1;
        const timestamp = Math.round(new Date().getTime() / 1000);
        const points = [{ timestamp, value }];
        return {
            metric: "backstage.access_keys.deprecated",
            type: DATADOG_GAUGE_TYPE,
            points,
            resources,
        };
    });
    return series;
}
function generateUnknownAccessKeyMetrics(collector, backstageUrl) {
    const series = collector
        .getUnknownAccessKeys()
        .map((key) => {
        // entities are typically emitted as Resource kind,
        // tracking for inconsistencies
        const { kind, metadata } = key;
        const { name, namespace } = metadata;
        // inferred type is JsonObject, this converts to any
        const spec = JSON.parse(JSON.stringify(key.spec));
        const { owner: rawOwner } = spec;
        const [ownerKind, ownerRef] = rawOwner.split(":");
        const ownerName = ownerRef.split("/")[1];
        // this tags timeseries with distinguishing
        // properties for filtering purposes
        const resources = [
            {
                type: "host",
                name: backstageUrl.split("@")[1],
            },
            { type: "kind", name: kind },
            { type: "name", name },
            { type: "namespace", name: namespace },
            { type: "owner", name: ownerName },
            { type: "ownerKind", name: ownerKind },
        ];
        const value = 1;
        const timestamp = Math.round(new Date().getTime() / 1000);
        const points = [{ timestamp, value }];
        return {
            metric: "backstage.access_keys.unknown",
            type: DATADOG_GAUGE_TYPE,
            points,
            resources,
        };
    });
    return series;
}
function generateUserAccessKeyMetrics(collector, backstageUrl) {
    const series = Object.entries(collector.getAccessKeysPerSigner()).map(([signer, entry]) => {
        const spec = JSON.parse(JSON.stringify(entry.signer.spec));
        const { owner } = spec;
        const ownerName = `${owner}/${signer}`;
        const resources = [
            {
                type: "host",
                name: backstageUrl.split("@")[1],
            },
            { type: "owner", name: ownerName },
            { type: "user", name: owner },
            { type: "signer", name: signer },
        ];
        const value = entry.keys.length;
        const timestamp = Math.round(new Date().getTime() / 1000);
        const points = [{ timestamp, value }];
        return {
            metric: "backstage.access_keys_owned_count",
            type: DATADOG_GAUGE_TYPE,
            points,
            resources,
        };
    });
    return series;
}
function generateContractAccessKeyMetrics(collector, backstageUrl) {
    const accessKeysPerContract = collector
        .getContractAccessKeys()
        .reduce((acc, key) => {
        // inferred type is JsonObject, this converts to any
        const spec = JSON.parse(JSON.stringify(key.spec));
        const { owner } = spec;
        return {
            ...acc,
            [owner]: [...(acc[owner] || []), key],
        };
    }, {});
    const series = Object.entries(accessKeysPerContract).map(([owner, keys]) => {
        const resources = [
            {
                type: "host",
                name: backstageUrl.split("@")[1],
            },
            { type: "owner", name: owner },
        ];
        const value = keys.length;
        const timestamp = Math.round(new Date().getTime() / 1000);
        const points = [{ timestamp, value }];
        return {
            metric: "backstage.access_keys_by_contract_count",
            type: DATADOG_GAUGE_TYPE,
            points,
            resources,
        };
    });
    return series;
}
function generateInactiveSignerMetrics(collector, backstageUrl) {
    const series = collector.getSigners().map((entity) => {
        // entities are typically emitted as API kind,
        // tracking for inconsistencies
        const { kind, metadata } = entity.signer;
        const { name, namespace } = metadata;
        // inferred type is JsonObject, this converts to any
        const spec = JSON.parse(JSON.stringify(entity.signer.spec));
        const { address, network, networkType, owner: rawOwner } = spec;
        const owner = rawOwner.split(":")[1].split("/")[1];
        // this tags timeseries with distinguishing
        // properties for filtering purposes
        const resources = [
            {
                type: "host",
                name: backstageUrl.split("@")[1],
            },
            { type: "kind", name: kind },
            { type: "name", name },
            { type: "namespace", name: namespace },
            { type: "address", name: address },
            { type: "network", name: network },
            { type: "networkType", name: networkType },
            { type: "owner", name: owner },
        ];
        const now = new Date().getTime();
        const isPastThreshold = now - Number(spec.lastSigned) > SIGNER_POLICY_LIMIT_MS;
        const value = isPastThreshold ? 1 : 0;
        const points = [{ timestamp: now, value }];
        return {
            metric: "backstage.signers.inactive",
            type: DATADOG_GAUGE_TYPE,
            points,
            resources,
        };
    });
    return series;
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
//# sourceMappingURL=125.index.js.map