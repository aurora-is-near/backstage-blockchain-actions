"use strict";
exports.id = 125;
exports.ids = [125];
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

/***/ 11125:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "BackstageMetrics": () => (/* binding */ BackstageMetrics),
/* harmony export */   "backstageMetrics": () => (/* binding */ backstageMetrics)
/* harmony export */ });
/* harmony import */ var _actions_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(68434);
/* harmony import */ var _actions_core__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_actions_core__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _datadog_datadog_api_client__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(86885);
/* harmony import */ var _datadog_datadog_api_client__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_datadog_datadog_api_client__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _core_multisigs_collector__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(25498);
/* harmony import */ var _utils_get_backstage_entities__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(53249);
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};




const configuration = _datadog_datadog_api_client__WEBPACK_IMPORTED_MODULE_1__.client.createConfiguration();
configuration.setServerVariables({ site: "datadoghq.eu" });
const apiInstance = new _datadog_datadog_api_client__WEBPACK_IMPORTED_MODULE_1__.v2.MetricsApi(configuration);
const DATADOG_GAUGE_TYPE = 3;
const SIGNER_POLICY_LIMIT_MS = 180 * 86400 * 1000; // amount of days * seconds in day * milliseconds in second
class BackstageMetrics {
}
function backstageMetrics({ backstage_url, testing, }) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!backstage_url)
            return;
        const entities = yield (0,_utils_get_backstage_entities__WEBPACK_IMPORTED_MODULE_2__/* .getBackstageEntities */ .g)({ backstage_url });
        const multisigsCollector = new _core_multisigs_collector__WEBPACK_IMPORTED_MODULE_3__/* .MultisigsCollector */ .d(entities);
        try {
            const multisigSeries = generateMultisigMetrics(multisigsCollector, backstage_url);
            const signerSeries = generateSignerMetrics(multisigsCollector, backstage_url);
            const keySeries = generateAccessKeyMetrics(multisigsCollector, backstage_url);
            const keyCountByOwnerSeries = generateUserAccessKeyMetrics(multisigsCollector, backstage_url);
            const keyCountByContractSeries = generateContractAccessKeyMetrics(multisigsCollector, backstage_url);
            const deprecatedKeysSeries = generateDeprecatedAccessKeyMetrics(multisigsCollector, backstage_url);
            const unknownAccessKeysSeries = generateUnknownAccessKeyMetrics(multisigsCollector, backstage_url);
            const unknownSignerSeries = generateUnknownSignerMetrics(multisigsCollector, backstage_url);
            const unknownAddressSeries = generateUnknownAddressMetrics(multisigsCollector, backstage_url);
            const inactiveSignerSeries = generateInactiveSignerMetrics(multisigsCollector, backstage_url);
            // const unverifiedContractSeries = generateUnverifiedContractsMetrics(multisigsCollector, backstage_url);
            if (testing) {
                return [];
            }
            const data = yield Promise.all([
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
            _actions_core__WEBPACK_IMPORTED_MODULE_0__.info(`API called successfully. Returned data: ${JSON.stringify(data)}`);
            return data;
        }
        catch (error) {
            _actions_core__WEBPACK_IMPORTED_MODULE_0__.error(error);
        }
    });
}
function submitMetrics(series) {
    return __awaiter(this, void 0, void 0, function* () {
        const params = {
            body: {
                series,
            },
        };
        _actions_core__WEBPACK_IMPORTED_MODULE_0__.info(`Data to upload: ${JSON.stringify(params)}`);
        return apiInstance.submitMetrics(params);
    });
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
        .filter((entry) => {
        var _a;
        return ((_a = entry.signer.metadata.tags) === null || _a === void 0 ? void 0 : _a.includes("stub")) ||
            entry.signer.metadata.namespace === "stub";
    });
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
        .filter((entity) => { var _a; return (_a = entity.metadata.tags) === null || _a === void 0 ? void 0 : _a.includes("unverified"); });
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
        .filter((entry) => {
        var _a, _b;
        return ((_a = entry.metadata.tags) === null || _a === void 0 ? void 0 : _a.includes("stub")) &&
            ((_b = entry.metadata.tags) === null || _b === void 0 ? void 0 : _b.includes("contract-state"));
    });
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
        return Object.assign(Object.assign({}, acc), { [owner]: [...(acc[owner] || []), key] });
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
//# sourceMappingURL=125.index.js.map