exports.id = 154;
exports.ids = [154];
exports.modules = {

/***/ 55497:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

var catalogModel = __webpack_require__(70606);
var errors = __webpack_require__(45141);
var crossFetch = __webpack_require__(75226);

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var crossFetch__default = /*#__PURE__*/_interopDefaultLegacy(crossFetch);

const CATALOG_FILTER_EXISTS = Symbol.for(
  // Random UUID to ensure no collisions
  "CATALOG_FILTER_EXISTS_0e15b590c0b343a2bae3e787e84c2111"
);

function isQueryEntitiesInitialRequest(request) {
  return !request.cursor;
}

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class CatalogClient {
  constructor(options) {
    __publicField(this, "discoveryApi");
    __publicField(this, "fetchApi");
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi || { fetch: crossFetch__default["default"] };
  }
  /**
   * {@inheritdoc CatalogApi.getEntityAncestors}
   */
  async getEntityAncestors(request, options) {
    const { kind, namespace, name } = catalogModel.parseEntityRef(request.entityRef);
    return await this.requestRequired(
      "GET",
      `/entities/by-name/${encodeURIComponent(kind)}/${encodeURIComponent(
        namespace
      )}/${encodeURIComponent(name)}/ancestry`,
      options
    );
  }
  /**
   * {@inheritdoc CatalogApi.getLocationById}
   */
  async getLocationById(id, options) {
    return await this.requestOptional(
      "GET",
      `/locations/${encodeURIComponent(id)}`,
      options
    );
  }
  /**
   * {@inheritdoc CatalogApi.getEntities}
   */
  async getEntities(request, options) {
    const {
      filter = [],
      fields = [],
      order,
      offset,
      limit,
      after
    } = request != null ? request : {};
    const params = this.getParams(filter);
    if (fields.length) {
      params.push(`fields=${fields.map(encodeURIComponent).join(",")}`);
    }
    if (order) {
      for (const directive of [order].flat()) {
        if (directive) {
          params.push(
            `order=${encodeURIComponent(directive.order)}:${encodeURIComponent(
              directive.field
            )}`
          );
        }
      }
    }
    if (offset !== void 0) {
      params.push(`offset=${offset}`);
    }
    if (limit !== void 0) {
      params.push(`limit=${limit}`);
    }
    if (after !== void 0) {
      params.push(`after=${encodeURIComponent(after)}`);
    }
    const query = params.length ? `?${params.join("&")}` : "";
    const entities = await this.requestRequired(
      "GET",
      `/entities${query}`,
      options
    );
    const refCompare = (a, b) => {
      var _a, _b;
      if (((_a = a.metadata) == null ? void 0 : _a.name) === void 0 || a.kind === void 0 || ((_b = b.metadata) == null ? void 0 : _b.name) === void 0 || b.kind === void 0) {
        return 0;
      }
      const aRef = catalogModel.stringifyEntityRef(a);
      const bRef = catalogModel.stringifyEntityRef(b);
      if (aRef < bRef) {
        return -1;
      }
      if (aRef > bRef) {
        return 1;
      }
      return 0;
    };
    return { items: entities.sort(refCompare) };
  }
  /**
   * {@inheritdoc CatalogApi.getEntitiesByRefs}
   */
  async getEntitiesByRefs(request, options) {
    var _a;
    const body = { entityRefs: request.entityRefs };
    if ((_a = request.fields) == null ? void 0 : _a.length) {
      body.fields = request.fields;
    }
    const baseUrl = await this.discoveryApi.getBaseUrl("catalog");
    const url = `${baseUrl}/entities/by-refs`;
    const response = await this.fetchApi.fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(options == null ? void 0 : options.token) && { Authorization: `Bearer ${options == null ? void 0 : options.token}` }
      },
      method: "POST",
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      throw await errors.ResponseError.fromResponse(response);
    }
    const { items } = await response.json();
    return { items: items.map((i) => i != null ? i : void 0) };
  }
  /**
   * {@inheritdoc CatalogApi.queryEntities}
   */
  async queryEntities(request = {}, options) {
    var _a, _b;
    const params = [];
    if (isQueryEntitiesInitialRequest(request)) {
      const {
        fields = [],
        filter,
        limit,
        orderFields,
        fullTextFilter
      } = request;
      params.push(...this.getParams(filter));
      if (limit !== void 0) {
        params.push(`limit=${limit}`);
      }
      if (orderFields !== void 0) {
        (Array.isArray(orderFields) ? orderFields : [orderFields]).forEach(
          ({ field, order }) => params.push(`orderField=${field},${order}`)
        );
      }
      if (fields.length) {
        params.push(`fields=${fields.map(encodeURIComponent).join(",")}`);
      }
      const normalizedFullTextFilterTerm = (_a = fullTextFilter == null ? void 0 : fullTextFilter.term) == null ? void 0 : _a.trim();
      if (normalizedFullTextFilterTerm) {
        params.push(`fullTextFilterTerm=${normalizedFullTextFilterTerm}`);
      }
      if ((_b = fullTextFilter == null ? void 0 : fullTextFilter.fields) == null ? void 0 : _b.length) {
        params.push(`fullTextFilterFields=${fullTextFilter.fields.join(",")}`);
      }
    } else {
      const { fields = [], limit, cursor } = request;
      params.push(`cursor=${cursor}`);
      if (limit !== void 0) {
        params.push(`limit=${limit}`);
      }
      if (fields.length) {
        params.push(`fields=${fields.map(encodeURIComponent).join(",")}`);
      }
    }
    const query = params.length ? `?${params.join("&")}` : "";
    return this.requestRequired(
      "GET",
      `/entities/by-query${query}`,
      options
    );
  }
  /**
   * {@inheritdoc CatalogApi.getEntityByRef}
   */
  async getEntityByRef(entityRef, options) {
    const { kind, namespace, name } = catalogModel.parseEntityRef(entityRef);
    return this.requestOptional(
      "GET",
      `/entities/by-name/${encodeURIComponent(kind)}/${encodeURIComponent(
        namespace
      )}/${encodeURIComponent(name)}`,
      options
    );
  }
  // NOTE(freben): When we deprecate getEntityByName from the interface, we may
  // still want to leave this implementation in place for quite some time
  // longer, to minimize the risk for breakages. Suggested date for removal:
  // August 2022
  /**
   * @deprecated Use getEntityByRef instead
   */
  async getEntityByName(compoundName, options) {
    const { kind, namespace = "default", name } = compoundName;
    return this.requestOptional(
      "GET",
      `/entities/by-name/${encodeURIComponent(kind)}/${encodeURIComponent(
        namespace
      )}/${encodeURIComponent(name)}`,
      options
    );
  }
  /**
   * {@inheritdoc CatalogApi.refreshEntity}
   */
  async refreshEntity(entityRef, options) {
    const response = await this.fetchApi.fetch(
      `${await this.discoveryApi.getBaseUrl("catalog")}/refresh`,
      {
        headers: {
          "Content-Type": "application/json",
          ...(options == null ? void 0 : options.token) && { Authorization: `Bearer ${options == null ? void 0 : options.token}` }
        },
        method: "POST",
        body: JSON.stringify({ entityRef })
      }
    );
    if (response.status !== 200) {
      throw new Error(await response.text());
    }
  }
  /**
   * {@inheritdoc CatalogApi.getEntityFacets}
   */
  async getEntityFacets(request, options) {
    const { filter = [], facets } = request;
    const params = this.getParams(filter);
    for (const facet of facets) {
      params.push(`facet=${encodeURIComponent(facet)}`);
    }
    const query = params.length ? `?${params.join("&")}` : "";
    return await this.requestOptional("GET", `/entity-facets${query}`, options);
  }
  /**
   * {@inheritdoc CatalogApi.addLocation}
   */
  async addLocation(request, options) {
    const { type = "url", target, dryRun } = request;
    const response = await this.fetchApi.fetch(
      `${await this.discoveryApi.getBaseUrl("catalog")}/locations${dryRun ? "?dryRun=true" : ""}`,
      {
        headers: {
          "Content-Type": "application/json",
          ...(options == null ? void 0 : options.token) && { Authorization: `Bearer ${options == null ? void 0 : options.token}` }
        },
        method: "POST",
        body: JSON.stringify({ type, target })
      }
    );
    if (response.status !== 201) {
      throw new Error(await response.text());
    }
    const { location, entities, exists } = await response.json();
    if (!location) {
      throw new Error(`Location wasn't added: ${target}`);
    }
    return {
      location,
      entities,
      exists
    };
  }
  /**
   * {@inheritdoc CatalogApi.getLocationByRef}
   */
  async getLocationByRef(locationRef, options) {
    const all = await this.requestRequired(
      "GET",
      "/locations",
      options
    );
    return all.map((r) => r.data).find((l) => locationRef === catalogModel.stringifyLocationRef(l));
  }
  /**
   * {@inheritdoc CatalogApi.removeLocationById}
   */
  async removeLocationById(id, options) {
    await this.requestIgnored(
      "DELETE",
      `/locations/${encodeURIComponent(id)}`,
      options
    );
  }
  /**
   * {@inheritdoc CatalogApi.removeEntityByUid}
   */
  async removeEntityByUid(uid, options) {
    await this.requestIgnored(
      "DELETE",
      `/entities/by-uid/${encodeURIComponent(uid)}`,
      options
    );
  }
  /**
   * {@inheritdoc CatalogApi.validateEntity}
   */
  async validateEntity(entity, locationRef, options) {
    const response = await this.fetchApi.fetch(
      `${await this.discoveryApi.getBaseUrl("catalog")}/validate-entity`,
      {
        headers: {
          "Content-Type": "application/json",
          ...(options == null ? void 0 : options.token) && { Authorization: `Bearer ${options == null ? void 0 : options.token}` }
        },
        method: "POST",
        body: JSON.stringify({ entity, location: locationRef })
      }
    );
    if (response.ok) {
      return {
        valid: true
      };
    }
    if (response.status !== 400) {
      throw await errors.ResponseError.fromResponse(response);
    }
    const { errors: errors$1 = [] } = await response.json();
    return {
      valid: false,
      errors: errors$1
    };
  }
  //
  // Private methods
  //
  async requestIgnored(method, path, options) {
    const url = `${await this.discoveryApi.getBaseUrl("catalog")}${path}`;
    const headers = (options == null ? void 0 : options.token) ? { Authorization: `Bearer ${options.token}` } : {};
    const response = await this.fetchApi.fetch(url, { method, headers });
    if (!response.ok) {
      throw await errors.ResponseError.fromResponse(response);
    }
  }
  async requestRequired(method, path, options) {
    const url = `${await this.discoveryApi.getBaseUrl("catalog")}${path}`;
    const headers = (options == null ? void 0 : options.token) ? { Authorization: `Bearer ${options.token}` } : {};
    const response = await this.fetchApi.fetch(url, { method, headers });
    if (!response.ok) {
      throw await errors.ResponseError.fromResponse(response);
    }
    return response.json();
  }
  async requestOptional(method, path, options) {
    const url = `${await this.discoveryApi.getBaseUrl("catalog")}${path}`;
    const headers = (options == null ? void 0 : options.token) ? { Authorization: `Bearer ${options.token}` } : {};
    const response = await this.fetchApi.fetch(url, { method, headers });
    if (!response.ok) {
      if (response.status === 404) {
        return void 0;
      }
      throw await errors.ResponseError.fromResponse(response);
    }
    return await response.json();
  }
  getParams(filter = []) {
    const params = [];
    for (const filterItem of [filter].flat()) {
      const filterParts = [];
      for (const [key, value] of Object.entries(filterItem)) {
        for (const v of [value].flat()) {
          if (v === CATALOG_FILTER_EXISTS) {
            filterParts.push(encodeURIComponent(key));
          } else if (typeof v === "string") {
            filterParts.push(
              `${encodeURIComponent(key)}=${encodeURIComponent(v)}`
            );
          }
        }
      }
      if (filterParts.length) {
        params.push(`filter=${filterParts.join(",")}`);
      }
    }
    return params;
  }
}

const ENTITY_STATUS_CATALOG_PROCESSING_TYPE = "backstage.io/catalog-processing";

exports.CATALOG_FILTER_EXISTS = CATALOG_FILTER_EXISTS;
exports.CatalogClient = CatalogClient;
exports.ENTITY_STATUS_CATALOG_PROCESSING_TYPE = ENTITY_STATUS_CATALOG_PROCESSING_TYPE;
//# sourceMappingURL=index.cjs.js.map


/***/ }),

/***/ 70606:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

var lodash = __webpack_require__(8749);
var Ajv = __webpack_require__(60698);

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var lodash__default = /*#__PURE__*/_interopDefaultLegacy(lodash);
var Ajv__default = /*#__PURE__*/_interopDefaultLegacy(Ajv);

function isApiEntity(entity) {
  return entity.kind.toLocaleUpperCase("en-US") === "API";
}
function isComponentEntity(entity) {
  return entity.kind.toLocaleUpperCase("en-US") === "COMPONENT";
}
function isDomainEntity(entity) {
  return entity.kind.toLocaleUpperCase("en-US") === "DOMAIN";
}
function isGroupEntity(entity) {
  return entity.kind.toLocaleUpperCase("en-US") === "GROUP";
}
function isLocationEntity(entity) {
  return entity.kind.toLocaleUpperCase("en-US") === "LOCATION";
}
function isResourceEntity(entity) {
  return entity.kind.toLocaleUpperCase("en-US") === "RESOURCE";
}
function isSystemEntity(entity) {
  return entity.kind.toLocaleUpperCase("en-US") === "SYSTEM";
}
function isUserEntity(entity) {
  return entity.kind.toLocaleUpperCase("en-US") === "USER";
}

const DEFAULT_NAMESPACE = "default";
const ANNOTATION_VIEW_URL = "backstage.io/view-url";
const ANNOTATION_EDIT_URL = "backstage.io/edit-url";
const ANNOTATION_KUBERNETES_API_SERVER = "kubernetes.io/api-server";
const ANNOTATION_KUBERNETES_API_SERVER_CA = "kubernetes.io/api-server-certificate-authority";
const ANNOTATION_KUBERNETES_AUTH_PROVIDER = "kubernetes.io/auth-provider";

var __defProp$4 = Object.defineProperty;
var __defNormalProp$4 = (obj, key, value) => key in obj ? __defProp$4(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$4 = (obj, key, value) => {
  __defNormalProp$4(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class DefaultNamespaceEntityPolicy {
  constructor(namespace = DEFAULT_NAMESPACE) {
    __publicField$4(this, "namespace");
    this.namespace = namespace;
  }
  async enforce(entity) {
    if (entity.metadata.namespace) {
      return entity;
    }
    return lodash__default["default"].merge({ metadata: { namespace: this.namespace } }, entity);
  }
}

function parseRefString(ref) {
  let colonI = ref.indexOf(":");
  const slashI = ref.indexOf("/");
  if (slashI !== -1 && slashI < colonI) {
    colonI = -1;
  }
  const kind = colonI === -1 ? void 0 : ref.slice(0, colonI);
  const namespace = slashI === -1 ? void 0 : ref.slice(colonI + 1, slashI);
  const name = ref.slice(Math.max(colonI + 1, slashI + 1));
  if (kind === "" || namespace === "" || name === "") {
    throw new TypeError(
      `Entity reference "${ref}" was not on the form [<kind>:][<namespace>/]<name>`
    );
  }
  return { kind, namespace, name };
}
function getCompoundEntityRef(entity) {
  return {
    kind: entity.kind,
    namespace: entity.metadata.namespace || DEFAULT_NAMESPACE,
    name: entity.metadata.name
  };
}
function parseEntityRef(ref, context) {
  var _a, _b, _c, _d;
  if (!ref) {
    throw new Error(`Entity reference must not be empty`);
  }
  const defaultKind = context == null ? void 0 : context.defaultKind;
  const defaultNamespace = (context == null ? void 0 : context.defaultNamespace) || DEFAULT_NAMESPACE;
  let kind;
  let namespace;
  let name;
  if (typeof ref === "string") {
    const parsed = parseRefString(ref);
    kind = (_a = parsed.kind) != null ? _a : defaultKind;
    namespace = (_b = parsed.namespace) != null ? _b : defaultNamespace;
    name = parsed.name;
  } else {
    kind = (_c = ref.kind) != null ? _c : defaultKind;
    namespace = (_d = ref.namespace) != null ? _d : defaultNamespace;
    name = ref.name;
  }
  if (!kind) {
    const textual = JSON.stringify(ref);
    throw new Error(
      `Entity reference ${textual} had missing or empty kind (e.g. did not start with "component:" or similar)`
    );
  } else if (!namespace) {
    const textual = JSON.stringify(ref);
    throw new Error(
      `Entity reference ${textual} had missing or empty namespace`
    );
  } else if (!name) {
    const textual = JSON.stringify(ref);
    throw new Error(`Entity reference ${textual} had missing or empty name`);
  }
  return { kind, namespace, name };
}
function stringifyEntityRef(ref) {
  var _a, _b;
  let kind;
  let namespace;
  let name;
  if ("metadata" in ref) {
    kind = ref.kind;
    namespace = (_a = ref.metadata.namespace) != null ? _a : DEFAULT_NAMESPACE;
    name = ref.metadata.name;
  } else {
    kind = ref.kind;
    namespace = (_b = ref.namespace) != null ? _b : DEFAULT_NAMESPACE;
    name = ref.name;
  }
  return `${kind.toLocaleLowerCase("en-US")}:${namespace.toLocaleLowerCase(
    "en-US"
  )}/${name.toLocaleLowerCase("en-US")}`;
}

var __defProp$3 = Object.defineProperty;
var __defNormalProp$3 = (obj, key, value) => key in obj ? __defProp$3(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$3 = (obj, key, value) => {
  __defNormalProp$3(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class GroupDefaultParentEntityPolicy {
  constructor(parentEntityRef) {
    __publicField$3(this, "parentRef");
    const { kind, namespace, name } = parseEntityRef(parentEntityRef, {
      defaultKind: "Group",
      defaultNamespace: DEFAULT_NAMESPACE
    });
    if (kind.toLocaleUpperCase("en-US") !== "GROUP") {
      throw new TypeError("group parent must be a group");
    }
    this.parentRef = stringifyEntityRef({
      kind,
      namespace,
      name
    });
  }
  async enforce(entity) {
    if (entity.kind !== "Group") {
      return entity;
    }
    const group = entity;
    if (group.spec.parent) {
      return group;
    }
    if (stringifyEntityRef(group) !== this.parentRef) {
      group.spec.parent = this.parentRef;
    }
    return group;
  }
}

class CommonValidatorFunctions {
  /**
   * Checks that the value is on the form `<suffix>` or `<prefix><separator><suffix>`, and validates
   * those parts separately.
   *
   * @param value - The value to check
   * @param separator - The separator between parts
   * @param isValidPrefix - Checks that the part before the separator is valid, if present
   * @param isValidSuffix - Checks that the part after the separator (or the entire value if there is no separator) is valid
   */
  static isValidPrefixAndOrSuffix(value, separator, isValidPrefix, isValidSuffix) {
    if (typeof value !== "string") {
      return false;
    }
    const parts = value.split(separator);
    if (parts.length === 1) {
      return isValidSuffix(parts[0]);
    } else if (parts.length === 2) {
      return isValidPrefix(parts[0]) && isValidSuffix(parts[1]);
    }
    return false;
  }
  /**
   * Checks that the value can be safely transferred as JSON.
   *
   * @param value - The value to check
   */
  static isJsonSafe(value) {
    try {
      return lodash__default["default"].isEqual(value, JSON.parse(JSON.stringify(value)));
    } catch {
      return false;
    }
  }
  /**
   * Checks that the value is a valid DNS subdomain name.
   *
   * @param value - The value to check
   * @see https://tools.ietf.org/html/rfc1123
   */
  static isValidDnsSubdomain(value) {
    return typeof value === "string" && value.length >= 1 && value.length <= 253 && value.split(".").every(CommonValidatorFunctions.isValidDnsLabel);
  }
  /**
   * Checks that the value is a valid DNS label.
   *
   * @param value - The value to check
   * @see https://tools.ietf.org/html/rfc1123
   */
  static isValidDnsLabel(value) {
    return typeof value === "string" && value.length >= 1 && value.length <= 63 && /^[a-z0-9]+(?:\-+[a-z0-9]+)*$/.test(value);
  }
  /**
   * Checks that the value is a valid tag.
   *
   * @deprecated This will be removed in a future release
   * @param value - The value to check
   */
  static isValidTag(value) {
    return typeof value === "string" && value.length >= 1 && value.length <= 63 && /^[a-z0-9+#]+(\-[a-z0-9+#]+)*$/.test(value);
  }
  /**
   * Checks that the value is a valid string URL.
   *
   * @param value - The value to check
   */
  static isValidUrl(value) {
    if (typeof value !== "string") {
      return false;
    }
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }
  /**
   * Checks that the value is a non empty string value.
   *
   * @deprecated use isNonEmptyString instead
   * @param value - The value to check
   */
  static isValidString(value) {
    var _a;
    return typeof value === "string" && ((_a = value == null ? void 0 : value.trim()) == null ? void 0 : _a.length) >= 1;
  }
  /**
   * Checks that the value is a string value that's not empty.
   *
   * @param value - The value to check
   */
  static isNonEmptyString(value) {
    var _a;
    return typeof value === "string" && ((_a = value == null ? void 0 : value.trim()) == null ? void 0 : _a.length) >= 1;
  }
}

var $schema$b = "http://json-schema.org/draft-07/schema";
var $id$b = "EntityEnvelope";
var description$b = "The envelope skeleton parts of an entity - whatever is necessary to be able to give it a ref and pass to further validation / policy checking.";
var examples$a = [
	{
		apiVersion: "backstage.io/v1alpha1",
		kind: "Component",
		metadata: {
			name: "LoremService"
		}
	}
];
var type$3 = "object";
var required$2 = [
	"apiVersion",
	"kind",
	"metadata"
];
var additionalProperties$2 = true;
var properties$2 = {
	apiVersion: {
		type: "string",
		description: "The version of specification format for this particular entity that this is written against.",
		minLength: 1,
		examples: [
			"backstage.io/v1alpha1",
			"my-company.net/v1",
			"1.0"
		]
	},
	kind: {
		type: "string",
		description: "The high level entity type being described.",
		minLength: 1,
		examples: [
			"API",
			"Component",
			"Domain",
			"Group",
			"Location",
			"Resource",
			"System",
			"Template",
			"User"
		]
	},
	metadata: {
		type: "object",
		required: [
			"name"
		],
		additionalProperties: true,
		properties: {
			name: {
				type: "string",
				description: "The name of the entity. Must be unique within the catalog at any given point in time, for any given namespace + kind pair.",
				examples: [
					"metadata-proxy"
				],
				minLength: 1
			},
			namespace: {
				type: "string",
				description: "The namespace that the entity belongs to.",
				"default": "default",
				examples: [
					"default",
					"admin"
				],
				minLength: 1
			}
		}
	}
};
var entityEnvelopeSchema = {
	$schema: $schema$b,
	$id: $id$b,
	description: description$b,
	examples: examples$a,
	type: type$3,
	required: required$2,
	additionalProperties: additionalProperties$2,
	properties: properties$2
};

var $schema$a = "http://json-schema.org/draft-07/schema";
var $id$a = "Entity";
var description$a = "The parts of the format that's common to all versions/kinds of entity.";
var examples$9 = [
	{
		apiVersion: "backstage.io/v1alpha1",
		kind: "Component",
		metadata: {
			name: "LoremService",
			description: "Creates Lorems like a pro.",
			labels: {
				product_name: "Random value Generator"
			},
			annotations: {
				docs: "https://github.com/..../tree/develop/doc"
			}
		},
		spec: {
			type: "service",
			lifecycle: "production",
			owner: "tools"
		}
	}
];
var type$2 = "object";
var required$1 = [
	"apiVersion",
	"kind",
	"metadata"
];
var additionalProperties$1 = false;
var properties$1 = {
	apiVersion: {
		type: "string",
		description: "The version of specification format for this particular entity that this is written against.",
		minLength: 1,
		examples: [
			"backstage.io/v1alpha1",
			"my-company.net/v1",
			"1.0"
		]
	},
	kind: {
		type: "string",
		description: "The high level entity type being described.",
		minLength: 1,
		examples: [
			"API",
			"Component",
			"Domain",
			"Group",
			"Location",
			"Resource",
			"System",
			"Template",
			"User"
		]
	},
	metadata: {
		$ref: "EntityMeta"
	},
	spec: {
		type: "object",
		description: "The specification data describing the entity itself."
	},
	relations: {
		type: "array",
		description: "The relations that this entity has with other entities.",
		items: {
			$ref: "common#relation"
		}
	},
	status: {
		$ref: "common#status"
	}
};
var entitySchema = {
	$schema: $schema$a,
	$id: $id$a,
	description: description$a,
	examples: examples$9,
	type: type$2,
	required: required$1,
	additionalProperties: additionalProperties$1,
	properties: properties$1
};

var $schema$9 = "http://json-schema.org/draft-07/schema";
var $id$9 = "EntityMeta";
var description$9 = "Metadata fields common to all versions/kinds of entity.";
var examples$8 = [
	{
		uid: "e01199ab-08cc-44c2-8e19-5c29ded82521",
		etag: "lsndfkjsndfkjnsdfkjnsd==",
		name: "my-component-yay",
		namespace: "the-namespace",
		labels: {
			"backstage.io/custom": "ValueStuff"
		},
		annotations: {
			"example.com/bindings": "are-secret"
		},
		tags: [
			"java",
			"data"
		]
	}
];
var type$1 = "object";
var required = [
	"name"
];
var additionalProperties = true;
var properties = {
	uid: {
		type: "string",
		description: "A globally unique ID for the entity. This field can not be set by the user at creation time, and the server will reject an attempt to do so. The field will be populated in read operations. The field can (optionally) be specified when performing update or delete operations, but the server is free to reject requests that do so in such a way that it breaks semantics.",
		examples: [
			"e01199ab-08cc-44c2-8e19-5c29ded82521"
		],
		minLength: 1
	},
	etag: {
		type: "string",
		description: "An opaque string that changes for each update operation to any part of the entity, including metadata. This field can not be set by the user at creation time, and the server will reject an attempt to do so. The field will be populated in read operations. The field can (optionally) be specified when performing update or delete operations, and the server will then reject the operation if it does not match the current stored value.",
		examples: [
			"lsndfkjsndfkjnsdfkjnsd=="
		],
		minLength: 1
	},
	name: {
		type: "string",
		description: "The name of the entity. Must be unique within the catalog at any given point in time, for any given namespace + kind pair.",
		examples: [
			"metadata-proxy"
		],
		minLength: 1
	},
	namespace: {
		type: "string",
		description: "The namespace that the entity belongs to.",
		"default": "default",
		examples: [
			"default",
			"admin"
		],
		minLength: 1
	},
	title: {
		type: "string",
		description: "A display name of the entity, to be presented in user interfaces instead of the name property, when available.",
		examples: [
			"React SSR Template"
		],
		minLength: 1
	},
	description: {
		type: "string",
		description: "A short (typically relatively few words, on one line) description of the entity."
	},
	labels: {
		type: "object",
		description: "Key/value pairs of identifying information attached to the entity.",
		additionalProperties: true,
		patternProperties: {
			"^.+$": {
				type: "string"
			}
		}
	},
	annotations: {
		type: "object",
		description: "Key/value pairs of non-identifying auxiliary information attached to the entity.",
		additionalProperties: true,
		patternProperties: {
			"^.+$": {
				type: "string"
			}
		}
	},
	tags: {
		type: "array",
		description: "A list of single-valued strings, to for example classify catalog entities in various ways.",
		items: {
			type: "string",
			minLength: 1
		}
	},
	links: {
		type: "array",
		description: "A list of external hyperlinks related to the entity. Links can provide additional contextual information that may be located outside of Backstage itself. For example, an admin dashboard or external CMS page.",
		items: {
			type: "object",
			required: [
				"url"
			],
			properties: {
				url: {
					type: "string",
					description: "A url in a standard uri format.",
					examples: [
						"https://admin.example-org.com"
					],
					minLength: 1
				},
				title: {
					type: "string",
					description: "A user friendly display name for the link.",
					examples: [
						"Admin Dashboard"
					],
					minLength: 1
				},
				icon: {
					type: "string",
					description: "A key representing a visual icon to be displayed in the UI.",
					examples: [
						"dashboard"
					],
					minLength: 1
				},
				type: {
					type: "string",
					description: "An optional value to categorize links into specific groups.",
					examples: [
						"runbook",
						"documentation",
						"logs",
						"dashboard"
					],
					minLength: 1
				}
			}
		}
	}
};
var entityMetaSchema = {
	$schema: $schema$9,
	$id: $id$9,
	description: description$9,
	examples: examples$8,
	type: type$1,
	required: required,
	additionalProperties: additionalProperties,
	properties: properties
};

var $schema$8 = "http://json-schema.org/draft-07/schema";
var $id$8 = "common";
var type = "object";
var description$8 = "Common definitions to import from other schemas";
var definitions = {
	reference: {
		$id: "#reference",
		type: "object",
		description: "A reference by name to another entity.",
		required: [
			"kind",
			"namespace",
			"name"
		],
		additionalProperties: false,
		properties: {
			kind: {
				type: "string",
				description: "The kind field of the entity.",
				minLength: 1
			},
			namespace: {
				type: "string",
				description: "The metadata.namespace field of the entity.",
				minLength: 1
			},
			name: {
				type: "string",
				description: "The metadata.name field of the entity.",
				minLength: 1
			}
		}
	},
	relation: {
		$id: "#relation",
		type: "object",
		description: "A directed relation from one entity to another.",
		required: [
			"type",
			"targetRef"
		],
		additionalProperties: false,
		properties: {
			type: {
				type: "string",
				minLength: 1,
				pattern: "^\\w+$",
				description: "The type of relation."
			},
			target: {
				$ref: "#reference",
				deprecated: true
			},
			targetRef: {
				type: "string",
				minLength: 1,
				description: "The entity ref of the target of this relation."
			}
		}
	},
	status: {
		$id: "#status",
		type: "object",
		description: "The current status of the entity, as claimed by various sources.",
		required: [
		],
		additionalProperties: true,
		properties: {
			items: {
				type: "array",
				items: {
					$ref: "#statusItem"
				}
			}
		}
	},
	statusItem: {
		$id: "#statusItem",
		type: "object",
		description: "A specific status item on a well known format.",
		required: [
			"type",
			"level",
			"message"
		],
		additionalProperties: true,
		properties: {
			type: {
				type: "string",
				minLength: 1
			},
			level: {
				$ref: "#statusLevel",
				description: "The status level / severity of the status item."
			},
			message: {
				type: "string",
				description: "A brief message describing the status, intended for human consumption."
			},
			error: {
				$ref: "#error",
				description: "An optional serialized error object related to the status."
			}
		}
	},
	statusLevel: {
		$id: "#statusLevel",
		type: "string",
		description: "A status level / severity.",
		"enum": [
			"info",
			"warning",
			"error"
		]
	},
	error: {
		$id: "#error",
		type: "object",
		description: "A serialized error object.",
		required: [
			"name",
			"message"
		],
		additionalProperties: true,
		properties: {
			name: {
				type: "string",
				examples: [
					"Error",
					"InputError"
				],
				description: "The type name of the error",
				minLength: 1
			},
			message: {
				type: "string",
				description: "The message of the error"
			},
			code: {
				type: "string",
				description: "An error code associated with the error"
			},
			stack: {
				type: "string",
				description: "An error stack trace"
			}
		}
	}
};
var commonSchema = {
	$schema: $schema$8,
	$id: $id$8,
	type: type,
	description: description$8,
	definitions: definitions
};

const compiledSchemaCache = /* @__PURE__ */ new Map();
const refDependencyCandidates = [
  entityEnvelopeSchema,
  entitySchema,
  entityMetaSchema,
  commonSchema
];
function throwAjvError(errors) {
  if (!(errors == null ? void 0 : errors.length)) {
    throw new TypeError("Unknown error");
  }
  const error = errors[0];
  throw new TypeError(
    `${error.instancePath || "<root>"} ${error.message}${error.params ? ` - ${Object.entries(error.params).map(([key, val]) => `${key}: ${val}`).join(", ")}` : ""}`
  );
}
function compileAjvSchema(schema, options = {}) {
  var _a;
  const disableCache = (_a = options == null ? void 0 : options.disableCache) != null ? _a : false;
  const cacheKey = disableCache ? "" : JSON.stringify(schema);
  if (!disableCache) {
    const cached = compiledSchemaCache.get(cacheKey);
    if (cached) {
      return cached;
    }
  }
  const extraSchemas = getExtraSchemas(schema);
  const ajv = new Ajv__default["default"]({
    allowUnionTypes: true,
    allErrors: true,
    validateSchema: true
  });
  if (extraSchemas.length) {
    ajv.addSchema(extraSchemas, void 0, void 0, true);
  }
  const compiled = ajv.compile(schema);
  if (!disableCache) {
    compiledSchemaCache.set(cacheKey, compiled);
  }
  return compiled;
}
function getExtraSchemas(schema) {
  if (typeof schema !== "object") {
    return [];
  }
  const seen = /* @__PURE__ */ new Set();
  if (schema.$id) {
    seen.add(schema.$id);
  }
  const selected = new Array();
  const todo = [schema];
  while (todo.length) {
    const current = todo.pop();
    for (const ref of getAllRefs(current)) {
      if (!seen.has(ref)) {
        seen.add(ref);
        const match = refDependencyCandidates.find((c) => c.$id === ref);
        if (match) {
          selected.push(match);
          todo.push(match);
        }
      }
    }
  }
  return selected;
}
function* getAllRefs(schema) {
  const todo = [schema];
  while (todo.length) {
    const current = todo.pop();
    if (typeof current === "object" && current) {
      for (const [key, value] of Object.entries(current)) {
        if (key === "$ref" && typeof value === "string") {
          yield value.split("#")[0];
        } else {
          todo.push(value);
        }
      }
    }
  }
}

function entityEnvelopeSchemaValidator(schema) {
  const validate = compileAjvSchema(
    schema ? schema : entityEnvelopeSchema
  );
  return (data) => {
    const result = validate(data);
    if (result === true) {
      return data;
    }
    throw throwAjvError(validate.errors);
  };
}

function entityKindSchemaValidator(schema) {
  const validate = compileAjvSchema(schema);
  return (data) => {
    var _a;
    const result = validate(data);
    if (result === true) {
      return data;
    }
    const softCandidates = (_a = validate.errors) == null ? void 0 : _a.filter(
      (e) => ["/kind", "/apiVersion"].includes(e.instancePath)
    );
    if ((softCandidates == null ? void 0 : softCandidates.length) && softCandidates.every((e) => e.keyword === "enum")) {
      return false;
    }
    throw throwAjvError(validate.errors);
  };
}

function entitySchemaValidator(schema) {
  const validate = compileAjvSchema(schema ? schema : entitySchema);
  return (data) => {
    const result = validate(data);
    if (result === true) {
      return data;
    }
    throw throwAjvError(validate.errors);
  };
}

class KubernetesValidatorFunctions {
  static isValidApiVersion(value) {
    return CommonValidatorFunctions.isValidPrefixAndOrSuffix(
      value,
      "/",
      CommonValidatorFunctions.isValidDnsSubdomain,
      (n) => n.length >= 1 && n.length <= 63 && /^[a-z0-9A-Z]+$/.test(n)
    );
  }
  static isValidKind(value) {
    return typeof value === "string" && value.length >= 1 && value.length <= 63 && /^[a-zA-Z][a-z0-9A-Z]*$/.test(value);
  }
  static isValidObjectName(value) {
    return typeof value === "string" && value.length >= 1 && value.length <= 63 && /^([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9]$/.test(value);
  }
  static isValidNamespace(value) {
    return CommonValidatorFunctions.isValidDnsLabel(value);
  }
  static isValidLabelKey(value) {
    return CommonValidatorFunctions.isValidPrefixAndOrSuffix(
      value,
      "/",
      CommonValidatorFunctions.isValidDnsSubdomain,
      KubernetesValidatorFunctions.isValidObjectName
    );
  }
  static isValidLabelValue(value) {
    return value === "" || KubernetesValidatorFunctions.isValidObjectName(value);
  }
  static isValidAnnotationKey(value) {
    return CommonValidatorFunctions.isValidPrefixAndOrSuffix(
      value,
      "/",
      CommonValidatorFunctions.isValidDnsSubdomain,
      KubernetesValidatorFunctions.isValidObjectName
    );
  }
  static isValidAnnotationValue(value) {
    return typeof value === "string";
  }
}

const defaultValidators = {
  isValidApiVersion: KubernetesValidatorFunctions.isValidApiVersion,
  isValidKind: KubernetesValidatorFunctions.isValidKind,
  isValidEntityName: KubernetesValidatorFunctions.isValidObjectName,
  isValidNamespace: KubernetesValidatorFunctions.isValidNamespace,
  isValidLabelKey: KubernetesValidatorFunctions.isValidLabelKey,
  isValidLabelValue: KubernetesValidatorFunctions.isValidLabelValue,
  isValidAnnotationKey: KubernetesValidatorFunctions.isValidAnnotationKey,
  isValidAnnotationValue: KubernetesValidatorFunctions.isValidAnnotationValue,
  isValidTag: (value) => {
    return typeof value === "string" && value.length >= 1 && value.length <= 63 && /^[a-z0-9:+#]+(\-[a-z0-9:+#]+)*$/.test(value);
  }
};
function makeValidator(overrides = {}) {
  return {
    ...defaultValidators,
    ...overrides
  };
}

var __defProp$2 = Object.defineProperty;
var __defNormalProp$2 = (obj, key, value) => key in obj ? __defProp$2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$2 = (obj, key, value) => {
  __defNormalProp$2(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class FieldFormatEntityPolicy {
  constructor(validators = makeValidator()) {
    __publicField$2(this, "validators");
    this.validators = validators;
  }
  async enforce(entity) {
    var _a, _b, _c, _d, _e, _f, _g;
    function require2(field, value, validator) {
      if (value === void 0 || value === null) {
        throw new Error(`${field} must have a value`);
      }
      let isValid;
      try {
        isValid = validator(value);
      } catch (e) {
        throw new Error(`${field} could not be validated, ${e}`);
      }
      if (!isValid) {
        let expectation;
        switch (validator.name) {
          case "isValidLabelValue":
          case "isValidObjectName":
            expectation = "a string that is sequences of [a-zA-Z0-9] separated by any of [-_.], at most 63 characters in total";
            break;
          case "isValidLabelKey":
          case "isValidApiVersion":
          case "isValidAnnotationKey":
            expectation = "a valid prefix and/or suffix";
            break;
          case "isValidNamespace":
          case "isValidDnsLabel":
            expectation = "a string that is sequences of [a-z0-9] separated by [-], at most 63 characters in total";
            break;
          case "isValidTag":
            expectation = "a string that is sequences of [a-z0-9+#] separated by [-], at most 63 characters in total";
            break;
          case "isValidAnnotationValue":
            expectation = "a string";
            break;
          case "isValidKind":
            expectation = "a string that is a sequence of [a-zA-Z][a-z0-9A-Z], at most 63 characters in total";
            break;
          case "isValidUrl":
            expectation = "a string that is a valid url";
            break;
          case "isValidString":
          case "isNonEmptyString":
            expectation = "a non empty string";
            break;
          default:
            expectation = void 0;
            break;
        }
        const message = expectation ? ` expected ${expectation} but found "${value}".` : "";
        throw new Error(
          `"${field}" is not valid;${message} To learn more about catalog file format, visit: https://github.com/backstage/backstage/blob/master/docs/architecture-decisions/adr002-default-catalog-file-format.md`
        );
      }
    }
    function optional(field, value, validator) {
      return value === void 0 || require2(field, value, validator);
    }
    require2("apiVersion", entity.apiVersion, this.validators.isValidApiVersion);
    require2("kind", entity.kind, this.validators.isValidKind);
    require2("metadata.name", entity.metadata.name, this.validators.isValidEntityName);
    optional(
      "metadata.namespace",
      entity.metadata.namespace,
      this.validators.isValidNamespace
    );
    for (const [k, v] of Object.entries((_a = entity.metadata.labels) != null ? _a : [])) {
      require2(`labels.${k}`, k, this.validators.isValidLabelKey);
      require2(`labels.${k}`, v, this.validators.isValidLabelValue);
    }
    for (const [k, v] of Object.entries((_b = entity.metadata.annotations) != null ? _b : [])) {
      require2(`annotations.${k}`, k, this.validators.isValidAnnotationKey);
      require2(`annotations.${k}`, v, this.validators.isValidAnnotationValue);
    }
    const tags = (_c = entity.metadata.tags) != null ? _c : [];
    for (let i = 0; i < tags.length; ++i) {
      require2(`tags.${i}`, tags[i], this.validators.isValidTag);
    }
    const links = (_d = entity.metadata.links) != null ? _d : [];
    for (let i = 0; i < links.length; ++i) {
      require2(`links.${i}.url`, (_e = links[i]) == null ? void 0 : _e.url, CommonValidatorFunctions.isValidUrl);
      optional(
        `links.${i}.title`,
        (_f = links[i]) == null ? void 0 : _f.title,
        CommonValidatorFunctions.isNonEmptyString
      );
      optional(
        `links.${i}.icon`,
        (_g = links[i]) == null ? void 0 : _g.icon,
        KubernetesValidatorFunctions.isValidObjectName
      );
    }
    return entity;
  }
}

var __defProp$1 = Object.defineProperty;
var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$1 = (obj, key, value) => {
  __defNormalProp$1(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const defaultKnownFields = ["apiVersion", "kind", "metadata", "spec"];
class NoForeignRootFieldsEntityPolicy {
  constructor(knownFields = defaultKnownFields) {
    __publicField$1(this, "knownFields");
    this.knownFields = knownFields;
  }
  async enforce(entity) {
    for (const field of Object.keys(entity)) {
      if (!this.knownFields.includes(field)) {
        throw new Error(`Unknown field ${field}`);
      }
    }
    return entity;
  }
}

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class SchemaValidEntityPolicy {
  constructor() {
    __publicField(this, "validate");
  }
  async enforce(entity) {
    if (!this.validate) {
      const ajv = new Ajv__default["default"]({ allowUnionTypes: true });
      this.validate = ajv.addSchema([commonSchema, entityMetaSchema], void 0, void 0, true).compile(entitySchema);
    }
    const result = this.validate(entity);
    if (result === true) {
      return entity;
    }
    const [error] = this.validate.errors || [];
    if (!error) {
      throw new Error(`Malformed envelope, Unknown error`);
    }
    throw new Error(
      `Malformed envelope, ${error.instancePath || "<root>"} ${error.message}`
    );
  }
}

class AllEntityPolicies {
  constructor(policies) {
    this.policies = policies;
  }
  async enforce(entity) {
    let result = entity;
    for (const policy of this.policies) {
      const output = await policy.enforce(result);
      if (!output) {
        throw new Error(
          `Policy ${policy.constructor.name} did not return a result`
        );
      }
      result = output;
    }
    return result;
  }
}
class AnyEntityPolicy {
  constructor(policies) {
    this.policies = policies;
  }
  async enforce(entity) {
    for (const policy of this.policies) {
      const output = await policy.enforce(entity);
      if (output) {
        return output;
      }
    }
    throw new Error(`The entity did not match any known policy`);
  }
}
const EntityPolicies = {
  allOf(policies) {
    return new AllEntityPolicies(policies);
  },
  oneOf(policies) {
    return new AnyEntityPolicy(policies);
  }
};

var $schema$7 = "http://json-schema.org/draft-07/schema";
var $id$7 = "ApiV1alpha1";
var description$7 = "An API describes an interface that can be exposed by a component. The API can be defined in different formats, like OpenAPI, AsyncAPI, GraphQL, gRPC, or other formats.";
var examples$7 = [
	{
		apiVersion: "backstage.io/v1alpha1",
		kind: "API",
		metadata: {
			name: "artist-api",
			description: "Retrieve artist details",
			labels: {
				product_name: "Random value Generator"
			},
			annotations: {
				docs: "https://github.com/..../tree/develop/doc"
			}
		},
		spec: {
			type: "openapi",
			lifecycle: "production",
			owner: "artist-relations-team",
			system: "artist-engagement-portal",
			definition: "openapi: \"3.0.0\"\ninfo:..."
		}
	}
];
var allOf$7 = [
	{
		$ref: "Entity"
	},
	{
		type: "object",
		required: [
			"spec"
		],
		properties: {
			apiVersion: {
				"enum": [
					"backstage.io/v1alpha1",
					"backstage.io/v1beta1"
				]
			},
			kind: {
				"enum": [
					"API"
				]
			},
			spec: {
				type: "object",
				required: [
					"type",
					"lifecycle",
					"owner",
					"definition"
				],
				properties: {
					type: {
						type: "string",
						description: "The type of the API definition.",
						examples: [
							"openapi",
							"asyncapi",
							"graphql",
							"grpc",
							"trpc"
						],
						minLength: 1
					},
					lifecycle: {
						type: "string",
						description: "The lifecycle state of the API.",
						examples: [
							"experimental",
							"production",
							"deprecated"
						],
						minLength: 1
					},
					owner: {
						type: "string",
						description: "An entity reference to the owner of the API.",
						examples: [
							"artist-relations-team",
							"user:john.johnson"
						],
						minLength: 1
					},
					system: {
						type: "string",
						description: "An entity reference to the system that the API belongs to.",
						minLength: 1
					},
					definition: {
						type: "string",
						description: "The definition of the API, based on the format defined by the type.",
						minLength: 1
					}
				}
			}
		}
	}
];
var schema$7 = {
	$schema: $schema$7,
	$id: $id$7,
	description: description$7,
	examples: examples$7,
	allOf: allOf$7
};

function ajvCompiledJsonSchemaValidator(schema) {
  let validator;
  return {
    async check(data) {
      if (!validator) {
        validator = entityKindSchemaValidator(schema);
      }
      return validator(data) === data;
    }
  };
}

const apiEntityV1alpha1Validator = ajvCompiledJsonSchemaValidator(schema$7);

var $schema$6 = "http://json-schema.org/draft-07/schema";
var $id$6 = "ComponentV1alpha1";
var description$6 = "A Component describes a software component. It is typically intimately linked to the source code that constitutes the component, and should be what a developer may regard a \"unit of software\", usually with a distinct deployable or linkable artifact.";
var examples$6 = [
	{
		apiVersion: "backstage.io/v1alpha1",
		kind: "Component",
		metadata: {
			name: "LoremService",
			description: "Creates Lorems like a pro.",
			labels: {
				product_name: "Random value Generator"
			},
			annotations: {
				docs: "https://github.com/..../tree/develop/doc"
			}
		},
		spec: {
			type: "service",
			lifecycle: "production",
			owner: "tools"
		}
	}
];
var allOf$6 = [
	{
		$ref: "Entity"
	},
	{
		type: "object",
		required: [
			"spec"
		],
		properties: {
			apiVersion: {
				"enum": [
					"backstage.io/v1alpha1",
					"backstage.io/v1beta1"
				]
			},
			kind: {
				"enum": [
					"Component"
				]
			},
			spec: {
				type: "object",
				required: [
					"type",
					"lifecycle",
					"owner"
				],
				properties: {
					type: {
						type: "string",
						description: "The type of component.",
						examples: [
							"service",
							"website",
							"library"
						],
						minLength: 1
					},
					lifecycle: {
						type: "string",
						description: "The lifecycle state of the component.",
						examples: [
							"experimental",
							"production",
							"deprecated"
						],
						minLength: 1
					},
					owner: {
						type: "string",
						description: "An entity reference to the owner of the component.",
						examples: [
							"artist-relations-team",
							"user:john.johnson"
						],
						minLength: 1
					},
					system: {
						type: "string",
						description: "An entity reference to the system that the component belongs to.",
						minLength: 1
					},
					subcomponentOf: {
						type: "string",
						description: "An entity reference to another component of which the component is a part.",
						minLength: 1
					},
					providesApis: {
						type: "array",
						description: "An array of entity references to the APIs that are provided by the component.",
						items: {
							type: "string",
							minLength: 1
						}
					},
					consumesApis: {
						type: "array",
						description: "An array of entity references to the APIs that are consumed by the component.",
						items: {
							type: "string",
							minLength: 1
						}
					},
					dependsOn: {
						type: "array",
						description: "An array of references to other entities that the component depends on to function.",
						items: {
							type: "string",
							minLength: 1
						}
					}
				}
			}
		}
	}
];
var schema$6 = {
	$schema: $schema$6,
	$id: $id$6,
	description: description$6,
	examples: examples$6,
	allOf: allOf$6
};

const componentEntityV1alpha1Validator = ajvCompiledJsonSchemaValidator(schema$6);

var $schema$5 = "http://json-schema.org/draft-07/schema";
var $id$5 = "DomainV1alpha1";
var description$5 = "A Domain groups a collection of systems that share terminology, domain models, business purpose, or documentation, i.e. form a bounded context.";
var examples$5 = [
	{
		apiVersion: "backstage.io/v1alpha1",
		kind: "Domain",
		metadata: {
			name: "artists",
			description: "Everything about artists"
		},
		spec: {
			owner: "artist-relations-team"
		}
	}
];
var allOf$5 = [
	{
		$ref: "Entity"
	},
	{
		type: "object",
		required: [
			"spec"
		],
		properties: {
			apiVersion: {
				"enum": [
					"backstage.io/v1alpha1",
					"backstage.io/v1beta1"
				]
			},
			kind: {
				"enum": [
					"Domain"
				]
			},
			spec: {
				type: "object",
				required: [
					"owner"
				],
				properties: {
					owner: {
						type: "string",
						description: "An entity reference to the owner of the component.",
						examples: [
							"artist-relations-team",
							"user:john.johnson"
						],
						minLength: 1
					}
				}
			}
		}
	}
];
var schema$5 = {
	$schema: $schema$5,
	$id: $id$5,
	description: description$5,
	examples: examples$5,
	allOf: allOf$5
};

const domainEntityV1alpha1Validator = ajvCompiledJsonSchemaValidator(schema$5);

var $schema$4 = "http://json-schema.org/draft-07/schema";
var $id$4 = "GroupV1alpha1";
var description$4 = "A group describes an organizational entity, such as for example a team, a business unit, or a loose collection of people in an interest group. Members of these groups are modeled in the catalog as kind User.";
var examples$4 = [
	{
		apiVersion: "backstage.io/v1alpha1",
		kind: "Group",
		metadata: {
			name: "infrastructure",
			description: "The infra business unit"
		},
		spec: {
			type: "business-unit",
			profile: {
				displayName: "Infrastructure",
				email: "infrastructure@example.com",
				picture: "https://example.com/groups/bu-infrastructure.jpeg"
			},
			parent: "ops",
			children: [
				"backstage",
				"other"
			]
		}
	}
];
var allOf$4 = [
	{
		$ref: "Entity"
	},
	{
		type: "object",
		required: [
			"spec"
		],
		properties: {
			apiVersion: {
				"enum": [
					"backstage.io/v1alpha1",
					"backstage.io/v1beta1"
				]
			},
			kind: {
				"enum": [
					"Group"
				]
			},
			spec: {
				type: "object",
				required: [
					"type",
					"children"
				],
				properties: {
					type: {
						type: "string",
						description: "The type of group. There is currently no enforced set of values for this field, so it is left up to the adopting organization to choose a nomenclature that matches their org hierarchy.",
						examples: [
							"team",
							"business-unit",
							"product-area",
							"root"
						],
						minLength: 1
					},
					profile: {
						type: "object",
						description: "Optional profile information about the group, mainly for display purposes. All fields of this structure are also optional. The email would be a group email of some form, that the group may wish to be used for contacting them. The picture is expected to be a URL pointing to an image that's representative of the group, and that a browser could fetch and render on a group page or similar.",
						properties: {
							displayName: {
								type: "string",
								description: "A simple display name to present to users.",
								examples: [
									"Infrastructure"
								],
								minLength: 1
							},
							email: {
								type: "string",
								description: "An email where this entity can be reached.",
								examples: [
									"infrastructure@example.com"
								],
								minLength: 1
							},
							picture: {
								type: "string",
								description: "The URL of an image that represents this entity.",
								examples: [
									"https://example.com/groups/bu-infrastructure.jpeg"
								],
								minLength: 1
							}
						}
					},
					parent: {
						type: "string",
						description: "The immediate parent group in the hierarchy, if any. Not all groups must have a parent; the catalog supports multi-root hierarchies. Groups may however not have more than one parent. This field is an entity reference.",
						examples: [
							"ops"
						],
						minLength: 1
					},
					children: {
						type: "array",
						description: "The immediate child groups of this group in the hierarchy (whose parent field points to this group). The list must be present, but may be empty if there are no child groups. The items are not guaranteed to be ordered in any particular way. The entries of this array are entity references.",
						items: {
							type: "string",
							examples: [
								"backstage",
								"other"
							],
							minLength: 1
						}
					},
					members: {
						type: "array",
						description: "The users that are members of this group. The entries of this array are entity references.",
						items: {
							type: "string",
							examples: [
								"jdoe"
							],
							minLength: 1
						}
					}
				}
			}
		}
	}
];
var schema$4 = {
	$schema: $schema$4,
	$id: $id$4,
	description: description$4,
	examples: examples$4,
	allOf: allOf$4
};

const groupEntityV1alpha1Validator = ajvCompiledJsonSchemaValidator(schema$4);

var $schema$3 = "http://json-schema.org/draft-07/schema";
var $id$3 = "LocationV1alpha1";
var description$3 = "A location is a marker that references other places to look for catalog data.";
var examples$3 = [
	{
		apiVersion: "backstage.io/v1alpha1",
		kind: "Location",
		metadata: {
			name: "org-data"
		},
		spec: {
			type: "url",
			targets: [
				"http://github.com/myorg/myproject/org-data-dump/catalog-info-staff.yaml",
				"http://github.com/myorg/myproject/org-data-dump/catalog-info-consultants.yaml"
			]
		}
	}
];
var allOf$3 = [
	{
		$ref: "Entity"
	},
	{
		type: "object",
		required: [
			"spec"
		],
		properties: {
			apiVersion: {
				"enum": [
					"backstage.io/v1alpha1",
					"backstage.io/v1beta1"
				]
			},
			kind: {
				"enum": [
					"Location"
				]
			},
			spec: {
				type: "object",
				required: [
				],
				properties: {
					type: {
						type: "string",
						description: "The single location type, that's common to the targets specified in the spec. If it is left out, it is inherited from the location type that originally read the entity data.",
						examples: [
							"url"
						],
						minLength: 1
					},
					target: {
						type: "string",
						description: "A single target as a string. Can be either an absolute path/URL (depending on the type), or a relative path such as ./details/catalog-info.yaml which is resolved relative to the location of this Location entity itself.",
						examples: [
							"./details/catalog-info.yaml"
						],
						minLength: 1
					},
					targets: {
						type: "array",
						description: "A list of targets as strings. They can all be either absolute paths/URLs (depending on the type), or relative paths such as ./details/catalog-info.yaml which are resolved relative to the location of this Location entity itself.",
						items: {
							type: "string",
							examples: [
								"./details/catalog-info.yaml",
								"http://github.com/myorg/myproject/org-data-dump/catalog-info-staff.yaml"
							],
							minLength: 1
						}
					},
					presence: {
						type: "string",
						description: "Whether the presence of the location target is required and it should be considered an error if it can not be found",
						"default": "required",
						examples: [
							"required"
						],
						"enum": [
							"required",
							"optional"
						]
					}
				}
			}
		}
	}
];
var schema$3 = {
	$schema: $schema$3,
	$id: $id$3,
	description: description$3,
	examples: examples$3,
	allOf: allOf$3
};

const locationEntityV1alpha1Validator = ajvCompiledJsonSchemaValidator(schema$3);

const RELATION_OWNED_BY = "ownedBy";
const RELATION_OWNER_OF = "ownerOf";
const RELATION_CONSUMES_API = "consumesApi";
const RELATION_API_CONSUMED_BY = "apiConsumedBy";
const RELATION_PROVIDES_API = "providesApi";
const RELATION_API_PROVIDED_BY = "apiProvidedBy";
const RELATION_DEPENDS_ON = "dependsOn";
const RELATION_DEPENDENCY_OF = "dependencyOf";
const RELATION_PARENT_OF = "parentOf";
const RELATION_CHILD_OF = "childOf";
const RELATION_MEMBER_OF = "memberOf";
const RELATION_HAS_MEMBER = "hasMember";
const RELATION_PART_OF = "partOf";
const RELATION_HAS_PART = "hasPart";

var $schema$2 = "http://json-schema.org/draft-07/schema";
var $id$2 = "ResourceV1alpha1";
var description$2 = "A resource describes the infrastructure a system needs to operate, like BigTable databases, Pub/Sub topics, S3 buckets or CDNs. Modelling them together with components and systems allows to visualize resource footprint, and create tooling around them.";
var examples$2 = [
	{
		apiVersion: "backstage.io/v1alpha1",
		kind: "Resource",
		metadata: {
			name: "artists-db",
			description: "Stores artist details"
		},
		spec: {
			type: "database",
			owner: "artist-relations-team",
			system: "artist-engagement-portal"
		}
	}
];
var allOf$2 = [
	{
		$ref: "Entity"
	},
	{
		type: "object",
		required: [
			"spec"
		],
		properties: {
			apiVersion: {
				"enum": [
					"backstage.io/v1alpha1",
					"backstage.io/v1beta1"
				]
			},
			kind: {
				"enum": [
					"Resource"
				]
			},
			spec: {
				type: "object",
				required: [
					"type",
					"owner"
				],
				properties: {
					type: {
						type: "string",
						description: "The type of resource.",
						examples: [
							"database",
							"s3-bucket",
							"cluster"
						],
						minLength: 1
					},
					owner: {
						type: "string",
						description: "An entity reference to the owner of the resource.",
						examples: [
							"artist-relations-team",
							"user:john.johnson"
						],
						minLength: 1
					},
					dependsOn: {
						type: "array",
						description: "An array of references to other entities that the resource depends on to function.",
						items: {
							type: "string",
							minLength: 1
						}
					},
					system: {
						type: "string",
						description: "An entity reference to the system that the resource belongs to.",
						minLength: 1
					}
				}
			}
		}
	}
];
var schema$2 = {
	$schema: $schema$2,
	$id: $id$2,
	description: description$2,
	examples: examples$2,
	allOf: allOf$2
};

const resourceEntityV1alpha1Validator = ajvCompiledJsonSchemaValidator(schema$2);

var $schema$1 = "http://json-schema.org/draft-07/schema";
var $id$1 = "SystemV1alpha1";
var description$1 = "A system is a collection of resources and components. The system may expose or consume one or several APIs. It is viewed as abstraction level that provides potential consumers insights into exposed features without needing a too detailed view into the details of all components. This also gives the owning team the possibility to decide about published artifacts and APIs.";
var examples$1 = [
	{
		apiVersion: "backstage.io/v1alpha1",
		kind: "System",
		metadata: {
			name: "artist-engagement-portal",
			description: "Handy tools to keep artists in the loop"
		},
		spec: {
			owner: "artist-relations-team",
			domain: "artists"
		}
	}
];
var allOf$1 = [
	{
		$ref: "Entity"
	},
	{
		type: "object",
		required: [
			"spec"
		],
		properties: {
			apiVersion: {
				"enum": [
					"backstage.io/v1alpha1",
					"backstage.io/v1beta1"
				]
			},
			kind: {
				"enum": [
					"System"
				]
			},
			spec: {
				type: "object",
				required: [
					"owner"
				],
				properties: {
					owner: {
						type: "string",
						description: "An entity reference to the owner of the component.",
						examples: [
							"artist-relations-team",
							"user:john.johnson"
						],
						minLength: 1
					},
					domain: {
						type: "string",
						description: "An entity reference to the domain that the system belongs to.",
						examples: [
							"artists"
						],
						minLength: 1
					}
				}
			}
		}
	}
];
var schema$1 = {
	$schema: $schema$1,
	$id: $id$1,
	description: description$1,
	examples: examples$1,
	allOf: allOf$1
};

const systemEntityV1alpha1Validator = ajvCompiledJsonSchemaValidator(schema$1);

var $schema = "http://json-schema.org/draft-07/schema";
var $id = "UserV1alpha1";
var description = "A user describes a person, such as an employee, a contractor, or similar. Users belong to Group entities in the catalog. These catalog user entries are connected to the way that authentication within the Backstage ecosystem works. See the auth section of the docs for a discussion of these concepts.";
var examples = [
	{
		apiVersion: "backstage.io/v1alpha1",
		kind: "User",
		metadata: {
			name: "jdoe"
		},
		spec: {
			profile: {
				displayName: "Jenny Doe",
				email: "jenny-doe@example.com",
				picture: "https://example.com/staff/jenny-with-party-hat.jpeg"
			},
			memberOf: [
				"team-b",
				"employees"
			]
		}
	}
];
var allOf = [
	{
		$ref: "Entity"
	},
	{
		type: "object",
		required: [
			"spec"
		],
		properties: {
			apiVersion: {
				"enum": [
					"backstage.io/v1alpha1",
					"backstage.io/v1beta1"
				]
			},
			kind: {
				"enum": [
					"User"
				]
			},
			spec: {
				type: "object",
				required: [
					"memberOf"
				],
				properties: {
					profile: {
						type: "object",
						description: "Optional profile information about the user, mainly for display purposes. All fields of this structure are also optional. The email would be a primary email of some form, that the user may wish to be used for contacting them. The picture is expected to be a URL pointing to an image that's representative of the user, and that a browser could fetch and render on a profile page or similar.",
						properties: {
							displayName: {
								type: "string",
								description: "A simple display name to present to users.",
								examples: [
									"Jenny Doe"
								],
								minLength: 1
							},
							email: {
								type: "string",
								description: "An email where this user can be reached.",
								examples: [
									"jenny-doe@example.com"
								],
								minLength: 1
							},
							picture: {
								type: "string",
								description: "The URL of an image that represents this user.",
								examples: [
									"https://example.com/staff/jenny-with-party-hat.jpeg"
								],
								minLength: 1
							}
						}
					},
					memberOf: {
						type: "array",
						description: "The list of groups that the user is a direct member of (i.e., no transitive memberships are listed here). The list must be present, but may be empty if the user is not member of any groups. The items are not guaranteed to be ordered in any particular way. The entries of this array are entity references.",
						items: {
							type: "string",
							examples: [
								"team-b",
								"employees"
							],
							minLength: 1
						}
					}
				}
			}
		}
	}
];
var schema = {
	$schema: $schema,
	$id: $id,
	description: description,
	examples: examples,
	allOf: allOf
};

const userEntityV1alpha1Validator = ajvCompiledJsonSchemaValidator(schema);

const ANNOTATION_LOCATION = "backstage.io/managed-by-location";
const ANNOTATION_ORIGIN_LOCATION = "backstage.io/managed-by-origin-location";
const ANNOTATION_SOURCE_LOCATION = "backstage.io/source-location";

const scriptProtocolPattern = (
  // eslint-disable-next-line no-control-regex
  /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*\:/i
);
function parseLocationRef(ref) {
  if (typeof ref !== "string") {
    throw new TypeError(
      `Unable to parse location ref '${ref}', unexpected argument ${typeof ref}`
    );
  }
  const splitIndex = ref.indexOf(":");
  if (splitIndex < 0) {
    throw new TypeError(
      `Unable to parse location ref '${ref}', expected '<type>:<target>', e.g. 'url:https://host/path'`
    );
  }
  const type = ref.substring(0, splitIndex).trim();
  const target = ref.substring(splitIndex + 1).trim();
  if (!type || !target) {
    throw new TypeError(
      `Unable to parse location ref '${ref}', expected '<type>:<target>', e.g. 'url:https://host/path'`
    );
  }
  if (type === "http" || type === "https") {
    throw new TypeError(
      `Invalid location ref '${ref}', please prefix it with 'url:', e.g. 'url:${ref}'`
    );
  }
  if (scriptProtocolPattern.test(target)) {
    throw new TypeError(
      `Invalid location ref '${ref}', target is a javascript: URL`
    );
  }
  return { type, target };
}
function stringifyLocationRef(ref) {
  const { type, target } = ref;
  if (!type) {
    throw new TypeError(`Unable to stringify location ref, empty type`);
  } else if (!target) {
    throw new TypeError(`Unable to stringify location ref, empty target`);
  }
  if (scriptProtocolPattern.test(target)) {
    throw new TypeError(
      `Invalid location ref '${type}:${target}', target is a javascript: URL`
    );
  }
  return `${type}:${target}`;
}
function getEntitySourceLocation(entity) {
  var _a, _b, _c, _d, _e;
  const locationRef = (_e = (_b = (_a = entity.metadata) == null ? void 0 : _a.annotations) == null ? void 0 : _b[ANNOTATION_SOURCE_LOCATION]) != null ? _e : (_d = (_c = entity.metadata) == null ? void 0 : _c.annotations) == null ? void 0 : _d[ANNOTATION_LOCATION];
  if (!locationRef) {
    throw new Error(
      `Entity '${stringifyEntityRef(entity)}' is missing location`
    );
  }
  return parseLocationRef(locationRef);
}

exports.ANNOTATION_EDIT_URL = ANNOTATION_EDIT_URL;
exports.ANNOTATION_KUBERNETES_API_SERVER = ANNOTATION_KUBERNETES_API_SERVER;
exports.ANNOTATION_KUBERNETES_API_SERVER_CA = ANNOTATION_KUBERNETES_API_SERVER_CA;
exports.ANNOTATION_KUBERNETES_AUTH_PROVIDER = ANNOTATION_KUBERNETES_AUTH_PROVIDER;
exports.ANNOTATION_LOCATION = ANNOTATION_LOCATION;
exports.ANNOTATION_ORIGIN_LOCATION = ANNOTATION_ORIGIN_LOCATION;
exports.ANNOTATION_SOURCE_LOCATION = ANNOTATION_SOURCE_LOCATION;
exports.ANNOTATION_VIEW_URL = ANNOTATION_VIEW_URL;
exports.CommonValidatorFunctions = CommonValidatorFunctions;
exports.DEFAULT_NAMESPACE = DEFAULT_NAMESPACE;
exports.DefaultNamespaceEntityPolicy = DefaultNamespaceEntityPolicy;
exports.EntityPolicies = EntityPolicies;
exports.FieldFormatEntityPolicy = FieldFormatEntityPolicy;
exports.GroupDefaultParentEntityPolicy = GroupDefaultParentEntityPolicy;
exports.KubernetesValidatorFunctions = KubernetesValidatorFunctions;
exports.NoForeignRootFieldsEntityPolicy = NoForeignRootFieldsEntityPolicy;
exports.RELATION_API_CONSUMED_BY = RELATION_API_CONSUMED_BY;
exports.RELATION_API_PROVIDED_BY = RELATION_API_PROVIDED_BY;
exports.RELATION_CHILD_OF = RELATION_CHILD_OF;
exports.RELATION_CONSUMES_API = RELATION_CONSUMES_API;
exports.RELATION_DEPENDENCY_OF = RELATION_DEPENDENCY_OF;
exports.RELATION_DEPENDS_ON = RELATION_DEPENDS_ON;
exports.RELATION_HAS_MEMBER = RELATION_HAS_MEMBER;
exports.RELATION_HAS_PART = RELATION_HAS_PART;
exports.RELATION_MEMBER_OF = RELATION_MEMBER_OF;
exports.RELATION_OWNED_BY = RELATION_OWNED_BY;
exports.RELATION_OWNER_OF = RELATION_OWNER_OF;
exports.RELATION_PARENT_OF = RELATION_PARENT_OF;
exports.RELATION_PART_OF = RELATION_PART_OF;
exports.RELATION_PROVIDES_API = RELATION_PROVIDES_API;
exports.SchemaValidEntityPolicy = SchemaValidEntityPolicy;
exports.apiEntityV1alpha1Validator = apiEntityV1alpha1Validator;
exports.componentEntityV1alpha1Validator = componentEntityV1alpha1Validator;
exports.domainEntityV1alpha1Validator = domainEntityV1alpha1Validator;
exports.entityEnvelopeSchemaValidator = entityEnvelopeSchemaValidator;
exports.entityKindSchemaValidator = entityKindSchemaValidator;
exports.entitySchemaValidator = entitySchemaValidator;
exports.getCompoundEntityRef = getCompoundEntityRef;
exports.getEntitySourceLocation = getEntitySourceLocation;
exports.groupEntityV1alpha1Validator = groupEntityV1alpha1Validator;
exports.isApiEntity = isApiEntity;
exports.isComponentEntity = isComponentEntity;
exports.isDomainEntity = isDomainEntity;
exports.isGroupEntity = isGroupEntity;
exports.isLocationEntity = isLocationEntity;
exports.isResourceEntity = isResourceEntity;
exports.isSystemEntity = isSystemEntity;
exports.isUserEntity = isUserEntity;
exports.locationEntityV1alpha1Validator = locationEntityV1alpha1Validator;
exports.makeValidator = makeValidator;
exports.parseEntityRef = parseEntityRef;
exports.parseLocationRef = parseLocationRef;
exports.resourceEntityV1alpha1Validator = resourceEntityV1alpha1Validator;
exports.stringifyEntityRef = stringifyEntityRef;
exports.stringifyLocationRef = stringifyLocationRef;
exports.systemEntityV1alpha1Validator = systemEntityV1alpha1Validator;
exports.userEntityV1alpha1Validator = userEntityV1alpha1Validator;
//# sourceMappingURL=index.cjs.js.map


/***/ }),

/***/ 45141:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

var serializeError$1 = __webpack_require__(45765);

function isError(value) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const maybe = value;
  if (typeof maybe.name !== "string" || maybe.name === "") {
    return false;
  }
  if (typeof maybe.message !== "string") {
    return false;
  }
  return true;
}
function assertError(value) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`Encountered invalid error, not an object, got '${value}'`);
  }
  const maybe = value;
  if (typeof maybe.name !== "string" || maybe.name === "") {
    throw new Error(`Encountered error object without a name, got '${value}'`);
  }
  if (typeof maybe.message !== "string") {
    throw new Error(
      `Encountered error object without a message, got '${value}'`
    );
  }
}

function serializeError(error, options) {
  const serialized = serializeError$1.serializeError(error);
  const result = {
    name: "Unknown",
    message: "<no reason given>",
    ...serialized
  };
  if (!(options == null ? void 0 : options.includeStack)) {
    delete result.stack;
  }
  return result;
}
function deserializeError(data) {
  const result = serializeError$1.deserializeError(data);
  if (!data.stack) {
    result.stack = void 0;
  }
  return result;
}
function stringifyError(error) {
  if (isError(error)) {
    const str = String(error);
    return str !== "[object Object]" ? str : `${error.name}: ${error.message}`;
  }
  return `unknown error '${error}'`;
}

var __defProp$2 = Object.defineProperty;
var __defNormalProp$2 = (obj, key, value) => key in obj ? __defProp$2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$2 = (obj, key, value) => {
  __defNormalProp$2(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class CustomErrorBase extends Error {
  constructor(message, cause) {
    var _a;
    let fullMessage = message;
    if (cause !== void 0) {
      const causeStr = stringifyError(cause);
      if (fullMessage) {
        fullMessage += `; caused by ${causeStr}`;
      } else {
        fullMessage = `caused by ${causeStr}`;
      }
    }
    super(fullMessage);
    /**
     * An inner error that caused this error to be thrown, if any.
     */
    __publicField$2(this, "cause");
    (_a = Error.captureStackTrace) == null ? void 0 : _a.call(Error, this, this.constructor);
    if (!this.name || this.name === "Error") {
      const baseName = this.constructor.name;
      if (baseName !== "Error") {
        this.name = this.constructor.name;
      }
    }
    this.cause = isError(cause) ? cause : void 0;
  }
}

var __defProp$1 = Object.defineProperty;
var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$1 = (obj, key, value) => {
  __defNormalProp$1(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class InputError extends CustomErrorBase {
  constructor() {
    super(...arguments);
    __publicField$1(this, "name", "InputError");
  }
}
class AuthenticationError extends CustomErrorBase {
  constructor() {
    super(...arguments);
    __publicField$1(this, "name", "AuthenticationError");
  }
}
class NotAllowedError extends CustomErrorBase {
  constructor() {
    super(...arguments);
    __publicField$1(this, "name", "NotAllowedError");
  }
}
class NotFoundError extends CustomErrorBase {
  constructor() {
    super(...arguments);
    __publicField$1(this, "name", "NotFoundError");
  }
}
class ConflictError extends CustomErrorBase {
  constructor() {
    super(...arguments);
    __publicField$1(this, "name", "ConflictError");
  }
}
class NotModifiedError extends CustomErrorBase {
  constructor() {
    super(...arguments);
    __publicField$1(this, "name", "NotModifiedError");
  }
}
class NotImplementedError extends CustomErrorBase {
  constructor() {
    super(...arguments);
    __publicField$1(this, "name", "NotImplementedError");
  }
}
class ServiceUnavailableError extends CustomErrorBase {
}
class ForwardedError extends CustomErrorBase {
  constructor(message, cause) {
    super(message, cause);
    this.name = isError(cause) ? cause.name : "Error";
  }
}

async function parseErrorResponseBody(response) {
  var _a;
  try {
    const text = await response.text();
    if (text) {
      if ((_a = response.headers.get("content-type")) == null ? void 0 : _a.startsWith("application/json")) {
        try {
          const body = JSON.parse(text);
          if (body.error && body.response) {
            return body;
          }
        } catch {
        }
      }
      return {
        error: {
          name: "Error",
          message: `Request failed with status ${response.status} ${response.statusText}, ${text}`
        },
        response: {
          statusCode: response.status
        }
      };
    }
  } catch {
  }
  return {
    error: {
      name: "Error",
      message: `Request failed with status ${response.status} ${response.statusText}`
    },
    response: {
      statusCode: response.status
    }
  };
}

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class ResponseError extends Error {
  constructor(props) {
    super(props.message);
    /**
     * The actual response, as seen by the client.
     *
     * Note that the body of this response is always consumed. Its parsed form is
     * in the `body` field.
     */
    __publicField(this, "response");
    /**
     * The parsed JSON error body, as sent by the server.
     */
    __publicField(this, "body");
    /**
     * The Error cause, as seen by the remote server. This is parsed out of the
     * JSON error body.
     *
     * This error always has the plain Error constructor, however all
     * serializable enumerable fields on the remote error including its name are
     * preserved. Therefore, if you want to check the error type, use its name
     * property rather than checking typeof or its constructor or prototype.
     */
    __publicField(this, "cause");
    this.name = "ResponseError";
    this.response = props.response;
    this.body = props.data;
    this.cause = props.cause;
  }
  /**
   * Constructs a ResponseError based on a failed response.
   *
   * Assumes that the response has already been checked to be not ok. This
   * function consumes the body of the response, and assumes that it hasn't
   * been consumed before.
   */
  static async fromResponse(response) {
    const data = await parseErrorResponseBody(response);
    const status = data.response.statusCode || response.status;
    const statusText = data.error.name || response.statusText;
    const message = `Request failed with ${status} ${statusText}`;
    const cause = deserializeError(data.error);
    return new ResponseError({
      message,
      response,
      data,
      cause
    });
  }
}

exports.AuthenticationError = AuthenticationError;
exports.ConflictError = ConflictError;
exports.CustomErrorBase = CustomErrorBase;
exports.ForwardedError = ForwardedError;
exports.InputError = InputError;
exports.NotAllowedError = NotAllowedError;
exports.NotFoundError = NotFoundError;
exports.NotImplementedError = NotImplementedError;
exports.NotModifiedError = NotModifiedError;
exports.ResponseError = ResponseError;
exports.ServiceUnavailableError = ServiceUnavailableError;
exports.assertError = assertError;
exports.deserializeError = deserializeError;
exports.isError = isError;
exports.parseErrorResponseBody = parseErrorResponseBody;
exports.serializeError = serializeError;
exports.stringifyError = stringifyError;
//# sourceMappingURL=index.cjs.js.map


/***/ }),

/***/ 30891:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", ({ value: true }));
__export(__webpack_require__(74974));
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 74974:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const fs_1 = __webpack_require__(57147);
const debug_1 = __importDefault(__webpack_require__(23510));
const log = debug_1.default('@kwsites/file-exists');
function check(path, isFile, isDirectory) {
    log(`checking %s`, path);
    try {
        const stat = fs_1.statSync(path);
        if (stat.isFile() && isFile) {
            log(`[OK] path represents a file`);
            return true;
        }
        if (stat.isDirectory() && isDirectory) {
            log(`[OK] path represents a directory`);
            return true;
        }
        log(`[FAIL] path represents something other than a file or directory`);
        return false;
    }
    catch (e) {
        if (e.code === 'ENOENT') {
            log(`[FAIL] path is not accessible: %o`, e);
            return false;
        }
        log(`[FATAL] %o`, e);
        throw e;
    }
}
/**
 * Synchronous validation of a path existing either as a file or as a directory.
 *
 * @param {string} path The path to check
 * @param {number} type One or both of the exported numeric constants
 */
function exists(path, type = exports.READABLE) {
    return check(path, (type & exports.FILE) > 0, (type & exports.FOLDER) > 0);
}
exports.exists = exists;
/**
 * Constant representing a file
 */
exports.FILE = 1;
/**
 * Constant representing a folder
 */
exports.FOLDER = 2;
/**
 * Constant representing either a file or a folder
 */
exports.READABLE = exports.FILE + exports.FOLDER;
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 9634:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createDeferred = exports.deferred = void 0;
/**
 * Creates a new `DeferredPromise`
 *
 * ```typescript
 import {deferred} from '@kwsites/promise-deferred`;
 ```
 */
function deferred() {
    let done;
    let fail;
    let status = 'pending';
    const promise = new Promise((_done, _fail) => {
        done = _done;
        fail = _fail;
    });
    return {
        promise,
        done(result) {
            if (status === 'pending') {
                status = 'resolved';
                done(result);
            }
        },
        fail(error) {
            if (status === 'pending') {
                status = 'rejected';
                fail(error);
            }
        },
        get fulfilled() {
            return status !== 'pending';
        },
        get status() {
            return status;
        },
    };
}
exports.deferred = deferred;
/**
 * Alias of the exported `deferred` function, to help consumers wanting to use `deferred` as the
 * local variable name rather than the factory import name, without needing to rename on import.
 *
 * ```typescript
 import {createDeferred} from '@kwsites/promise-deferred`;
 ```
 */
exports.createDeferred = deferred;
/**
 * Default export allows use as:
 *
 * ```typescript
 import deferred from '@kwsites/promise-deferred`;
 ```
 */
exports["default"] = deferred;
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 60698:
/***/ ((module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MissingRefError = exports.ValidationError = exports.CodeGen = exports.Name = exports.nil = exports.stringify = exports.str = exports._ = exports.KeywordCxt = void 0;
const core_1 = __webpack_require__(54634);
const draft7_1 = __webpack_require__(44840);
const discriminator_1 = __webpack_require__(8622);
const draft7MetaSchema = __webpack_require__(64746);
const META_SUPPORT_DATA = ["/properties"];
const META_SCHEMA_ID = "http://json-schema.org/draft-07/schema";
class Ajv extends core_1.default {
    _addVocabularies() {
        super._addVocabularies();
        draft7_1.default.forEach((v) => this.addVocabulary(v));
        if (this.opts.discriminator)
            this.addKeyword(discriminator_1.default);
    }
    _addDefaultMetaSchema() {
        super._addDefaultMetaSchema();
        if (!this.opts.meta)
            return;
        const metaSchema = this.opts.$data
            ? this.$dataMetaSchema(draft7MetaSchema, META_SUPPORT_DATA)
            : draft7MetaSchema;
        this.addMetaSchema(metaSchema, META_SCHEMA_ID, false);
        this.refs["http://json-schema.org/schema"] = META_SCHEMA_ID;
    }
    defaultMeta() {
        return (this.opts.defaultMeta =
            super.defaultMeta() || (this.getSchema(META_SCHEMA_ID) ? META_SCHEMA_ID : undefined));
    }
}
module.exports = exports = Ajv;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports["default"] = Ajv;
var validate_1 = __webpack_require__(24587);
Object.defineProperty(exports, "KeywordCxt", ({ enumerable: true, get: function () { return validate_1.KeywordCxt; } }));
var codegen_1 = __webpack_require__(61089);
Object.defineProperty(exports, "_", ({ enumerable: true, get: function () { return codegen_1._; } }));
Object.defineProperty(exports, "str", ({ enumerable: true, get: function () { return codegen_1.str; } }));
Object.defineProperty(exports, "stringify", ({ enumerable: true, get: function () { return codegen_1.stringify; } }));
Object.defineProperty(exports, "nil", ({ enumerable: true, get: function () { return codegen_1.nil; } }));
Object.defineProperty(exports, "Name", ({ enumerable: true, get: function () { return codegen_1.Name; } }));
Object.defineProperty(exports, "CodeGen", ({ enumerable: true, get: function () { return codegen_1.CodeGen; } }));
var validation_error_1 = __webpack_require__(99401);
Object.defineProperty(exports, "ValidationError", ({ enumerable: true, get: function () { return validation_error_1.default; } }));
var ref_error_1 = __webpack_require__(60010);
Object.defineProperty(exports, "MissingRefError", ({ enumerable: true, get: function () { return ref_error_1.default; } }));
//# sourceMappingURL=ajv.js.map

/***/ }),

/***/ 40345:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.regexpCode = exports.getEsmExportName = exports.getProperty = exports.safeStringify = exports.stringify = exports.strConcat = exports.addCodeArg = exports.str = exports._ = exports.nil = exports._Code = exports.Name = exports.IDENTIFIER = exports._CodeOrName = void 0;
class _CodeOrName {
}
exports._CodeOrName = _CodeOrName;
exports.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
class Name extends _CodeOrName {
    constructor(s) {
        super();
        if (!exports.IDENTIFIER.test(s))
            throw new Error("CodeGen: name must be a valid identifier");
        this.str = s;
    }
    toString() {
        return this.str;
    }
    emptyStr() {
        return false;
    }
    get names() {
        return { [this.str]: 1 };
    }
}
exports.Name = Name;
class _Code extends _CodeOrName {
    constructor(code) {
        super();
        this._items = typeof code === "string" ? [code] : code;
    }
    toString() {
        return this.str;
    }
    emptyStr() {
        if (this._items.length > 1)
            return false;
        const item = this._items[0];
        return item === "" || item === '""';
    }
    get str() {
        var _a;
        return ((_a = this._str) !== null && _a !== void 0 ? _a : (this._str = this._items.reduce((s, c) => `${s}${c}`, "")));
    }
    get names() {
        var _a;
        return ((_a = this._names) !== null && _a !== void 0 ? _a : (this._names = this._items.reduce((names, c) => {
            if (c instanceof Name)
                names[c.str] = (names[c.str] || 0) + 1;
            return names;
        }, {})));
    }
}
exports._Code = _Code;
exports.nil = new _Code("");
function _(strs, ...args) {
    const code = [strs[0]];
    let i = 0;
    while (i < args.length) {
        addCodeArg(code, args[i]);
        code.push(strs[++i]);
    }
    return new _Code(code);
}
exports._ = _;
const plus = new _Code("+");
function str(strs, ...args) {
    const expr = [safeStringify(strs[0])];
    let i = 0;
    while (i < args.length) {
        expr.push(plus);
        addCodeArg(expr, args[i]);
        expr.push(plus, safeStringify(strs[++i]));
    }
    optimize(expr);
    return new _Code(expr);
}
exports.str = str;
function addCodeArg(code, arg) {
    if (arg instanceof _Code)
        code.push(...arg._items);
    else if (arg instanceof Name)
        code.push(arg);
    else
        code.push(interpolate(arg));
}
exports.addCodeArg = addCodeArg;
function optimize(expr) {
    let i = 1;
    while (i < expr.length - 1) {
        if (expr[i] === plus) {
            const res = mergeExprItems(expr[i - 1], expr[i + 1]);
            if (res !== undefined) {
                expr.splice(i - 1, 3, res);
                continue;
            }
            expr[i++] = "+";
        }
        i++;
    }
}
function mergeExprItems(a, b) {
    if (b === '""')
        return a;
    if (a === '""')
        return b;
    if (typeof a == "string") {
        if (b instanceof Name || a[a.length - 1] !== '"')
            return;
        if (typeof b != "string")
            return `${a.slice(0, -1)}${b}"`;
        if (b[0] === '"')
            return a.slice(0, -1) + b.slice(1);
        return;
    }
    if (typeof b == "string" && b[0] === '"' && !(a instanceof Name))
        return `"${a}${b.slice(1)}`;
    return;
}
function strConcat(c1, c2) {
    return c2.emptyStr() ? c1 : c1.emptyStr() ? c2 : str `${c1}${c2}`;
}
exports.strConcat = strConcat;
// TODO do not allow arrays here
function interpolate(x) {
    return typeof x == "number" || typeof x == "boolean" || x === null
        ? x
        : safeStringify(Array.isArray(x) ? x.join(",") : x);
}
function stringify(x) {
    return new _Code(safeStringify(x));
}
exports.stringify = stringify;
function safeStringify(x) {
    return JSON.stringify(x)
        .replace(/\u2028/g, "\\u2028")
        .replace(/\u2029/g, "\\u2029");
}
exports.safeStringify = safeStringify;
function getProperty(key) {
    return typeof key == "string" && exports.IDENTIFIER.test(key) ? new _Code(`.${key}`) : _ `[${key}]`;
}
exports.getProperty = getProperty;
//Does best effort to format the name properly
function getEsmExportName(key) {
    if (typeof key == "string" && exports.IDENTIFIER.test(key)) {
        return new _Code(`${key}`);
    }
    throw new Error(`CodeGen: invalid export name: ${key}, use explicit $id name mapping`);
}
exports.getEsmExportName = getEsmExportName;
function regexpCode(rx) {
    return new _Code(rx.toString());
}
exports.regexpCode = regexpCode;
//# sourceMappingURL=code.js.map

/***/ }),

/***/ 61089:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.or = exports.and = exports.not = exports.CodeGen = exports.operators = exports.varKinds = exports.ValueScopeName = exports.ValueScope = exports.Scope = exports.Name = exports.regexpCode = exports.stringify = exports.getProperty = exports.nil = exports.strConcat = exports.str = exports._ = void 0;
const code_1 = __webpack_require__(40345);
const scope_1 = __webpack_require__(58108);
var code_2 = __webpack_require__(40345);
Object.defineProperty(exports, "_", ({ enumerable: true, get: function () { return code_2._; } }));
Object.defineProperty(exports, "str", ({ enumerable: true, get: function () { return code_2.str; } }));
Object.defineProperty(exports, "strConcat", ({ enumerable: true, get: function () { return code_2.strConcat; } }));
Object.defineProperty(exports, "nil", ({ enumerable: true, get: function () { return code_2.nil; } }));
Object.defineProperty(exports, "getProperty", ({ enumerable: true, get: function () { return code_2.getProperty; } }));
Object.defineProperty(exports, "stringify", ({ enumerable: true, get: function () { return code_2.stringify; } }));
Object.defineProperty(exports, "regexpCode", ({ enumerable: true, get: function () { return code_2.regexpCode; } }));
Object.defineProperty(exports, "Name", ({ enumerable: true, get: function () { return code_2.Name; } }));
var scope_2 = __webpack_require__(58108);
Object.defineProperty(exports, "Scope", ({ enumerable: true, get: function () { return scope_2.Scope; } }));
Object.defineProperty(exports, "ValueScope", ({ enumerable: true, get: function () { return scope_2.ValueScope; } }));
Object.defineProperty(exports, "ValueScopeName", ({ enumerable: true, get: function () { return scope_2.ValueScopeName; } }));
Object.defineProperty(exports, "varKinds", ({ enumerable: true, get: function () { return scope_2.varKinds; } }));
exports.operators = {
    GT: new code_1._Code(">"),
    GTE: new code_1._Code(">="),
    LT: new code_1._Code("<"),
    LTE: new code_1._Code("<="),
    EQ: new code_1._Code("==="),
    NEQ: new code_1._Code("!=="),
    NOT: new code_1._Code("!"),
    OR: new code_1._Code("||"),
    AND: new code_1._Code("&&"),
    ADD: new code_1._Code("+"),
};
class Node {
    optimizeNodes() {
        return this;
    }
    optimizeNames(_names, _constants) {
        return this;
    }
}
class Def extends Node {
    constructor(varKind, name, rhs) {
        super();
        this.varKind = varKind;
        this.name = name;
        this.rhs = rhs;
    }
    render({ es5, _n }) {
        const varKind = es5 ? scope_1.varKinds.var : this.varKind;
        const rhs = this.rhs === undefined ? "" : ` = ${this.rhs}`;
        return `${varKind} ${this.name}${rhs};` + _n;
    }
    optimizeNames(names, constants) {
        if (!names[this.name.str])
            return;
        if (this.rhs)
            this.rhs = optimizeExpr(this.rhs, names, constants);
        return this;
    }
    get names() {
        return this.rhs instanceof code_1._CodeOrName ? this.rhs.names : {};
    }
}
class Assign extends Node {
    constructor(lhs, rhs, sideEffects) {
        super();
        this.lhs = lhs;
        this.rhs = rhs;
        this.sideEffects = sideEffects;
    }
    render({ _n }) {
        return `${this.lhs} = ${this.rhs};` + _n;
    }
    optimizeNames(names, constants) {
        if (this.lhs instanceof code_1.Name && !names[this.lhs.str] && !this.sideEffects)
            return;
        this.rhs = optimizeExpr(this.rhs, names, constants);
        return this;
    }
    get names() {
        const names = this.lhs instanceof code_1.Name ? {} : { ...this.lhs.names };
        return addExprNames(names, this.rhs);
    }
}
class AssignOp extends Assign {
    constructor(lhs, op, rhs, sideEffects) {
        super(lhs, rhs, sideEffects);
        this.op = op;
    }
    render({ _n }) {
        return `${this.lhs} ${this.op}= ${this.rhs};` + _n;
    }
}
class Label extends Node {
    constructor(label) {
        super();
        this.label = label;
        this.names = {};
    }
    render({ _n }) {
        return `${this.label}:` + _n;
    }
}
class Break extends Node {
    constructor(label) {
        super();
        this.label = label;
        this.names = {};
    }
    render({ _n }) {
        const label = this.label ? ` ${this.label}` : "";
        return `break${label};` + _n;
    }
}
class Throw extends Node {
    constructor(error) {
        super();
        this.error = error;
    }
    render({ _n }) {
        return `throw ${this.error};` + _n;
    }
    get names() {
        return this.error.names;
    }
}
class AnyCode extends Node {
    constructor(code) {
        super();
        this.code = code;
    }
    render({ _n }) {
        return `${this.code};` + _n;
    }
    optimizeNodes() {
        return `${this.code}` ? this : undefined;
    }
    optimizeNames(names, constants) {
        this.code = optimizeExpr(this.code, names, constants);
        return this;
    }
    get names() {
        return this.code instanceof code_1._CodeOrName ? this.code.names : {};
    }
}
class ParentNode extends Node {
    constructor(nodes = []) {
        super();
        this.nodes = nodes;
    }
    render(opts) {
        return this.nodes.reduce((code, n) => code + n.render(opts), "");
    }
    optimizeNodes() {
        const { nodes } = this;
        let i = nodes.length;
        while (i--) {
            const n = nodes[i].optimizeNodes();
            if (Array.isArray(n))
                nodes.splice(i, 1, ...n);
            else if (n)
                nodes[i] = n;
            else
                nodes.splice(i, 1);
        }
        return nodes.length > 0 ? this : undefined;
    }
    optimizeNames(names, constants) {
        const { nodes } = this;
        let i = nodes.length;
        while (i--) {
            // iterating backwards improves 1-pass optimization
            const n = nodes[i];
            if (n.optimizeNames(names, constants))
                continue;
            subtractNames(names, n.names);
            nodes.splice(i, 1);
        }
        return nodes.length > 0 ? this : undefined;
    }
    get names() {
        return this.nodes.reduce((names, n) => addNames(names, n.names), {});
    }
}
class BlockNode extends ParentNode {
    render(opts) {
        return "{" + opts._n + super.render(opts) + "}" + opts._n;
    }
}
class Root extends ParentNode {
}
class Else extends BlockNode {
}
Else.kind = "else";
class If extends BlockNode {
    constructor(condition, nodes) {
        super(nodes);
        this.condition = condition;
    }
    render(opts) {
        let code = `if(${this.condition})` + super.render(opts);
        if (this.else)
            code += "else " + this.else.render(opts);
        return code;
    }
    optimizeNodes() {
        super.optimizeNodes();
        const cond = this.condition;
        if (cond === true)
            return this.nodes; // else is ignored here
        let e = this.else;
        if (e) {
            const ns = e.optimizeNodes();
            e = this.else = Array.isArray(ns) ? new Else(ns) : ns;
        }
        if (e) {
            if (cond === false)
                return e instanceof If ? e : e.nodes;
            if (this.nodes.length)
                return this;
            return new If(not(cond), e instanceof If ? [e] : e.nodes);
        }
        if (cond === false || !this.nodes.length)
            return undefined;
        return this;
    }
    optimizeNames(names, constants) {
        var _a;
        this.else = (_a = this.else) === null || _a === void 0 ? void 0 : _a.optimizeNames(names, constants);
        if (!(super.optimizeNames(names, constants) || this.else))
            return;
        this.condition = optimizeExpr(this.condition, names, constants);
        return this;
    }
    get names() {
        const names = super.names;
        addExprNames(names, this.condition);
        if (this.else)
            addNames(names, this.else.names);
        return names;
    }
}
If.kind = "if";
class For extends BlockNode {
}
For.kind = "for";
class ForLoop extends For {
    constructor(iteration) {
        super();
        this.iteration = iteration;
    }
    render(opts) {
        return `for(${this.iteration})` + super.render(opts);
    }
    optimizeNames(names, constants) {
        if (!super.optimizeNames(names, constants))
            return;
        this.iteration = optimizeExpr(this.iteration, names, constants);
        return this;
    }
    get names() {
        return addNames(super.names, this.iteration.names);
    }
}
class ForRange extends For {
    constructor(varKind, name, from, to) {
        super();
        this.varKind = varKind;
        this.name = name;
        this.from = from;
        this.to = to;
    }
    render(opts) {
        const varKind = opts.es5 ? scope_1.varKinds.var : this.varKind;
        const { name, from, to } = this;
        return `for(${varKind} ${name}=${from}; ${name}<${to}; ${name}++)` + super.render(opts);
    }
    get names() {
        const names = addExprNames(super.names, this.from);
        return addExprNames(names, this.to);
    }
}
class ForIter extends For {
    constructor(loop, varKind, name, iterable) {
        super();
        this.loop = loop;
        this.varKind = varKind;
        this.name = name;
        this.iterable = iterable;
    }
    render(opts) {
        return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(opts);
    }
    optimizeNames(names, constants) {
        if (!super.optimizeNames(names, constants))
            return;
        this.iterable = optimizeExpr(this.iterable, names, constants);
        return this;
    }
    get names() {
        return addNames(super.names, this.iterable.names);
    }
}
class Func extends BlockNode {
    constructor(name, args, async) {
        super();
        this.name = name;
        this.args = args;
        this.async = async;
    }
    render(opts) {
        const _async = this.async ? "async " : "";
        return `${_async}function ${this.name}(${this.args})` + super.render(opts);
    }
}
Func.kind = "func";
class Return extends ParentNode {
    render(opts) {
        return "return " + super.render(opts);
    }
}
Return.kind = "return";
class Try extends BlockNode {
    render(opts) {
        let code = "try" + super.render(opts);
        if (this.catch)
            code += this.catch.render(opts);
        if (this.finally)
            code += this.finally.render(opts);
        return code;
    }
    optimizeNodes() {
        var _a, _b;
        super.optimizeNodes();
        (_a = this.catch) === null || _a === void 0 ? void 0 : _a.optimizeNodes();
        (_b = this.finally) === null || _b === void 0 ? void 0 : _b.optimizeNodes();
        return this;
    }
    optimizeNames(names, constants) {
        var _a, _b;
        super.optimizeNames(names, constants);
        (_a = this.catch) === null || _a === void 0 ? void 0 : _a.optimizeNames(names, constants);
        (_b = this.finally) === null || _b === void 0 ? void 0 : _b.optimizeNames(names, constants);
        return this;
    }
    get names() {
        const names = super.names;
        if (this.catch)
            addNames(names, this.catch.names);
        if (this.finally)
            addNames(names, this.finally.names);
        return names;
    }
}
class Catch extends BlockNode {
    constructor(error) {
        super();
        this.error = error;
    }
    render(opts) {
        return `catch(${this.error})` + super.render(opts);
    }
}
Catch.kind = "catch";
class Finally extends BlockNode {
    render(opts) {
        return "finally" + super.render(opts);
    }
}
Finally.kind = "finally";
class CodeGen {
    constructor(extScope, opts = {}) {
        this._values = {};
        this._blockStarts = [];
        this._constants = {};
        this.opts = { ...opts, _n: opts.lines ? "\n" : "" };
        this._extScope = extScope;
        this._scope = new scope_1.Scope({ parent: extScope });
        this._nodes = [new Root()];
    }
    toString() {
        return this._root.render(this.opts);
    }
    // returns unique name in the internal scope
    name(prefix) {
        return this._scope.name(prefix);
    }
    // reserves unique name in the external scope
    scopeName(prefix) {
        return this._extScope.name(prefix);
    }
    // reserves unique name in the external scope and assigns value to it
    scopeValue(prefixOrName, value) {
        const name = this._extScope.value(prefixOrName, value);
        const vs = this._values[name.prefix] || (this._values[name.prefix] = new Set());
        vs.add(name);
        return name;
    }
    getScopeValue(prefix, keyOrRef) {
        return this._extScope.getValue(prefix, keyOrRef);
    }
    // return code that assigns values in the external scope to the names that are used internally
    // (same names that were returned by gen.scopeName or gen.scopeValue)
    scopeRefs(scopeName) {
        return this._extScope.scopeRefs(scopeName, this._values);
    }
    scopeCode() {
        return this._extScope.scopeCode(this._values);
    }
    _def(varKind, nameOrPrefix, rhs, constant) {
        const name = this._scope.toName(nameOrPrefix);
        if (rhs !== undefined && constant)
            this._constants[name.str] = rhs;
        this._leafNode(new Def(varKind, name, rhs));
        return name;
    }
    // `const` declaration (`var` in es5 mode)
    const(nameOrPrefix, rhs, _constant) {
        return this._def(scope_1.varKinds.const, nameOrPrefix, rhs, _constant);
    }
    // `let` declaration with optional assignment (`var` in es5 mode)
    let(nameOrPrefix, rhs, _constant) {
        return this._def(scope_1.varKinds.let, nameOrPrefix, rhs, _constant);
    }
    // `var` declaration with optional assignment
    var(nameOrPrefix, rhs, _constant) {
        return this._def(scope_1.varKinds.var, nameOrPrefix, rhs, _constant);
    }
    // assignment code
    assign(lhs, rhs, sideEffects) {
        return this._leafNode(new Assign(lhs, rhs, sideEffects));
    }
    // `+=` code
    add(lhs, rhs) {
        return this._leafNode(new AssignOp(lhs, exports.operators.ADD, rhs));
    }
    // appends passed SafeExpr to code or executes Block
    code(c) {
        if (typeof c == "function")
            c();
        else if (c !== code_1.nil)
            this._leafNode(new AnyCode(c));
        return this;
    }
    // returns code for object literal for the passed argument list of key-value pairs
    object(...keyValues) {
        const code = ["{"];
        for (const [key, value] of keyValues) {
            if (code.length > 1)
                code.push(",");
            code.push(key);
            if (key !== value || this.opts.es5) {
                code.push(":");
                (0, code_1.addCodeArg)(code, value);
            }
        }
        code.push("}");
        return new code_1._Code(code);
    }
    // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
    if(condition, thenBody, elseBody) {
        this._blockNode(new If(condition));
        if (thenBody && elseBody) {
            this.code(thenBody).else().code(elseBody).endIf();
        }
        else if (thenBody) {
            this.code(thenBody).endIf();
        }
        else if (elseBody) {
            throw new Error('CodeGen: "else" body without "then" body');
        }
        return this;
    }
    // `else if` clause - invalid without `if` or after `else` clauses
    elseIf(condition) {
        return this._elseNode(new If(condition));
    }
    // `else` clause - only valid after `if` or `else if` clauses
    else() {
        return this._elseNode(new Else());
    }
    // end `if` statement (needed if gen.if was used only with condition)
    endIf() {
        return this._endBlockNode(If, Else);
    }
    _for(node, forBody) {
        this._blockNode(node);
        if (forBody)
            this.code(forBody).endFor();
        return this;
    }
    // a generic `for` clause (or statement if `forBody` is passed)
    for(iteration, forBody) {
        return this._for(new ForLoop(iteration), forBody);
    }
    // `for` statement for a range of values
    forRange(nameOrPrefix, from, to, forBody, varKind = this.opts.es5 ? scope_1.varKinds.var : scope_1.varKinds.let) {
        const name = this._scope.toName(nameOrPrefix);
        return this._for(new ForRange(varKind, name, from, to), () => forBody(name));
    }
    // `for-of` statement (in es5 mode replace with a normal for loop)
    forOf(nameOrPrefix, iterable, forBody, varKind = scope_1.varKinds.const) {
        const name = this._scope.toName(nameOrPrefix);
        if (this.opts.es5) {
            const arr = iterable instanceof code_1.Name ? iterable : this.var("_arr", iterable);
            return this.forRange("_i", 0, (0, code_1._) `${arr}.length`, (i) => {
                this.var(name, (0, code_1._) `${arr}[${i}]`);
                forBody(name);
            });
        }
        return this._for(new ForIter("of", varKind, name, iterable), () => forBody(name));
    }
    // `for-in` statement.
    // With option `ownProperties` replaced with a `for-of` loop for object keys
    forIn(nameOrPrefix, obj, forBody, varKind = this.opts.es5 ? scope_1.varKinds.var : scope_1.varKinds.const) {
        if (this.opts.ownProperties) {
            return this.forOf(nameOrPrefix, (0, code_1._) `Object.keys(${obj})`, forBody);
        }
        const name = this._scope.toName(nameOrPrefix);
        return this._for(new ForIter("in", varKind, name, obj), () => forBody(name));
    }
    // end `for` loop
    endFor() {
        return this._endBlockNode(For);
    }
    // `label` statement
    label(label) {
        return this._leafNode(new Label(label));
    }
    // `break` statement
    break(label) {
        return this._leafNode(new Break(label));
    }
    // `return` statement
    return(value) {
        const node = new Return();
        this._blockNode(node);
        this.code(value);
        if (node.nodes.length !== 1)
            throw new Error('CodeGen: "return" should have one node');
        return this._endBlockNode(Return);
    }
    // `try` statement
    try(tryBody, catchCode, finallyCode) {
        if (!catchCode && !finallyCode)
            throw new Error('CodeGen: "try" without "catch" and "finally"');
        const node = new Try();
        this._blockNode(node);
        this.code(tryBody);
        if (catchCode) {
            const error = this.name("e");
            this._currNode = node.catch = new Catch(error);
            catchCode(error);
        }
        if (finallyCode) {
            this._currNode = node.finally = new Finally();
            this.code(finallyCode);
        }
        return this._endBlockNode(Catch, Finally);
    }
    // `throw` statement
    throw(error) {
        return this._leafNode(new Throw(error));
    }
    // start self-balancing block
    block(body, nodeCount) {
        this._blockStarts.push(this._nodes.length);
        if (body)
            this.code(body).endBlock(nodeCount);
        return this;
    }
    // end the current self-balancing block
    endBlock(nodeCount) {
        const len = this._blockStarts.pop();
        if (len === undefined)
            throw new Error("CodeGen: not in self-balancing block");
        const toClose = this._nodes.length - len;
        if (toClose < 0 || (nodeCount !== undefined && toClose !== nodeCount)) {
            throw new Error(`CodeGen: wrong number of nodes: ${toClose} vs ${nodeCount} expected`);
        }
        this._nodes.length = len;
        return this;
    }
    // `function` heading (or definition if funcBody is passed)
    func(name, args = code_1.nil, async, funcBody) {
        this._blockNode(new Func(name, args, async));
        if (funcBody)
            this.code(funcBody).endFunc();
        return this;
    }
    // end function definition
    endFunc() {
        return this._endBlockNode(Func);
    }
    optimize(n = 1) {
        while (n-- > 0) {
            this._root.optimizeNodes();
            this._root.optimizeNames(this._root.names, this._constants);
        }
    }
    _leafNode(node) {
        this._currNode.nodes.push(node);
        return this;
    }
    _blockNode(node) {
        this._currNode.nodes.push(node);
        this._nodes.push(node);
    }
    _endBlockNode(N1, N2) {
        const n = this._currNode;
        if (n instanceof N1 || (N2 && n instanceof N2)) {
            this._nodes.pop();
            return this;
        }
        throw new Error(`CodeGen: not in block "${N2 ? `${N1.kind}/${N2.kind}` : N1.kind}"`);
    }
    _elseNode(node) {
        const n = this._currNode;
        if (!(n instanceof If)) {
            throw new Error('CodeGen: "else" without "if"');
        }
        this._currNode = n.else = node;
        return this;
    }
    get _root() {
        return this._nodes[0];
    }
    get _currNode() {
        const ns = this._nodes;
        return ns[ns.length - 1];
    }
    set _currNode(node) {
        const ns = this._nodes;
        ns[ns.length - 1] = node;
    }
}
exports.CodeGen = CodeGen;
function addNames(names, from) {
    for (const n in from)
        names[n] = (names[n] || 0) + (from[n] || 0);
    return names;
}
function addExprNames(names, from) {
    return from instanceof code_1._CodeOrName ? addNames(names, from.names) : names;
}
function optimizeExpr(expr, names, constants) {
    if (expr instanceof code_1.Name)
        return replaceName(expr);
    if (!canOptimize(expr))
        return expr;
    return new code_1._Code(expr._items.reduce((items, c) => {
        if (c instanceof code_1.Name)
            c = replaceName(c);
        if (c instanceof code_1._Code)
            items.push(...c._items);
        else
            items.push(c);
        return items;
    }, []));
    function replaceName(n) {
        const c = constants[n.str];
        if (c === undefined || names[n.str] !== 1)
            return n;
        delete names[n.str];
        return c;
    }
    function canOptimize(e) {
        return (e instanceof code_1._Code &&
            e._items.some((c) => c instanceof code_1.Name && names[c.str] === 1 && constants[c.str] !== undefined));
    }
}
function subtractNames(names, from) {
    for (const n in from)
        names[n] = (names[n] || 0) - (from[n] || 0);
}
function not(x) {
    return typeof x == "boolean" || typeof x == "number" || x === null ? !x : (0, code_1._) `!${par(x)}`;
}
exports.not = not;
const andCode = mappend(exports.operators.AND);
// boolean AND (&&) expression with the passed arguments
function and(...args) {
    return args.reduce(andCode);
}
exports.and = and;
const orCode = mappend(exports.operators.OR);
// boolean OR (||) expression with the passed arguments
function or(...args) {
    return args.reduce(orCode);
}
exports.or = or;
function mappend(op) {
    return (x, y) => (x === code_1.nil ? y : y === code_1.nil ? x : (0, code_1._) `${par(x)} ${op} ${par(y)}`);
}
function par(x) {
    return x instanceof code_1.Name ? x : (0, code_1._) `(${x})`;
}
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 58108:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ValueScope = exports.ValueScopeName = exports.Scope = exports.varKinds = exports.UsedValueState = void 0;
const code_1 = __webpack_require__(40345);
class ValueError extends Error {
    constructor(name) {
        super(`CodeGen: "code" for ${name} not defined`);
        this.value = name.value;
    }
}
var UsedValueState;
(function (UsedValueState) {
    UsedValueState[UsedValueState["Started"] = 0] = "Started";
    UsedValueState[UsedValueState["Completed"] = 1] = "Completed";
})(UsedValueState = exports.UsedValueState || (exports.UsedValueState = {}));
exports.varKinds = {
    const: new code_1.Name("const"),
    let: new code_1.Name("let"),
    var: new code_1.Name("var"),
};
class Scope {
    constructor({ prefixes, parent } = {}) {
        this._names = {};
        this._prefixes = prefixes;
        this._parent = parent;
    }
    toName(nameOrPrefix) {
        return nameOrPrefix instanceof code_1.Name ? nameOrPrefix : this.name(nameOrPrefix);
    }
    name(prefix) {
        return new code_1.Name(this._newName(prefix));
    }
    _newName(prefix) {
        const ng = this._names[prefix] || this._nameGroup(prefix);
        return `${prefix}${ng.index++}`;
    }
    _nameGroup(prefix) {
        var _a, _b;
        if (((_b = (_a = this._parent) === null || _a === void 0 ? void 0 : _a._prefixes) === null || _b === void 0 ? void 0 : _b.has(prefix)) || (this._prefixes && !this._prefixes.has(prefix))) {
            throw new Error(`CodeGen: prefix "${prefix}" is not allowed in this scope`);
        }
        return (this._names[prefix] = { prefix, index: 0 });
    }
}
exports.Scope = Scope;
class ValueScopeName extends code_1.Name {
    constructor(prefix, nameStr) {
        super(nameStr);
        this.prefix = prefix;
    }
    setValue(value, { property, itemIndex }) {
        this.value = value;
        this.scopePath = (0, code_1._) `.${new code_1.Name(property)}[${itemIndex}]`;
    }
}
exports.ValueScopeName = ValueScopeName;
const line = (0, code_1._) `\n`;
class ValueScope extends Scope {
    constructor(opts) {
        super(opts);
        this._values = {};
        this._scope = opts.scope;
        this.opts = { ...opts, _n: opts.lines ? line : code_1.nil };
    }
    get() {
        return this._scope;
    }
    name(prefix) {
        return new ValueScopeName(prefix, this._newName(prefix));
    }
    value(nameOrPrefix, value) {
        var _a;
        if (value.ref === undefined)
            throw new Error("CodeGen: ref must be passed in value");
        const name = this.toName(nameOrPrefix);
        const { prefix } = name;
        const valueKey = (_a = value.key) !== null && _a !== void 0 ? _a : value.ref;
        let vs = this._values[prefix];
        if (vs) {
            const _name = vs.get(valueKey);
            if (_name)
                return _name;
        }
        else {
            vs = this._values[prefix] = new Map();
        }
        vs.set(valueKey, name);
        const s = this._scope[prefix] || (this._scope[prefix] = []);
        const itemIndex = s.length;
        s[itemIndex] = value.ref;
        name.setValue(value, { property: prefix, itemIndex });
        return name;
    }
    getValue(prefix, keyOrRef) {
        const vs = this._values[prefix];
        if (!vs)
            return;
        return vs.get(keyOrRef);
    }
    scopeRefs(scopeName, values = this._values) {
        return this._reduceValues(values, (name) => {
            if (name.scopePath === undefined)
                throw new Error(`CodeGen: name "${name}" has no value`);
            return (0, code_1._) `${scopeName}${name.scopePath}`;
        });
    }
    scopeCode(values = this._values, usedValues, getCode) {
        return this._reduceValues(values, (name) => {
            if (name.value === undefined)
                throw new Error(`CodeGen: name "${name}" has no value`);
            return name.value.code;
        }, usedValues, getCode);
    }
    _reduceValues(values, valueCode, usedValues = {}, getCode) {
        let code = code_1.nil;
        for (const prefix in values) {
            const vs = values[prefix];
            if (!vs)
                continue;
            const nameSet = (usedValues[prefix] = usedValues[prefix] || new Map());
            vs.forEach((name) => {
                if (nameSet.has(name))
                    return;
                nameSet.set(name, UsedValueState.Started);
                let c = valueCode(name);
                if (c) {
                    const def = this.opts.es5 ? exports.varKinds.var : exports.varKinds.const;
                    code = (0, code_1._) `${code}${def} ${name} = ${c};${this.opts._n}`;
                }
                else if ((c = getCode === null || getCode === void 0 ? void 0 : getCode(name))) {
                    code = (0, code_1._) `${code}${c}${this.opts._n}`;
                }
                else {
                    throw new ValueError(name);
                }
                nameSet.set(name, UsedValueState.Completed);
            });
        }
        return code;
    }
}
exports.ValueScope = ValueScope;
//# sourceMappingURL=scope.js.map

/***/ }),

/***/ 2439:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.extendErrors = exports.resetErrorsCount = exports.reportExtraError = exports.reportError = exports.keyword$DataError = exports.keywordError = void 0;
const codegen_1 = __webpack_require__(61089);
const util_1 = __webpack_require__(86824);
const names_1 = __webpack_require__(16842);
exports.keywordError = {
    message: ({ keyword }) => (0, codegen_1.str) `must pass "${keyword}" keyword validation`,
};
exports.keyword$DataError = {
    message: ({ keyword, schemaType }) => schemaType
        ? (0, codegen_1.str) `"${keyword}" keyword must be ${schemaType} ($data)`
        : (0, codegen_1.str) `"${keyword}" keyword is invalid ($data)`,
};
function reportError(cxt, error = exports.keywordError, errorPaths, overrideAllErrors) {
    const { it } = cxt;
    const { gen, compositeRule, allErrors } = it;
    const errObj = errorObjectCode(cxt, error, errorPaths);
    if (overrideAllErrors !== null && overrideAllErrors !== void 0 ? overrideAllErrors : (compositeRule || allErrors)) {
        addError(gen, errObj);
    }
    else {
        returnErrors(it, (0, codegen_1._) `[${errObj}]`);
    }
}
exports.reportError = reportError;
function reportExtraError(cxt, error = exports.keywordError, errorPaths) {
    const { it } = cxt;
    const { gen, compositeRule, allErrors } = it;
    const errObj = errorObjectCode(cxt, error, errorPaths);
    addError(gen, errObj);
    if (!(compositeRule || allErrors)) {
        returnErrors(it, names_1.default.vErrors);
    }
}
exports.reportExtraError = reportExtraError;
function resetErrorsCount(gen, errsCount) {
    gen.assign(names_1.default.errors, errsCount);
    gen.if((0, codegen_1._) `${names_1.default.vErrors} !== null`, () => gen.if(errsCount, () => gen.assign((0, codegen_1._) `${names_1.default.vErrors}.length`, errsCount), () => gen.assign(names_1.default.vErrors, null)));
}
exports.resetErrorsCount = resetErrorsCount;
function extendErrors({ gen, keyword, schemaValue, data, errsCount, it, }) {
    /* istanbul ignore if */
    if (errsCount === undefined)
        throw new Error("ajv implementation error");
    const err = gen.name("err");
    gen.forRange("i", errsCount, names_1.default.errors, (i) => {
        gen.const(err, (0, codegen_1._) `${names_1.default.vErrors}[${i}]`);
        gen.if((0, codegen_1._) `${err}.instancePath === undefined`, () => gen.assign((0, codegen_1._) `${err}.instancePath`, (0, codegen_1.strConcat)(names_1.default.instancePath, it.errorPath)));
        gen.assign((0, codegen_1._) `${err}.schemaPath`, (0, codegen_1.str) `${it.errSchemaPath}/${keyword}`);
        if (it.opts.verbose) {
            gen.assign((0, codegen_1._) `${err}.schema`, schemaValue);
            gen.assign((0, codegen_1._) `${err}.data`, data);
        }
    });
}
exports.extendErrors = extendErrors;
function addError(gen, errObj) {
    const err = gen.const("err", errObj);
    gen.if((0, codegen_1._) `${names_1.default.vErrors} === null`, () => gen.assign(names_1.default.vErrors, (0, codegen_1._) `[${err}]`), (0, codegen_1._) `${names_1.default.vErrors}.push(${err})`);
    gen.code((0, codegen_1._) `${names_1.default.errors}++`);
}
function returnErrors(it, errs) {
    const { gen, validateName, schemaEnv } = it;
    if (schemaEnv.$async) {
        gen.throw((0, codegen_1._) `new ${it.ValidationError}(${errs})`);
    }
    else {
        gen.assign((0, codegen_1._) `${validateName}.errors`, errs);
        gen.return(false);
    }
}
const E = {
    keyword: new codegen_1.Name("keyword"),
    schemaPath: new codegen_1.Name("schemaPath"),
    params: new codegen_1.Name("params"),
    propertyName: new codegen_1.Name("propertyName"),
    message: new codegen_1.Name("message"),
    schema: new codegen_1.Name("schema"),
    parentSchema: new codegen_1.Name("parentSchema"),
};
function errorObjectCode(cxt, error, errorPaths) {
    const { createErrors } = cxt.it;
    if (createErrors === false)
        return (0, codegen_1._) `{}`;
    return errorObject(cxt, error, errorPaths);
}
function errorObject(cxt, error, errorPaths = {}) {
    const { gen, it } = cxt;
    const keyValues = [
        errorInstancePath(it, errorPaths),
        errorSchemaPath(cxt, errorPaths),
    ];
    extraErrorProps(cxt, error, keyValues);
    return gen.object(...keyValues);
}
function errorInstancePath({ errorPath }, { instancePath }) {
    const instPath = instancePath
        ? (0, codegen_1.str) `${errorPath}${(0, util_1.getErrorPath)(instancePath, util_1.Type.Str)}`
        : errorPath;
    return [names_1.default.instancePath, (0, codegen_1.strConcat)(names_1.default.instancePath, instPath)];
}
function errorSchemaPath({ keyword, it: { errSchemaPath } }, { schemaPath, parentSchema }) {
    let schPath = parentSchema ? errSchemaPath : (0, codegen_1.str) `${errSchemaPath}/${keyword}`;
    if (schemaPath) {
        schPath = (0, codegen_1.str) `${schPath}${(0, util_1.getErrorPath)(schemaPath, util_1.Type.Str)}`;
    }
    return [E.schemaPath, schPath];
}
function extraErrorProps(cxt, { params, message }, keyValues) {
    const { keyword, data, schemaValue, it } = cxt;
    const { opts, propertyName, topSchemaRef, schemaPath } = it;
    keyValues.push([E.keyword, keyword], [E.params, typeof params == "function" ? params(cxt) : params || (0, codegen_1._) `{}`]);
    if (opts.messages) {
        keyValues.push([E.message, typeof message == "function" ? message(cxt) : message]);
    }
    if (opts.verbose) {
        keyValues.push([E.schema, schemaValue], [E.parentSchema, (0, codegen_1._) `${topSchemaRef}${schemaPath}`], [names_1.default.data, data]);
    }
    if (propertyName)
        keyValues.push([E.propertyName, propertyName]);
}
//# sourceMappingURL=errors.js.map

/***/ }),

/***/ 84029:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.resolveSchema = exports.getCompilingSchema = exports.resolveRef = exports.compileSchema = exports.SchemaEnv = void 0;
const codegen_1 = __webpack_require__(61089);
const validation_error_1 = __webpack_require__(99401);
const names_1 = __webpack_require__(16842);
const resolve_1 = __webpack_require__(17325);
const util_1 = __webpack_require__(86824);
const validate_1 = __webpack_require__(24587);
class SchemaEnv {
    constructor(env) {
        var _a;
        this.refs = {};
        this.dynamicAnchors = {};
        let schema;
        if (typeof env.schema == "object")
            schema = env.schema;
        this.schema = env.schema;
        this.schemaId = env.schemaId;
        this.root = env.root || this;
        this.baseId = (_a = env.baseId) !== null && _a !== void 0 ? _a : (0, resolve_1.normalizeId)(schema === null || schema === void 0 ? void 0 : schema[env.schemaId || "$id"]);
        this.schemaPath = env.schemaPath;
        this.localRefs = env.localRefs;
        this.meta = env.meta;
        this.$async = schema === null || schema === void 0 ? void 0 : schema.$async;
        this.refs = {};
    }
}
exports.SchemaEnv = SchemaEnv;
// let codeSize = 0
// let nodeCount = 0
// Compiles schema in SchemaEnv
function compileSchema(sch) {
    // TODO refactor - remove compilations
    const _sch = getCompilingSchema.call(this, sch);
    if (_sch)
        return _sch;
    const rootId = (0, resolve_1.getFullPath)(this.opts.uriResolver, sch.root.baseId); // TODO if getFullPath removed 1 tests fails
    const { es5, lines } = this.opts.code;
    const { ownProperties } = this.opts;
    const gen = new codegen_1.CodeGen(this.scope, { es5, lines, ownProperties });
    let _ValidationError;
    if (sch.$async) {
        _ValidationError = gen.scopeValue("Error", {
            ref: validation_error_1.default,
            code: (0, codegen_1._) `require("ajv/dist/runtime/validation_error").default`,
        });
    }
    const validateName = gen.scopeName("validate");
    sch.validateName = validateName;
    const schemaCxt = {
        gen,
        allErrors: this.opts.allErrors,
        data: names_1.default.data,
        parentData: names_1.default.parentData,
        parentDataProperty: names_1.default.parentDataProperty,
        dataNames: [names_1.default.data],
        dataPathArr: [codegen_1.nil],
        dataLevel: 0,
        dataTypes: [],
        definedProperties: new Set(),
        topSchemaRef: gen.scopeValue("schema", this.opts.code.source === true
            ? { ref: sch.schema, code: (0, codegen_1.stringify)(sch.schema) }
            : { ref: sch.schema }),
        validateName,
        ValidationError: _ValidationError,
        schema: sch.schema,
        schemaEnv: sch,
        rootId,
        baseId: sch.baseId || rootId,
        schemaPath: codegen_1.nil,
        errSchemaPath: sch.schemaPath || (this.opts.jtd ? "" : "#"),
        errorPath: (0, codegen_1._) `""`,
        opts: this.opts,
        self: this,
    };
    let sourceCode;
    try {
        this._compilations.add(sch);
        (0, validate_1.validateFunctionCode)(schemaCxt);
        gen.optimize(this.opts.code.optimize);
        // gen.optimize(1)
        const validateCode = gen.toString();
        sourceCode = `${gen.scopeRefs(names_1.default.scope)}return ${validateCode}`;
        // console.log((codeSize += sourceCode.length), (nodeCount += gen.nodeCount))
        if (this.opts.code.process)
            sourceCode = this.opts.code.process(sourceCode, sch);
        // console.log("\n\n\n *** \n", sourceCode)
        const makeValidate = new Function(`${names_1.default.self}`, `${names_1.default.scope}`, sourceCode);
        const validate = makeValidate(this, this.scope.get());
        this.scope.value(validateName, { ref: validate });
        validate.errors = null;
        validate.schema = sch.schema;
        validate.schemaEnv = sch;
        if (sch.$async)
            validate.$async = true;
        if (this.opts.code.source === true) {
            validate.source = { validateName, validateCode, scopeValues: gen._values };
        }
        if (this.opts.unevaluated) {
            const { props, items } = schemaCxt;
            validate.evaluated = {
                props: props instanceof codegen_1.Name ? undefined : props,
                items: items instanceof codegen_1.Name ? undefined : items,
                dynamicProps: props instanceof codegen_1.Name,
                dynamicItems: items instanceof codegen_1.Name,
            };
            if (validate.source)
                validate.source.evaluated = (0, codegen_1.stringify)(validate.evaluated);
        }
        sch.validate = validate;
        return sch;
    }
    catch (e) {
        delete sch.validate;
        delete sch.validateName;
        if (sourceCode)
            this.logger.error("Error compiling schema, function code:", sourceCode);
        // console.log("\n\n\n *** \n", sourceCode, this.opts)
        throw e;
    }
    finally {
        this._compilations.delete(sch);
    }
}
exports.compileSchema = compileSchema;
function resolveRef(root, baseId, ref) {
    var _a;
    ref = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, ref);
    const schOrFunc = root.refs[ref];
    if (schOrFunc)
        return schOrFunc;
    let _sch = resolve.call(this, root, ref);
    if (_sch === undefined) {
        const schema = (_a = root.localRefs) === null || _a === void 0 ? void 0 : _a[ref]; // TODO maybe localRefs should hold SchemaEnv
        const { schemaId } = this.opts;
        if (schema)
            _sch = new SchemaEnv({ schema, schemaId, root, baseId });
    }
    if (_sch === undefined)
        return;
    return (root.refs[ref] = inlineOrCompile.call(this, _sch));
}
exports.resolveRef = resolveRef;
function inlineOrCompile(sch) {
    if ((0, resolve_1.inlineRef)(sch.schema, this.opts.inlineRefs))
        return sch.schema;
    return sch.validate ? sch : compileSchema.call(this, sch);
}
// Index of schema compilation in the currently compiled list
function getCompilingSchema(schEnv) {
    for (const sch of this._compilations) {
        if (sameSchemaEnv(sch, schEnv))
            return sch;
    }
}
exports.getCompilingSchema = getCompilingSchema;
function sameSchemaEnv(s1, s2) {
    return s1.schema === s2.schema && s1.root === s2.root && s1.baseId === s2.baseId;
}
// resolve and compile the references ($ref)
// TODO returns AnySchemaObject (if the schema can be inlined) or validation function
function resolve(root, // information about the root schema for the current schema
ref // reference to resolve
) {
    let sch;
    while (typeof (sch = this.refs[ref]) == "string")
        ref = sch;
    return sch || this.schemas[ref] || resolveSchema.call(this, root, ref);
}
// Resolve schema, its root and baseId
function resolveSchema(root, // root object with properties schema, refs TODO below SchemaEnv is assigned to it
ref // reference to resolve
) {
    const p = this.opts.uriResolver.parse(ref);
    const refPath = (0, resolve_1._getFullPath)(this.opts.uriResolver, p);
    let baseId = (0, resolve_1.getFullPath)(this.opts.uriResolver, root.baseId, undefined);
    // TODO `Object.keys(root.schema).length > 0` should not be needed - but removing breaks 2 tests
    if (Object.keys(root.schema).length > 0 && refPath === baseId) {
        return getJsonPointer.call(this, p, root);
    }
    const id = (0, resolve_1.normalizeId)(refPath);
    const schOrRef = this.refs[id] || this.schemas[id];
    if (typeof schOrRef == "string") {
        const sch = resolveSchema.call(this, root, schOrRef);
        if (typeof (sch === null || sch === void 0 ? void 0 : sch.schema) !== "object")
            return;
        return getJsonPointer.call(this, p, sch);
    }
    if (typeof (schOrRef === null || schOrRef === void 0 ? void 0 : schOrRef.schema) !== "object")
        return;
    if (!schOrRef.validate)
        compileSchema.call(this, schOrRef);
    if (id === (0, resolve_1.normalizeId)(ref)) {
        const { schema } = schOrRef;
        const { schemaId } = this.opts;
        const schId = schema[schemaId];
        if (schId)
            baseId = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, schId);
        return new SchemaEnv({ schema, schemaId, root, baseId });
    }
    return getJsonPointer.call(this, p, schOrRef);
}
exports.resolveSchema = resolveSchema;
const PREVENT_SCOPE_CHANGE = new Set([
    "properties",
    "patternProperties",
    "enum",
    "dependencies",
    "definitions",
]);
function getJsonPointer(parsedRef, { baseId, schema, root }) {
    var _a;
    if (((_a = parsedRef.fragment) === null || _a === void 0 ? void 0 : _a[0]) !== "/")
        return;
    for (const part of parsedRef.fragment.slice(1).split("/")) {
        if (typeof schema === "boolean")
            return;
        const partSchema = schema[(0, util_1.unescapeFragment)(part)];
        if (partSchema === undefined)
            return;
        schema = partSchema;
        // TODO PREVENT_SCOPE_CHANGE could be defined in keyword def?
        const schId = typeof schema === "object" && schema[this.opts.schemaId];
        if (!PREVENT_SCOPE_CHANGE.has(part) && schId) {
            baseId = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, schId);
        }
    }
    let env;
    if (typeof schema != "boolean" && schema.$ref && !(0, util_1.schemaHasRulesButRef)(schema, this.RULES)) {
        const $ref = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, schema.$ref);
        env = resolveSchema.call(this, root, $ref);
    }
    // even though resolution failed we need to return SchemaEnv to throw exception
    // so that compileAsync loads missing schema.
    const { schemaId } = this.opts;
    env = env || new SchemaEnv({ schema, schemaId, root, baseId });
    if (env.schema !== env.root.schema)
        return env;
    return undefined;
}
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 16842:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const codegen_1 = __webpack_require__(61089);
const names = {
    // validation function arguments
    data: new codegen_1.Name("data"),
    // args passed from referencing schema
    valCxt: new codegen_1.Name("valCxt"),
    instancePath: new codegen_1.Name("instancePath"),
    parentData: new codegen_1.Name("parentData"),
    parentDataProperty: new codegen_1.Name("parentDataProperty"),
    rootData: new codegen_1.Name("rootData"),
    dynamicAnchors: new codegen_1.Name("dynamicAnchors"),
    // function scoped variables
    vErrors: new codegen_1.Name("vErrors"),
    errors: new codegen_1.Name("errors"),
    this: new codegen_1.Name("this"),
    // "globals"
    self: new codegen_1.Name("self"),
    scope: new codegen_1.Name("scope"),
    // JTD serialize/parse name for JSON string and position
    json: new codegen_1.Name("json"),
    jsonPos: new codegen_1.Name("jsonPos"),
    jsonLen: new codegen_1.Name("jsonLen"),
    jsonPart: new codegen_1.Name("jsonPart"),
};
exports["default"] = names;
//# sourceMappingURL=names.js.map

/***/ }),

/***/ 60010:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const resolve_1 = __webpack_require__(17325);
class MissingRefError extends Error {
    constructor(resolver, baseId, ref, msg) {
        super(msg || `can't resolve reference ${ref} from id ${baseId}`);
        this.missingRef = (0, resolve_1.resolveUrl)(resolver, baseId, ref);
        this.missingSchema = (0, resolve_1.normalizeId)((0, resolve_1.getFullPath)(resolver, this.missingRef));
    }
}
exports["default"] = MissingRefError;
//# sourceMappingURL=ref_error.js.map

/***/ }),

/***/ 17325:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getSchemaRefs = exports.resolveUrl = exports.normalizeId = exports._getFullPath = exports.getFullPath = exports.inlineRef = void 0;
const util_1 = __webpack_require__(86824);
const equal = __webpack_require__(92417);
const traverse = __webpack_require__(19358);
// TODO refactor to use keyword definitions
const SIMPLE_INLINED = new Set([
    "type",
    "format",
    "pattern",
    "maxLength",
    "minLength",
    "maxProperties",
    "minProperties",
    "maxItems",
    "minItems",
    "maximum",
    "minimum",
    "uniqueItems",
    "multipleOf",
    "required",
    "enum",
    "const",
]);
function inlineRef(schema, limit = true) {
    if (typeof schema == "boolean")
        return true;
    if (limit === true)
        return !hasRef(schema);
    if (!limit)
        return false;
    return countKeys(schema) <= limit;
}
exports.inlineRef = inlineRef;
const REF_KEYWORDS = new Set([
    "$ref",
    "$recursiveRef",
    "$recursiveAnchor",
    "$dynamicRef",
    "$dynamicAnchor",
]);
function hasRef(schema) {
    for (const key in schema) {
        if (REF_KEYWORDS.has(key))
            return true;
        const sch = schema[key];
        if (Array.isArray(sch) && sch.some(hasRef))
            return true;
        if (typeof sch == "object" && hasRef(sch))
            return true;
    }
    return false;
}
function countKeys(schema) {
    let count = 0;
    for (const key in schema) {
        if (key === "$ref")
            return Infinity;
        count++;
        if (SIMPLE_INLINED.has(key))
            continue;
        if (typeof schema[key] == "object") {
            (0, util_1.eachItem)(schema[key], (sch) => (count += countKeys(sch)));
        }
        if (count === Infinity)
            return Infinity;
    }
    return count;
}
function getFullPath(resolver, id = "", normalize) {
    if (normalize !== false)
        id = normalizeId(id);
    const p = resolver.parse(id);
    return _getFullPath(resolver, p);
}
exports.getFullPath = getFullPath;
function _getFullPath(resolver, p) {
    const serialized = resolver.serialize(p);
    return serialized.split("#")[0] + "#";
}
exports._getFullPath = _getFullPath;
const TRAILING_SLASH_HASH = /#\/?$/;
function normalizeId(id) {
    return id ? id.replace(TRAILING_SLASH_HASH, "") : "";
}
exports.normalizeId = normalizeId;
function resolveUrl(resolver, baseId, id) {
    id = normalizeId(id);
    return resolver.resolve(baseId, id);
}
exports.resolveUrl = resolveUrl;
const ANCHOR = /^[a-z_][-a-z0-9._]*$/i;
function getSchemaRefs(schema, baseId) {
    if (typeof schema == "boolean")
        return {};
    const { schemaId, uriResolver } = this.opts;
    const schId = normalizeId(schema[schemaId] || baseId);
    const baseIds = { "": schId };
    const pathPrefix = getFullPath(uriResolver, schId, false);
    const localRefs = {};
    const schemaRefs = new Set();
    traverse(schema, { allKeys: true }, (sch, jsonPtr, _, parentJsonPtr) => {
        if (parentJsonPtr === undefined)
            return;
        const fullPath = pathPrefix + jsonPtr;
        let baseId = baseIds[parentJsonPtr];
        if (typeof sch[schemaId] == "string")
            baseId = addRef.call(this, sch[schemaId]);
        addAnchor.call(this, sch.$anchor);
        addAnchor.call(this, sch.$dynamicAnchor);
        baseIds[jsonPtr] = baseId;
        function addRef(ref) {
            // eslint-disable-next-line @typescript-eslint/unbound-method
            const _resolve = this.opts.uriResolver.resolve;
            ref = normalizeId(baseId ? _resolve(baseId, ref) : ref);
            if (schemaRefs.has(ref))
                throw ambiguos(ref);
            schemaRefs.add(ref);
            let schOrRef = this.refs[ref];
            if (typeof schOrRef == "string")
                schOrRef = this.refs[schOrRef];
            if (typeof schOrRef == "object") {
                checkAmbiguosRef(sch, schOrRef.schema, ref);
            }
            else if (ref !== normalizeId(fullPath)) {
                if (ref[0] === "#") {
                    checkAmbiguosRef(sch, localRefs[ref], ref);
                    localRefs[ref] = sch;
                }
                else {
                    this.refs[ref] = fullPath;
                }
            }
            return ref;
        }
        function addAnchor(anchor) {
            if (typeof anchor == "string") {
                if (!ANCHOR.test(anchor))
                    throw new Error(`invalid anchor "${anchor}"`);
                addRef.call(this, `#${anchor}`);
            }
        }
    });
    return localRefs;
    function checkAmbiguosRef(sch1, sch2, ref) {
        if (sch2 !== undefined && !equal(sch1, sch2))
            throw ambiguos(ref);
    }
    function ambiguos(ref) {
        return new Error(`reference "${ref}" resolves to more than one schema`);
    }
}
exports.getSchemaRefs = getSchemaRefs;
//# sourceMappingURL=resolve.js.map

/***/ }),

/***/ 54964:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getRules = exports.isJSONType = void 0;
const _jsonTypes = ["string", "number", "integer", "boolean", "null", "object", "array"];
const jsonTypes = new Set(_jsonTypes);
function isJSONType(x) {
    return typeof x == "string" && jsonTypes.has(x);
}
exports.isJSONType = isJSONType;
function getRules() {
    const groups = {
        number: { type: "number", rules: [] },
        string: { type: "string", rules: [] },
        array: { type: "array", rules: [] },
        object: { type: "object", rules: [] },
    };
    return {
        types: { ...groups, integer: true, boolean: true, null: true },
        rules: [{ rules: [] }, groups.number, groups.string, groups.array, groups.object],
        post: { rules: [] },
        all: {},
        keywords: {},
    };
}
exports.getRules = getRules;
//# sourceMappingURL=rules.js.map

/***/ }),

/***/ 86824:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.checkStrictMode = exports.getErrorPath = exports.Type = exports.useFunc = exports.setEvaluated = exports.evaluatedPropsToName = exports.mergeEvaluated = exports.eachItem = exports.unescapeJsonPointer = exports.escapeJsonPointer = exports.escapeFragment = exports.unescapeFragment = exports.schemaRefOrVal = exports.schemaHasRulesButRef = exports.schemaHasRules = exports.checkUnknownRules = exports.alwaysValidSchema = exports.toHash = void 0;
const codegen_1 = __webpack_require__(61089);
const code_1 = __webpack_require__(40345);
// TODO refactor to use Set
function toHash(arr) {
    const hash = {};
    for (const item of arr)
        hash[item] = true;
    return hash;
}
exports.toHash = toHash;
function alwaysValidSchema(it, schema) {
    if (typeof schema == "boolean")
        return schema;
    if (Object.keys(schema).length === 0)
        return true;
    checkUnknownRules(it, schema);
    return !schemaHasRules(schema, it.self.RULES.all);
}
exports.alwaysValidSchema = alwaysValidSchema;
function checkUnknownRules(it, schema = it.schema) {
    const { opts, self } = it;
    if (!opts.strictSchema)
        return;
    if (typeof schema === "boolean")
        return;
    const rules = self.RULES.keywords;
    for (const key in schema) {
        if (!rules[key])
            checkStrictMode(it, `unknown keyword: "${key}"`);
    }
}
exports.checkUnknownRules = checkUnknownRules;
function schemaHasRules(schema, rules) {
    if (typeof schema == "boolean")
        return !schema;
    for (const key in schema)
        if (rules[key])
            return true;
    return false;
}
exports.schemaHasRules = schemaHasRules;
function schemaHasRulesButRef(schema, RULES) {
    if (typeof schema == "boolean")
        return !schema;
    for (const key in schema)
        if (key !== "$ref" && RULES.all[key])
            return true;
    return false;
}
exports.schemaHasRulesButRef = schemaHasRulesButRef;
function schemaRefOrVal({ topSchemaRef, schemaPath }, schema, keyword, $data) {
    if (!$data) {
        if (typeof schema == "number" || typeof schema == "boolean")
            return schema;
        if (typeof schema == "string")
            return (0, codegen_1._) `${schema}`;
    }
    return (0, codegen_1._) `${topSchemaRef}${schemaPath}${(0, codegen_1.getProperty)(keyword)}`;
}
exports.schemaRefOrVal = schemaRefOrVal;
function unescapeFragment(str) {
    return unescapeJsonPointer(decodeURIComponent(str));
}
exports.unescapeFragment = unescapeFragment;
function escapeFragment(str) {
    return encodeURIComponent(escapeJsonPointer(str));
}
exports.escapeFragment = escapeFragment;
function escapeJsonPointer(str) {
    if (typeof str == "number")
        return `${str}`;
    return str.replace(/~/g, "~0").replace(/\//g, "~1");
}
exports.escapeJsonPointer = escapeJsonPointer;
function unescapeJsonPointer(str) {
    return str.replace(/~1/g, "/").replace(/~0/g, "~");
}
exports.unescapeJsonPointer = unescapeJsonPointer;
function eachItem(xs, f) {
    if (Array.isArray(xs)) {
        for (const x of xs)
            f(x);
    }
    else {
        f(xs);
    }
}
exports.eachItem = eachItem;
function makeMergeEvaluated({ mergeNames, mergeToName, mergeValues, resultToName, }) {
    return (gen, from, to, toName) => {
        const res = to === undefined
            ? from
            : to instanceof codegen_1.Name
                ? (from instanceof codegen_1.Name ? mergeNames(gen, from, to) : mergeToName(gen, from, to), to)
                : from instanceof codegen_1.Name
                    ? (mergeToName(gen, to, from), from)
                    : mergeValues(from, to);
        return toName === codegen_1.Name && !(res instanceof codegen_1.Name) ? resultToName(gen, res) : res;
    };
}
exports.mergeEvaluated = {
    props: makeMergeEvaluated({
        mergeNames: (gen, from, to) => gen.if((0, codegen_1._) `${to} !== true && ${from} !== undefined`, () => {
            gen.if((0, codegen_1._) `${from} === true`, () => gen.assign(to, true), () => gen.assign(to, (0, codegen_1._) `${to} || {}`).code((0, codegen_1._) `Object.assign(${to}, ${from})`));
        }),
        mergeToName: (gen, from, to) => gen.if((0, codegen_1._) `${to} !== true`, () => {
            if (from === true) {
                gen.assign(to, true);
            }
            else {
                gen.assign(to, (0, codegen_1._) `${to} || {}`);
                setEvaluated(gen, to, from);
            }
        }),
        mergeValues: (from, to) => (from === true ? true : { ...from, ...to }),
        resultToName: evaluatedPropsToName,
    }),
    items: makeMergeEvaluated({
        mergeNames: (gen, from, to) => gen.if((0, codegen_1._) `${to} !== true && ${from} !== undefined`, () => gen.assign(to, (0, codegen_1._) `${from} === true ? true : ${to} > ${from} ? ${to} : ${from}`)),
        mergeToName: (gen, from, to) => gen.if((0, codegen_1._) `${to} !== true`, () => gen.assign(to, from === true ? true : (0, codegen_1._) `${to} > ${from} ? ${to} : ${from}`)),
        mergeValues: (from, to) => (from === true ? true : Math.max(from, to)),
        resultToName: (gen, items) => gen.var("items", items),
    }),
};
function evaluatedPropsToName(gen, ps) {
    if (ps === true)
        return gen.var("props", true);
    const props = gen.var("props", (0, codegen_1._) `{}`);
    if (ps !== undefined)
        setEvaluated(gen, props, ps);
    return props;
}
exports.evaluatedPropsToName = evaluatedPropsToName;
function setEvaluated(gen, props, ps) {
    Object.keys(ps).forEach((p) => gen.assign((0, codegen_1._) `${props}${(0, codegen_1.getProperty)(p)}`, true));
}
exports.setEvaluated = setEvaluated;
const snippets = {};
function useFunc(gen, f) {
    return gen.scopeValue("func", {
        ref: f,
        code: snippets[f.code] || (snippets[f.code] = new code_1._Code(f.code)),
    });
}
exports.useFunc = useFunc;
var Type;
(function (Type) {
    Type[Type["Num"] = 0] = "Num";
    Type[Type["Str"] = 1] = "Str";
})(Type = exports.Type || (exports.Type = {}));
function getErrorPath(dataProp, dataPropType, jsPropertySyntax) {
    // let path
    if (dataProp instanceof codegen_1.Name) {
        const isNumber = dataPropType === Type.Num;
        return jsPropertySyntax
            ? isNumber
                ? (0, codegen_1._) `"[" + ${dataProp} + "]"`
                : (0, codegen_1._) `"['" + ${dataProp} + "']"`
            : isNumber
                ? (0, codegen_1._) `"/" + ${dataProp}`
                : (0, codegen_1._) `"/" + ${dataProp}.replace(/~/g, "~0").replace(/\\//g, "~1")`; // TODO maybe use global escapePointer
    }
    return jsPropertySyntax ? (0, codegen_1.getProperty)(dataProp).toString() : "/" + escapeJsonPointer(dataProp);
}
exports.getErrorPath = getErrorPath;
function checkStrictMode(it, msg, mode = it.opts.strictSchema) {
    if (!mode)
        return;
    msg = `strict mode: ${msg}`;
    if (mode === true)
        throw new Error(msg);
    it.self.logger.warn(msg);
}
exports.checkStrictMode = checkStrictMode;
//# sourceMappingURL=util.js.map

/***/ }),

/***/ 58039:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.shouldUseRule = exports.shouldUseGroup = exports.schemaHasRulesForType = void 0;
function schemaHasRulesForType({ schema, self }, type) {
    const group = self.RULES.types[type];
    return group && group !== true && shouldUseGroup(schema, group);
}
exports.schemaHasRulesForType = schemaHasRulesForType;
function shouldUseGroup(schema, group) {
    return group.rules.some((rule) => shouldUseRule(schema, rule));
}
exports.shouldUseGroup = shouldUseGroup;
function shouldUseRule(schema, rule) {
    var _a;
    return (schema[rule.keyword] !== undefined ||
        ((_a = rule.definition.implements) === null || _a === void 0 ? void 0 : _a.some((kwd) => schema[kwd] !== undefined)));
}
exports.shouldUseRule = shouldUseRule;
//# sourceMappingURL=applicability.js.map

/***/ }),

/***/ 34042:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.boolOrEmptySchema = exports.topBoolOrEmptySchema = void 0;
const errors_1 = __webpack_require__(2439);
const codegen_1 = __webpack_require__(61089);
const names_1 = __webpack_require__(16842);
const boolError = {
    message: "boolean schema is false",
};
function topBoolOrEmptySchema(it) {
    const { gen, schema, validateName } = it;
    if (schema === false) {
        falseSchemaError(it, false);
    }
    else if (typeof schema == "object" && schema.$async === true) {
        gen.return(names_1.default.data);
    }
    else {
        gen.assign((0, codegen_1._) `${validateName}.errors`, null);
        gen.return(true);
    }
}
exports.topBoolOrEmptySchema = topBoolOrEmptySchema;
function boolOrEmptySchema(it, valid) {
    const { gen, schema } = it;
    if (schema === false) {
        gen.var(valid, false); // TODO var
        falseSchemaError(it);
    }
    else {
        gen.var(valid, true); // TODO var
    }
}
exports.boolOrEmptySchema = boolOrEmptySchema;
function falseSchemaError(it, overrideAllErrors) {
    const { gen, data } = it;
    // TODO maybe some other interface should be used for non-keyword validation errors...
    const cxt = {
        gen,
        keyword: "false schema",
        data,
        schema: false,
        schemaCode: false,
        schemaValue: false,
        params: {},
        it,
    };
    (0, errors_1.reportError)(cxt, boolError, undefined, overrideAllErrors);
}
//# sourceMappingURL=boolSchema.js.map

/***/ }),

/***/ 50723:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.reportTypeError = exports.checkDataTypes = exports.checkDataType = exports.coerceAndCheckDataType = exports.getJSONTypes = exports.getSchemaTypes = exports.DataType = void 0;
const rules_1 = __webpack_require__(54964);
const applicability_1 = __webpack_require__(58039);
const errors_1 = __webpack_require__(2439);
const codegen_1 = __webpack_require__(61089);
const util_1 = __webpack_require__(86824);
var DataType;
(function (DataType) {
    DataType[DataType["Correct"] = 0] = "Correct";
    DataType[DataType["Wrong"] = 1] = "Wrong";
})(DataType = exports.DataType || (exports.DataType = {}));
function getSchemaTypes(schema) {
    const types = getJSONTypes(schema.type);
    const hasNull = types.includes("null");
    if (hasNull) {
        if (schema.nullable === false)
            throw new Error("type: null contradicts nullable: false");
    }
    else {
        if (!types.length && schema.nullable !== undefined) {
            throw new Error('"nullable" cannot be used without "type"');
        }
        if (schema.nullable === true)
            types.push("null");
    }
    return types;
}
exports.getSchemaTypes = getSchemaTypes;
function getJSONTypes(ts) {
    const types = Array.isArray(ts) ? ts : ts ? [ts] : [];
    if (types.every(rules_1.isJSONType))
        return types;
    throw new Error("type must be JSONType or JSONType[]: " + types.join(","));
}
exports.getJSONTypes = getJSONTypes;
function coerceAndCheckDataType(it, types) {
    const { gen, data, opts } = it;
    const coerceTo = coerceToTypes(types, opts.coerceTypes);
    const checkTypes = types.length > 0 &&
        !(coerceTo.length === 0 && types.length === 1 && (0, applicability_1.schemaHasRulesForType)(it, types[0]));
    if (checkTypes) {
        const wrongType = checkDataTypes(types, data, opts.strictNumbers, DataType.Wrong);
        gen.if(wrongType, () => {
            if (coerceTo.length)
                coerceData(it, types, coerceTo);
            else
                reportTypeError(it);
        });
    }
    return checkTypes;
}
exports.coerceAndCheckDataType = coerceAndCheckDataType;
const COERCIBLE = new Set(["string", "number", "integer", "boolean", "null"]);
function coerceToTypes(types, coerceTypes) {
    return coerceTypes
        ? types.filter((t) => COERCIBLE.has(t) || (coerceTypes === "array" && t === "array"))
        : [];
}
function coerceData(it, types, coerceTo) {
    const { gen, data, opts } = it;
    const dataType = gen.let("dataType", (0, codegen_1._) `typeof ${data}`);
    const coerced = gen.let("coerced", (0, codegen_1._) `undefined`);
    if (opts.coerceTypes === "array") {
        gen.if((0, codegen_1._) `${dataType} == 'object' && Array.isArray(${data}) && ${data}.length == 1`, () => gen
            .assign(data, (0, codegen_1._) `${data}[0]`)
            .assign(dataType, (0, codegen_1._) `typeof ${data}`)
            .if(checkDataTypes(types, data, opts.strictNumbers), () => gen.assign(coerced, data)));
    }
    gen.if((0, codegen_1._) `${coerced} !== undefined`);
    for (const t of coerceTo) {
        if (COERCIBLE.has(t) || (t === "array" && opts.coerceTypes === "array")) {
            coerceSpecificType(t);
        }
    }
    gen.else();
    reportTypeError(it);
    gen.endIf();
    gen.if((0, codegen_1._) `${coerced} !== undefined`, () => {
        gen.assign(data, coerced);
        assignParentData(it, coerced);
    });
    function coerceSpecificType(t) {
        switch (t) {
            case "string":
                gen
                    .elseIf((0, codegen_1._) `${dataType} == "number" || ${dataType} == "boolean"`)
                    .assign(coerced, (0, codegen_1._) `"" + ${data}`)
                    .elseIf((0, codegen_1._) `${data} === null`)
                    .assign(coerced, (0, codegen_1._) `""`);
                return;
            case "number":
                gen
                    .elseIf((0, codegen_1._) `${dataType} == "boolean" || ${data} === null
              || (${dataType} == "string" && ${data} && ${data} == +${data})`)
                    .assign(coerced, (0, codegen_1._) `+${data}`);
                return;
            case "integer":
                gen
                    .elseIf((0, codegen_1._) `${dataType} === "boolean" || ${data} === null
              || (${dataType} === "string" && ${data} && ${data} == +${data} && !(${data} % 1))`)
                    .assign(coerced, (0, codegen_1._) `+${data}`);
                return;
            case "boolean":
                gen
                    .elseIf((0, codegen_1._) `${data} === "false" || ${data} === 0 || ${data} === null`)
                    .assign(coerced, false)
                    .elseIf((0, codegen_1._) `${data} === "true" || ${data} === 1`)
                    .assign(coerced, true);
                return;
            case "null":
                gen.elseIf((0, codegen_1._) `${data} === "" || ${data} === 0 || ${data} === false`);
                gen.assign(coerced, null);
                return;
            case "array":
                gen
                    .elseIf((0, codegen_1._) `${dataType} === "string" || ${dataType} === "number"
              || ${dataType} === "boolean" || ${data} === null`)
                    .assign(coerced, (0, codegen_1._) `[${data}]`);
        }
    }
}
function assignParentData({ gen, parentData, parentDataProperty }, expr) {
    // TODO use gen.property
    gen.if((0, codegen_1._) `${parentData} !== undefined`, () => gen.assign((0, codegen_1._) `${parentData}[${parentDataProperty}]`, expr));
}
function checkDataType(dataType, data, strictNums, correct = DataType.Correct) {
    const EQ = correct === DataType.Correct ? codegen_1.operators.EQ : codegen_1.operators.NEQ;
    let cond;
    switch (dataType) {
        case "null":
            return (0, codegen_1._) `${data} ${EQ} null`;
        case "array":
            cond = (0, codegen_1._) `Array.isArray(${data})`;
            break;
        case "object":
            cond = (0, codegen_1._) `${data} && typeof ${data} == "object" && !Array.isArray(${data})`;
            break;
        case "integer":
            cond = numCond((0, codegen_1._) `!(${data} % 1) && !isNaN(${data})`);
            break;
        case "number":
            cond = numCond();
            break;
        default:
            return (0, codegen_1._) `typeof ${data} ${EQ} ${dataType}`;
    }
    return correct === DataType.Correct ? cond : (0, codegen_1.not)(cond);
    function numCond(_cond = codegen_1.nil) {
        return (0, codegen_1.and)((0, codegen_1._) `typeof ${data} == "number"`, _cond, strictNums ? (0, codegen_1._) `isFinite(${data})` : codegen_1.nil);
    }
}
exports.checkDataType = checkDataType;
function checkDataTypes(dataTypes, data, strictNums, correct) {
    if (dataTypes.length === 1) {
        return checkDataType(dataTypes[0], data, strictNums, correct);
    }
    let cond;
    const types = (0, util_1.toHash)(dataTypes);
    if (types.array && types.object) {
        const notObj = (0, codegen_1._) `typeof ${data} != "object"`;
        cond = types.null ? notObj : (0, codegen_1._) `!${data} || ${notObj}`;
        delete types.null;
        delete types.array;
        delete types.object;
    }
    else {
        cond = codegen_1.nil;
    }
    if (types.number)
        delete types.integer;
    for (const t in types)
        cond = (0, codegen_1.and)(cond, checkDataType(t, data, strictNums, correct));
    return cond;
}
exports.checkDataTypes = checkDataTypes;
const typeError = {
    message: ({ schema }) => `must be ${schema}`,
    params: ({ schema, schemaValue }) => typeof schema == "string" ? (0, codegen_1._) `{type: ${schema}}` : (0, codegen_1._) `{type: ${schemaValue}}`,
};
function reportTypeError(it) {
    const cxt = getTypeErrorContext(it);
    (0, errors_1.reportError)(cxt, typeError);
}
exports.reportTypeError = reportTypeError;
function getTypeErrorContext(it) {
    const { gen, data, schema } = it;
    const schemaCode = (0, util_1.schemaRefOrVal)(it, schema, "type");
    return {
        gen,
        keyword: "type",
        data,
        schema: schema.type,
        schemaCode,
        schemaValue: schemaCode,
        parentSchema: schema,
        params: {},
        it,
    };
}
//# sourceMappingURL=dataType.js.map

/***/ }),

/***/ 87820:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.assignDefaults = void 0;
const codegen_1 = __webpack_require__(61089);
const util_1 = __webpack_require__(86824);
function assignDefaults(it, ty) {
    const { properties, items } = it.schema;
    if (ty === "object" && properties) {
        for (const key in properties) {
            assignDefault(it, key, properties[key].default);
        }
    }
    else if (ty === "array" && Array.isArray(items)) {
        items.forEach((sch, i) => assignDefault(it, i, sch.default));
    }
}
exports.assignDefaults = assignDefaults;
function assignDefault(it, prop, defaultValue) {
    const { gen, compositeRule, data, opts } = it;
    if (defaultValue === undefined)
        return;
    const childData = (0, codegen_1._) `${data}${(0, codegen_1.getProperty)(prop)}`;
    if (compositeRule) {
        (0, util_1.checkStrictMode)(it, `default is ignored for: ${childData}`);
        return;
    }
    let condition = (0, codegen_1._) `${childData} === undefined`;
    if (opts.useDefaults === "empty") {
        condition = (0, codegen_1._) `${condition} || ${childData} === null || ${childData} === ""`;
    }
    // `${childData} === undefined` +
    // (opts.useDefaults === "empty" ? ` || ${childData} === null || ${childData} === ""` : "")
    gen.if(condition, (0, codegen_1._) `${childData} = ${(0, codegen_1.stringify)(defaultValue)}`);
}
//# sourceMappingURL=defaults.js.map

/***/ }),

/***/ 24587:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getData = exports.KeywordCxt = exports.validateFunctionCode = void 0;
const boolSchema_1 = __webpack_require__(34042);
const dataType_1 = __webpack_require__(50723);
const applicability_1 = __webpack_require__(58039);
const dataType_2 = __webpack_require__(50723);
const defaults_1 = __webpack_require__(87820);
const keyword_1 = __webpack_require__(63702);
const subschema_1 = __webpack_require__(99206);
const codegen_1 = __webpack_require__(61089);
const names_1 = __webpack_require__(16842);
const resolve_1 = __webpack_require__(17325);
const util_1 = __webpack_require__(86824);
const errors_1 = __webpack_require__(2439);
// schema compilation - generates validation function, subschemaCode (below) is used for subschemas
function validateFunctionCode(it) {
    if (isSchemaObj(it)) {
        checkKeywords(it);
        if (schemaCxtHasRules(it)) {
            topSchemaObjCode(it);
            return;
        }
    }
    validateFunction(it, () => (0, boolSchema_1.topBoolOrEmptySchema)(it));
}
exports.validateFunctionCode = validateFunctionCode;
function validateFunction({ gen, validateName, schema, schemaEnv, opts }, body) {
    if (opts.code.es5) {
        gen.func(validateName, (0, codegen_1._) `${names_1.default.data}, ${names_1.default.valCxt}`, schemaEnv.$async, () => {
            gen.code((0, codegen_1._) `"use strict"; ${funcSourceUrl(schema, opts)}`);
            destructureValCxtES5(gen, opts);
            gen.code(body);
        });
    }
    else {
        gen.func(validateName, (0, codegen_1._) `${names_1.default.data}, ${destructureValCxt(opts)}`, schemaEnv.$async, () => gen.code(funcSourceUrl(schema, opts)).code(body));
    }
}
function destructureValCxt(opts) {
    return (0, codegen_1._) `{${names_1.default.instancePath}="", ${names_1.default.parentData}, ${names_1.default.parentDataProperty}, ${names_1.default.rootData}=${names_1.default.data}${opts.dynamicRef ? (0, codegen_1._) `, ${names_1.default.dynamicAnchors}={}` : codegen_1.nil}}={}`;
}
function destructureValCxtES5(gen, opts) {
    gen.if(names_1.default.valCxt, () => {
        gen.var(names_1.default.instancePath, (0, codegen_1._) `${names_1.default.valCxt}.${names_1.default.instancePath}`);
        gen.var(names_1.default.parentData, (0, codegen_1._) `${names_1.default.valCxt}.${names_1.default.parentData}`);
        gen.var(names_1.default.parentDataProperty, (0, codegen_1._) `${names_1.default.valCxt}.${names_1.default.parentDataProperty}`);
        gen.var(names_1.default.rootData, (0, codegen_1._) `${names_1.default.valCxt}.${names_1.default.rootData}`);
        if (opts.dynamicRef)
            gen.var(names_1.default.dynamicAnchors, (0, codegen_1._) `${names_1.default.valCxt}.${names_1.default.dynamicAnchors}`);
    }, () => {
        gen.var(names_1.default.instancePath, (0, codegen_1._) `""`);
        gen.var(names_1.default.parentData, (0, codegen_1._) `undefined`);
        gen.var(names_1.default.parentDataProperty, (0, codegen_1._) `undefined`);
        gen.var(names_1.default.rootData, names_1.default.data);
        if (opts.dynamicRef)
            gen.var(names_1.default.dynamicAnchors, (0, codegen_1._) `{}`);
    });
}
function topSchemaObjCode(it) {
    const { schema, opts, gen } = it;
    validateFunction(it, () => {
        if (opts.$comment && schema.$comment)
            commentKeyword(it);
        checkNoDefault(it);
        gen.let(names_1.default.vErrors, null);
        gen.let(names_1.default.errors, 0);
        if (opts.unevaluated)
            resetEvaluated(it);
        typeAndKeywords(it);
        returnResults(it);
    });
    return;
}
function resetEvaluated(it) {
    // TODO maybe some hook to execute it in the end to check whether props/items are Name, as in assignEvaluated
    const { gen, validateName } = it;
    it.evaluated = gen.const("evaluated", (0, codegen_1._) `${validateName}.evaluated`);
    gen.if((0, codegen_1._) `${it.evaluated}.dynamicProps`, () => gen.assign((0, codegen_1._) `${it.evaluated}.props`, (0, codegen_1._) `undefined`));
    gen.if((0, codegen_1._) `${it.evaluated}.dynamicItems`, () => gen.assign((0, codegen_1._) `${it.evaluated}.items`, (0, codegen_1._) `undefined`));
}
function funcSourceUrl(schema, opts) {
    const schId = typeof schema == "object" && schema[opts.schemaId];
    return schId && (opts.code.source || opts.code.process) ? (0, codegen_1._) `/*# sourceURL=${schId} */` : codegen_1.nil;
}
// schema compilation - this function is used recursively to generate code for sub-schemas
function subschemaCode(it, valid) {
    if (isSchemaObj(it)) {
        checkKeywords(it);
        if (schemaCxtHasRules(it)) {
            subSchemaObjCode(it, valid);
            return;
        }
    }
    (0, boolSchema_1.boolOrEmptySchema)(it, valid);
}
function schemaCxtHasRules({ schema, self }) {
    if (typeof schema == "boolean")
        return !schema;
    for (const key in schema)
        if (self.RULES.all[key])
            return true;
    return false;
}
function isSchemaObj(it) {
    return typeof it.schema != "boolean";
}
function subSchemaObjCode(it, valid) {
    const { schema, gen, opts } = it;
    if (opts.$comment && schema.$comment)
        commentKeyword(it);
    updateContext(it);
    checkAsyncSchema(it);
    const errsCount = gen.const("_errs", names_1.default.errors);
    typeAndKeywords(it, errsCount);
    // TODO var
    gen.var(valid, (0, codegen_1._) `${errsCount} === ${names_1.default.errors}`);
}
function checkKeywords(it) {
    (0, util_1.checkUnknownRules)(it);
    checkRefsAndKeywords(it);
}
function typeAndKeywords(it, errsCount) {
    if (it.opts.jtd)
        return schemaKeywords(it, [], false, errsCount);
    const types = (0, dataType_1.getSchemaTypes)(it.schema);
    const checkedTypes = (0, dataType_1.coerceAndCheckDataType)(it, types);
    schemaKeywords(it, types, !checkedTypes, errsCount);
}
function checkRefsAndKeywords(it) {
    const { schema, errSchemaPath, opts, self } = it;
    if (schema.$ref && opts.ignoreKeywordsWithRef && (0, util_1.schemaHasRulesButRef)(schema, self.RULES)) {
        self.logger.warn(`$ref: keywords ignored in schema at path "${errSchemaPath}"`);
    }
}
function checkNoDefault(it) {
    const { schema, opts } = it;
    if (schema.default !== undefined && opts.useDefaults && opts.strictSchema) {
        (0, util_1.checkStrictMode)(it, "default is ignored in the schema root");
    }
}
function updateContext(it) {
    const schId = it.schema[it.opts.schemaId];
    if (schId)
        it.baseId = (0, resolve_1.resolveUrl)(it.opts.uriResolver, it.baseId, schId);
}
function checkAsyncSchema(it) {
    if (it.schema.$async && !it.schemaEnv.$async)
        throw new Error("async schema in sync schema");
}
function commentKeyword({ gen, schemaEnv, schema, errSchemaPath, opts }) {
    const msg = schema.$comment;
    if (opts.$comment === true) {
        gen.code((0, codegen_1._) `${names_1.default.self}.logger.log(${msg})`);
    }
    else if (typeof opts.$comment == "function") {
        const schemaPath = (0, codegen_1.str) `${errSchemaPath}/$comment`;
        const rootName = gen.scopeValue("root", { ref: schemaEnv.root });
        gen.code((0, codegen_1._) `${names_1.default.self}.opts.$comment(${msg}, ${schemaPath}, ${rootName}.schema)`);
    }
}
function returnResults(it) {
    const { gen, schemaEnv, validateName, ValidationError, opts } = it;
    if (schemaEnv.$async) {
        // TODO assign unevaluated
        gen.if((0, codegen_1._) `${names_1.default.errors} === 0`, () => gen.return(names_1.default.data), () => gen.throw((0, codegen_1._) `new ${ValidationError}(${names_1.default.vErrors})`));
    }
    else {
        gen.assign((0, codegen_1._) `${validateName}.errors`, names_1.default.vErrors);
        if (opts.unevaluated)
            assignEvaluated(it);
        gen.return((0, codegen_1._) `${names_1.default.errors} === 0`);
    }
}
function assignEvaluated({ gen, evaluated, props, items }) {
    if (props instanceof codegen_1.Name)
        gen.assign((0, codegen_1._) `${evaluated}.props`, props);
    if (items instanceof codegen_1.Name)
        gen.assign((0, codegen_1._) `${evaluated}.items`, items);
}
function schemaKeywords(it, types, typeErrors, errsCount) {
    const { gen, schema, data, allErrors, opts, self } = it;
    const { RULES } = self;
    if (schema.$ref && (opts.ignoreKeywordsWithRef || !(0, util_1.schemaHasRulesButRef)(schema, RULES))) {
        gen.block(() => keywordCode(it, "$ref", RULES.all.$ref.definition)); // TODO typecast
        return;
    }
    if (!opts.jtd)
        checkStrictTypes(it, types);
    gen.block(() => {
        for (const group of RULES.rules)
            groupKeywords(group);
        groupKeywords(RULES.post);
    });
    function groupKeywords(group) {
        if (!(0, applicability_1.shouldUseGroup)(schema, group))
            return;
        if (group.type) {
            gen.if((0, dataType_2.checkDataType)(group.type, data, opts.strictNumbers));
            iterateKeywords(it, group);
            if (types.length === 1 && types[0] === group.type && typeErrors) {
                gen.else();
                (0, dataType_2.reportTypeError)(it);
            }
            gen.endIf();
        }
        else {
            iterateKeywords(it, group);
        }
        // TODO make it "ok" call?
        if (!allErrors)
            gen.if((0, codegen_1._) `${names_1.default.errors} === ${errsCount || 0}`);
    }
}
function iterateKeywords(it, group) {
    const { gen, schema, opts: { useDefaults }, } = it;
    if (useDefaults)
        (0, defaults_1.assignDefaults)(it, group.type);
    gen.block(() => {
        for (const rule of group.rules) {
            if ((0, applicability_1.shouldUseRule)(schema, rule)) {
                keywordCode(it, rule.keyword, rule.definition, group.type);
            }
        }
    });
}
function checkStrictTypes(it, types) {
    if (it.schemaEnv.meta || !it.opts.strictTypes)
        return;
    checkContextTypes(it, types);
    if (!it.opts.allowUnionTypes)
        checkMultipleTypes(it, types);
    checkKeywordTypes(it, it.dataTypes);
}
function checkContextTypes(it, types) {
    if (!types.length)
        return;
    if (!it.dataTypes.length) {
        it.dataTypes = types;
        return;
    }
    types.forEach((t) => {
        if (!includesType(it.dataTypes, t)) {
            strictTypesError(it, `type "${t}" not allowed by context "${it.dataTypes.join(",")}"`);
        }
    });
    narrowSchemaTypes(it, types);
}
function checkMultipleTypes(it, ts) {
    if (ts.length > 1 && !(ts.length === 2 && ts.includes("null"))) {
        strictTypesError(it, "use allowUnionTypes to allow union type keyword");
    }
}
function checkKeywordTypes(it, ts) {
    const rules = it.self.RULES.all;
    for (const keyword in rules) {
        const rule = rules[keyword];
        if (typeof rule == "object" && (0, applicability_1.shouldUseRule)(it.schema, rule)) {
            const { type } = rule.definition;
            if (type.length && !type.some((t) => hasApplicableType(ts, t))) {
                strictTypesError(it, `missing type "${type.join(",")}" for keyword "${keyword}"`);
            }
        }
    }
}
function hasApplicableType(schTs, kwdT) {
    return schTs.includes(kwdT) || (kwdT === "number" && schTs.includes("integer"));
}
function includesType(ts, t) {
    return ts.includes(t) || (t === "integer" && ts.includes("number"));
}
function narrowSchemaTypes(it, withTypes) {
    const ts = [];
    for (const t of it.dataTypes) {
        if (includesType(withTypes, t))
            ts.push(t);
        else if (withTypes.includes("integer") && t === "number")
            ts.push("integer");
    }
    it.dataTypes = ts;
}
function strictTypesError(it, msg) {
    const schemaPath = it.schemaEnv.baseId + it.errSchemaPath;
    msg += ` at "${schemaPath}" (strictTypes)`;
    (0, util_1.checkStrictMode)(it, msg, it.opts.strictTypes);
}
class KeywordCxt {
    constructor(it, def, keyword) {
        (0, keyword_1.validateKeywordUsage)(it, def, keyword);
        this.gen = it.gen;
        this.allErrors = it.allErrors;
        this.keyword = keyword;
        this.data = it.data;
        this.schema = it.schema[keyword];
        this.$data = def.$data && it.opts.$data && this.schema && this.schema.$data;
        this.schemaValue = (0, util_1.schemaRefOrVal)(it, this.schema, keyword, this.$data);
        this.schemaType = def.schemaType;
        this.parentSchema = it.schema;
        this.params = {};
        this.it = it;
        this.def = def;
        if (this.$data) {
            this.schemaCode = it.gen.const("vSchema", getData(this.$data, it));
        }
        else {
            this.schemaCode = this.schemaValue;
            if (!(0, keyword_1.validSchemaType)(this.schema, def.schemaType, def.allowUndefined)) {
                throw new Error(`${keyword} value must be ${JSON.stringify(def.schemaType)}`);
            }
        }
        if ("code" in def ? def.trackErrors : def.errors !== false) {
            this.errsCount = it.gen.const("_errs", names_1.default.errors);
        }
    }
    result(condition, successAction, failAction) {
        this.failResult((0, codegen_1.not)(condition), successAction, failAction);
    }
    failResult(condition, successAction, failAction) {
        this.gen.if(condition);
        if (failAction)
            failAction();
        else
            this.error();
        if (successAction) {
            this.gen.else();
            successAction();
            if (this.allErrors)
                this.gen.endIf();
        }
        else {
            if (this.allErrors)
                this.gen.endIf();
            else
                this.gen.else();
        }
    }
    pass(condition, failAction) {
        this.failResult((0, codegen_1.not)(condition), undefined, failAction);
    }
    fail(condition) {
        if (condition === undefined) {
            this.error();
            if (!this.allErrors)
                this.gen.if(false); // this branch will be removed by gen.optimize
            return;
        }
        this.gen.if(condition);
        this.error();
        if (this.allErrors)
            this.gen.endIf();
        else
            this.gen.else();
    }
    fail$data(condition) {
        if (!this.$data)
            return this.fail(condition);
        const { schemaCode } = this;
        this.fail((0, codegen_1._) `${schemaCode} !== undefined && (${(0, codegen_1.or)(this.invalid$data(), condition)})`);
    }
    error(append, errorParams, errorPaths) {
        if (errorParams) {
            this.setParams(errorParams);
            this._error(append, errorPaths);
            this.setParams({});
            return;
        }
        this._error(append, errorPaths);
    }
    _error(append, errorPaths) {
        ;
        (append ? errors_1.reportExtraError : errors_1.reportError)(this, this.def.error, errorPaths);
    }
    $dataError() {
        (0, errors_1.reportError)(this, this.def.$dataError || errors_1.keyword$DataError);
    }
    reset() {
        if (this.errsCount === undefined)
            throw new Error('add "trackErrors" to keyword definition');
        (0, errors_1.resetErrorsCount)(this.gen, this.errsCount);
    }
    ok(cond) {
        if (!this.allErrors)
            this.gen.if(cond);
    }
    setParams(obj, assign) {
        if (assign)
            Object.assign(this.params, obj);
        else
            this.params = obj;
    }
    block$data(valid, codeBlock, $dataValid = codegen_1.nil) {
        this.gen.block(() => {
            this.check$data(valid, $dataValid);
            codeBlock();
        });
    }
    check$data(valid = codegen_1.nil, $dataValid = codegen_1.nil) {
        if (!this.$data)
            return;
        const { gen, schemaCode, schemaType, def } = this;
        gen.if((0, codegen_1.or)((0, codegen_1._) `${schemaCode} === undefined`, $dataValid));
        if (valid !== codegen_1.nil)
            gen.assign(valid, true);
        if (schemaType.length || def.validateSchema) {
            gen.elseIf(this.invalid$data());
            this.$dataError();
            if (valid !== codegen_1.nil)
                gen.assign(valid, false);
        }
        gen.else();
    }
    invalid$data() {
        const { gen, schemaCode, schemaType, def, it } = this;
        return (0, codegen_1.or)(wrong$DataType(), invalid$DataSchema());
        function wrong$DataType() {
            if (schemaType.length) {
                /* istanbul ignore if */
                if (!(schemaCode instanceof codegen_1.Name))
                    throw new Error("ajv implementation error");
                const st = Array.isArray(schemaType) ? schemaType : [schemaType];
                return (0, codegen_1._) `${(0, dataType_2.checkDataTypes)(st, schemaCode, it.opts.strictNumbers, dataType_2.DataType.Wrong)}`;
            }
            return codegen_1.nil;
        }
        function invalid$DataSchema() {
            if (def.validateSchema) {
                const validateSchemaRef = gen.scopeValue("validate$data", { ref: def.validateSchema }); // TODO value.code for standalone
                return (0, codegen_1._) `!${validateSchemaRef}(${schemaCode})`;
            }
            return codegen_1.nil;
        }
    }
    subschema(appl, valid) {
        const subschema = (0, subschema_1.getSubschema)(this.it, appl);
        (0, subschema_1.extendSubschemaData)(subschema, this.it, appl);
        (0, subschema_1.extendSubschemaMode)(subschema, appl);
        const nextContext = { ...this.it, ...subschema, items: undefined, props: undefined };
        subschemaCode(nextContext, valid);
        return nextContext;
    }
    mergeEvaluated(schemaCxt, toName) {
        const { it, gen } = this;
        if (!it.opts.unevaluated)
            return;
        if (it.props !== true && schemaCxt.props !== undefined) {
            it.props = util_1.mergeEvaluated.props(gen, schemaCxt.props, it.props, toName);
        }
        if (it.items !== true && schemaCxt.items !== undefined) {
            it.items = util_1.mergeEvaluated.items(gen, schemaCxt.items, it.items, toName);
        }
    }
    mergeValidEvaluated(schemaCxt, valid) {
        const { it, gen } = this;
        if (it.opts.unevaluated && (it.props !== true || it.items !== true)) {
            gen.if(valid, () => this.mergeEvaluated(schemaCxt, codegen_1.Name));
            return true;
        }
    }
}
exports.KeywordCxt = KeywordCxt;
function keywordCode(it, keyword, def, ruleType) {
    const cxt = new KeywordCxt(it, def, keyword);
    if ("code" in def) {
        def.code(cxt, ruleType);
    }
    else if (cxt.$data && def.validate) {
        (0, keyword_1.funcKeywordCode)(cxt, def);
    }
    else if ("macro" in def) {
        (0, keyword_1.macroKeywordCode)(cxt, def);
    }
    else if (def.compile || def.validate) {
        (0, keyword_1.funcKeywordCode)(cxt, def);
    }
}
const JSON_POINTER = /^\/(?:[^~]|~0|~1)*$/;
const RELATIVE_JSON_POINTER = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
function getData($data, { dataLevel, dataNames, dataPathArr }) {
    let jsonPointer;
    let data;
    if ($data === "")
        return names_1.default.rootData;
    if ($data[0] === "/") {
        if (!JSON_POINTER.test($data))
            throw new Error(`Invalid JSON-pointer: ${$data}`);
        jsonPointer = $data;
        data = names_1.default.rootData;
    }
    else {
        const matches = RELATIVE_JSON_POINTER.exec($data);
        if (!matches)
            throw new Error(`Invalid JSON-pointer: ${$data}`);
        const up = +matches[1];
        jsonPointer = matches[2];
        if (jsonPointer === "#") {
            if (up >= dataLevel)
                throw new Error(errorMsg("property/index", up));
            return dataPathArr[dataLevel - up];
        }
        if (up > dataLevel)
            throw new Error(errorMsg("data", up));
        data = dataNames[dataLevel - up];
        if (!jsonPointer)
            return data;
    }
    let expr = data;
    const segments = jsonPointer.split("/");
    for (const segment of segments) {
        if (segment) {
            data = (0, codegen_1._) `${data}${(0, codegen_1.getProperty)((0, util_1.unescapeJsonPointer)(segment))}`;
            expr = (0, codegen_1._) `${expr} && ${data}`;
        }
    }
    return expr;
    function errorMsg(pointerType, up) {
        return `Cannot access ${pointerType} ${up} levels up, current level is ${dataLevel}`;
    }
}
exports.getData = getData;
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 63702:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.validateKeywordUsage = exports.validSchemaType = exports.funcKeywordCode = exports.macroKeywordCode = void 0;
const codegen_1 = __webpack_require__(61089);
const names_1 = __webpack_require__(16842);
const code_1 = __webpack_require__(68185);
const errors_1 = __webpack_require__(2439);
function macroKeywordCode(cxt, def) {
    const { gen, keyword, schema, parentSchema, it } = cxt;
    const macroSchema = def.macro.call(it.self, schema, parentSchema, it);
    const schemaRef = useKeyword(gen, keyword, macroSchema);
    if (it.opts.validateSchema !== false)
        it.self.validateSchema(macroSchema, true);
    const valid = gen.name("valid");
    cxt.subschema({
        schema: macroSchema,
        schemaPath: codegen_1.nil,
        errSchemaPath: `${it.errSchemaPath}/${keyword}`,
        topSchemaRef: schemaRef,
        compositeRule: true,
    }, valid);
    cxt.pass(valid, () => cxt.error(true));
}
exports.macroKeywordCode = macroKeywordCode;
function funcKeywordCode(cxt, def) {
    var _a;
    const { gen, keyword, schema, parentSchema, $data, it } = cxt;
    checkAsyncKeyword(it, def);
    const validate = !$data && def.compile ? def.compile.call(it.self, schema, parentSchema, it) : def.validate;
    const validateRef = useKeyword(gen, keyword, validate);
    const valid = gen.let("valid");
    cxt.block$data(valid, validateKeyword);
    cxt.ok((_a = def.valid) !== null && _a !== void 0 ? _a : valid);
    function validateKeyword() {
        if (def.errors === false) {
            assignValid();
            if (def.modifying)
                modifyData(cxt);
            reportErrs(() => cxt.error());
        }
        else {
            const ruleErrs = def.async ? validateAsync() : validateSync();
            if (def.modifying)
                modifyData(cxt);
            reportErrs(() => addErrs(cxt, ruleErrs));
        }
    }
    function validateAsync() {
        const ruleErrs = gen.let("ruleErrs", null);
        gen.try(() => assignValid((0, codegen_1._) `await `), (e) => gen.assign(valid, false).if((0, codegen_1._) `${e} instanceof ${it.ValidationError}`, () => gen.assign(ruleErrs, (0, codegen_1._) `${e}.errors`), () => gen.throw(e)));
        return ruleErrs;
    }
    function validateSync() {
        const validateErrs = (0, codegen_1._) `${validateRef}.errors`;
        gen.assign(validateErrs, null);
        assignValid(codegen_1.nil);
        return validateErrs;
    }
    function assignValid(_await = def.async ? (0, codegen_1._) `await ` : codegen_1.nil) {
        const passCxt = it.opts.passContext ? names_1.default.this : names_1.default.self;
        const passSchema = !(("compile" in def && !$data) || def.schema === false);
        gen.assign(valid, (0, codegen_1._) `${_await}${(0, code_1.callValidateCode)(cxt, validateRef, passCxt, passSchema)}`, def.modifying);
    }
    function reportErrs(errors) {
        var _a;
        gen.if((0, codegen_1.not)((_a = def.valid) !== null && _a !== void 0 ? _a : valid), errors);
    }
}
exports.funcKeywordCode = funcKeywordCode;
function modifyData(cxt) {
    const { gen, data, it } = cxt;
    gen.if(it.parentData, () => gen.assign(data, (0, codegen_1._) `${it.parentData}[${it.parentDataProperty}]`));
}
function addErrs(cxt, errs) {
    const { gen } = cxt;
    gen.if((0, codegen_1._) `Array.isArray(${errs})`, () => {
        gen
            .assign(names_1.default.vErrors, (0, codegen_1._) `${names_1.default.vErrors} === null ? ${errs} : ${names_1.default.vErrors}.concat(${errs})`)
            .assign(names_1.default.errors, (0, codegen_1._) `${names_1.default.vErrors}.length`);
        (0, errors_1.extendErrors)(cxt);
    }, () => cxt.error());
}
function checkAsyncKeyword({ schemaEnv }, def) {
    if (def.async && !schemaEnv.$async)
        throw new Error("async keyword in sync schema");
}
function useKeyword(gen, keyword, result) {
    if (result === undefined)
        throw new Error(`keyword "${keyword}" failed to compile`);
    return gen.scopeValue("keyword", typeof result == "function" ? { ref: result } : { ref: result, code: (0, codegen_1.stringify)(result) });
}
function validSchemaType(schema, schemaType, allowUndefined = false) {
    // TODO add tests
    return (!schemaType.length ||
        schemaType.some((st) => st === "array"
            ? Array.isArray(schema)
            : st === "object"
                ? schema && typeof schema == "object" && !Array.isArray(schema)
                : typeof schema == st || (allowUndefined && typeof schema == "undefined")));
}
exports.validSchemaType = validSchemaType;
function validateKeywordUsage({ schema, opts, self, errSchemaPath }, def, keyword) {
    /* istanbul ignore if */
    if (Array.isArray(def.keyword) ? !def.keyword.includes(keyword) : def.keyword !== keyword) {
        throw new Error("ajv implementation error");
    }
    const deps = def.dependencies;
    if (deps === null || deps === void 0 ? void 0 : deps.some((kwd) => !Object.prototype.hasOwnProperty.call(schema, kwd))) {
        throw new Error(`parent schema must have dependencies of ${keyword}: ${deps.join(",")}`);
    }
    if (def.validateSchema) {
        const valid = def.validateSchema(schema[keyword]);
        if (!valid) {
            const msg = `keyword "${keyword}" value is invalid at path "${errSchemaPath}": ` +
                self.errorsText(def.validateSchema.errors);
            if (opts.validateSchema === "log")
                self.logger.error(msg);
            else
                throw new Error(msg);
        }
    }
}
exports.validateKeywordUsage = validateKeywordUsage;
//# sourceMappingURL=keyword.js.map

/***/ }),

/***/ 99206:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.extendSubschemaMode = exports.extendSubschemaData = exports.getSubschema = void 0;
const codegen_1 = __webpack_require__(61089);
const util_1 = __webpack_require__(86824);
function getSubschema(it, { keyword, schemaProp, schema, schemaPath, errSchemaPath, topSchemaRef }) {
    if (keyword !== undefined && schema !== undefined) {
        throw new Error('both "keyword" and "schema" passed, only one allowed');
    }
    if (keyword !== undefined) {
        const sch = it.schema[keyword];
        return schemaProp === undefined
            ? {
                schema: sch,
                schemaPath: (0, codegen_1._) `${it.schemaPath}${(0, codegen_1.getProperty)(keyword)}`,
                errSchemaPath: `${it.errSchemaPath}/${keyword}`,
            }
            : {
                schema: sch[schemaProp],
                schemaPath: (0, codegen_1._) `${it.schemaPath}${(0, codegen_1.getProperty)(keyword)}${(0, codegen_1.getProperty)(schemaProp)}`,
                errSchemaPath: `${it.errSchemaPath}/${keyword}/${(0, util_1.escapeFragment)(schemaProp)}`,
            };
    }
    if (schema !== undefined) {
        if (schemaPath === undefined || errSchemaPath === undefined || topSchemaRef === undefined) {
            throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
        }
        return {
            schema,
            schemaPath,
            topSchemaRef,
            errSchemaPath,
        };
    }
    throw new Error('either "keyword" or "schema" must be passed');
}
exports.getSubschema = getSubschema;
function extendSubschemaData(subschema, it, { dataProp, dataPropType: dpType, data, dataTypes, propertyName }) {
    if (data !== undefined && dataProp !== undefined) {
        throw new Error('both "data" and "dataProp" passed, only one allowed');
    }
    const { gen } = it;
    if (dataProp !== undefined) {
        const { errorPath, dataPathArr, opts } = it;
        const nextData = gen.let("data", (0, codegen_1._) `${it.data}${(0, codegen_1.getProperty)(dataProp)}`, true);
        dataContextProps(nextData);
        subschema.errorPath = (0, codegen_1.str) `${errorPath}${(0, util_1.getErrorPath)(dataProp, dpType, opts.jsPropertySyntax)}`;
        subschema.parentDataProperty = (0, codegen_1._) `${dataProp}`;
        subschema.dataPathArr = [...dataPathArr, subschema.parentDataProperty];
    }
    if (data !== undefined) {
        const nextData = data instanceof codegen_1.Name ? data : gen.let("data", data, true); // replaceable if used once?
        dataContextProps(nextData);
        if (propertyName !== undefined)
            subschema.propertyName = propertyName;
        // TODO something is possibly wrong here with not changing parentDataProperty and not appending dataPathArr
    }
    if (dataTypes)
        subschema.dataTypes = dataTypes;
    function dataContextProps(_nextData) {
        subschema.data = _nextData;
        subschema.dataLevel = it.dataLevel + 1;
        subschema.dataTypes = [];
        it.definedProperties = new Set();
        subschema.parentData = it.data;
        subschema.dataNames = [...it.dataNames, _nextData];
    }
}
exports.extendSubschemaData = extendSubschemaData;
function extendSubschemaMode(subschema, { jtdDiscriminator, jtdMetadata, compositeRule, createErrors, allErrors }) {
    if (compositeRule !== undefined)
        subschema.compositeRule = compositeRule;
    if (createErrors !== undefined)
        subschema.createErrors = createErrors;
    if (allErrors !== undefined)
        subschema.allErrors = allErrors;
    subschema.jtdDiscriminator = jtdDiscriminator; // not inherited
    subschema.jtdMetadata = jtdMetadata; // not inherited
}
exports.extendSubschemaMode = extendSubschemaMode;
//# sourceMappingURL=subschema.js.map

/***/ }),

/***/ 54634:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CodeGen = exports.Name = exports.nil = exports.stringify = exports.str = exports._ = exports.KeywordCxt = void 0;
var validate_1 = __webpack_require__(24587);
Object.defineProperty(exports, "KeywordCxt", ({ enumerable: true, get: function () { return validate_1.KeywordCxt; } }));
var codegen_1 = __webpack_require__(61089);
Object.defineProperty(exports, "_", ({ enumerable: true, get: function () { return codegen_1._; } }));
Object.defineProperty(exports, "str", ({ enumerable: true, get: function () { return codegen_1.str; } }));
Object.defineProperty(exports, "stringify", ({ enumerable: true, get: function () { return codegen_1.stringify; } }));
Object.defineProperty(exports, "nil", ({ enumerable: true, get: function () { return codegen_1.nil; } }));
Object.defineProperty(exports, "Name", ({ enumerable: true, get: function () { return codegen_1.Name; } }));
Object.defineProperty(exports, "CodeGen", ({ enumerable: true, get: function () { return codegen_1.CodeGen; } }));
const validation_error_1 = __webpack_require__(99401);
const ref_error_1 = __webpack_require__(60010);
const rules_1 = __webpack_require__(54964);
const compile_1 = __webpack_require__(84029);
const codegen_2 = __webpack_require__(61089);
const resolve_1 = __webpack_require__(17325);
const dataType_1 = __webpack_require__(50723);
const util_1 = __webpack_require__(86824);
const $dataRefSchema = __webpack_require__(50199);
const uri_1 = __webpack_require__(76172);
const defaultRegExp = (str, flags) => new RegExp(str, flags);
defaultRegExp.code = "new RegExp";
const META_IGNORE_OPTIONS = ["removeAdditional", "useDefaults", "coerceTypes"];
const EXT_SCOPE_NAMES = new Set([
    "validate",
    "serialize",
    "parse",
    "wrapper",
    "root",
    "schema",
    "keyword",
    "pattern",
    "formats",
    "validate$data",
    "func",
    "obj",
    "Error",
]);
const removedOptions = {
    errorDataPath: "",
    format: "`validateFormats: false` can be used instead.",
    nullable: '"nullable" keyword is supported by default.',
    jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
    extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
    missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
    processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
    sourceCode: "Use option `code: {source: true}`",
    strictDefaults: "It is default now, see option `strict`.",
    strictKeywords: "It is default now, see option `strict`.",
    uniqueItems: '"uniqueItems" keyword is always validated.',
    unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
    cache: "Map is used as cache, schema object as key.",
    serialize: "Map is used as cache, schema object as key.",
    ajvErrors: "It is default now.",
};
const deprecatedOptions = {
    ignoreKeywordsWithRef: "",
    jsPropertySyntax: "",
    unicode: '"minLength"/"maxLength" account for unicode characters by default.',
};
const MAX_EXPRESSION = 200;
// eslint-disable-next-line complexity
function requiredOptions(o) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0;
    const s = o.strict;
    const _optz = (_a = o.code) === null || _a === void 0 ? void 0 : _a.optimize;
    const optimize = _optz === true || _optz === undefined ? 1 : _optz || 0;
    const regExp = (_c = (_b = o.code) === null || _b === void 0 ? void 0 : _b.regExp) !== null && _c !== void 0 ? _c : defaultRegExp;
    const uriResolver = (_d = o.uriResolver) !== null && _d !== void 0 ? _d : uri_1.default;
    return {
        strictSchema: (_f = (_e = o.strictSchema) !== null && _e !== void 0 ? _e : s) !== null && _f !== void 0 ? _f : true,
        strictNumbers: (_h = (_g = o.strictNumbers) !== null && _g !== void 0 ? _g : s) !== null && _h !== void 0 ? _h : true,
        strictTypes: (_k = (_j = o.strictTypes) !== null && _j !== void 0 ? _j : s) !== null && _k !== void 0 ? _k : "log",
        strictTuples: (_m = (_l = o.strictTuples) !== null && _l !== void 0 ? _l : s) !== null && _m !== void 0 ? _m : "log",
        strictRequired: (_p = (_o = o.strictRequired) !== null && _o !== void 0 ? _o : s) !== null && _p !== void 0 ? _p : false,
        code: o.code ? { ...o.code, optimize, regExp } : { optimize, regExp },
        loopRequired: (_q = o.loopRequired) !== null && _q !== void 0 ? _q : MAX_EXPRESSION,
        loopEnum: (_r = o.loopEnum) !== null && _r !== void 0 ? _r : MAX_EXPRESSION,
        meta: (_s = o.meta) !== null && _s !== void 0 ? _s : true,
        messages: (_t = o.messages) !== null && _t !== void 0 ? _t : true,
        inlineRefs: (_u = o.inlineRefs) !== null && _u !== void 0 ? _u : true,
        schemaId: (_v = o.schemaId) !== null && _v !== void 0 ? _v : "$id",
        addUsedSchema: (_w = o.addUsedSchema) !== null && _w !== void 0 ? _w : true,
        validateSchema: (_x = o.validateSchema) !== null && _x !== void 0 ? _x : true,
        validateFormats: (_y = o.validateFormats) !== null && _y !== void 0 ? _y : true,
        unicodeRegExp: (_z = o.unicodeRegExp) !== null && _z !== void 0 ? _z : true,
        int32range: (_0 = o.int32range) !== null && _0 !== void 0 ? _0 : true,
        uriResolver: uriResolver,
    };
}
class Ajv {
    constructor(opts = {}) {
        this.schemas = {};
        this.refs = {};
        this.formats = {};
        this._compilations = new Set();
        this._loading = {};
        this._cache = new Map();
        opts = this.opts = { ...opts, ...requiredOptions(opts) };
        const { es5, lines } = this.opts.code;
        this.scope = new codegen_2.ValueScope({ scope: {}, prefixes: EXT_SCOPE_NAMES, es5, lines });
        this.logger = getLogger(opts.logger);
        const formatOpt = opts.validateFormats;
        opts.validateFormats = false;
        this.RULES = (0, rules_1.getRules)();
        checkOptions.call(this, removedOptions, opts, "NOT SUPPORTED");
        checkOptions.call(this, deprecatedOptions, opts, "DEPRECATED", "warn");
        this._metaOpts = getMetaSchemaOptions.call(this);
        if (opts.formats)
            addInitialFormats.call(this);
        this._addVocabularies();
        this._addDefaultMetaSchema();
        if (opts.keywords)
            addInitialKeywords.call(this, opts.keywords);
        if (typeof opts.meta == "object")
            this.addMetaSchema(opts.meta);
        addInitialSchemas.call(this);
        opts.validateFormats = formatOpt;
    }
    _addVocabularies() {
        this.addKeyword("$async");
    }
    _addDefaultMetaSchema() {
        const { $data, meta, schemaId } = this.opts;
        let _dataRefSchema = $dataRefSchema;
        if (schemaId === "id") {
            _dataRefSchema = { ...$dataRefSchema };
            _dataRefSchema.id = _dataRefSchema.$id;
            delete _dataRefSchema.$id;
        }
        if (meta && $data)
            this.addMetaSchema(_dataRefSchema, _dataRefSchema[schemaId], false);
    }
    defaultMeta() {
        const { meta, schemaId } = this.opts;
        return (this.opts.defaultMeta = typeof meta == "object" ? meta[schemaId] || meta : undefined);
    }
    validate(schemaKeyRef, // key, ref or schema object
    data // to be validated
    ) {
        let v;
        if (typeof schemaKeyRef == "string") {
            v = this.getSchema(schemaKeyRef);
            if (!v)
                throw new Error(`no schema with key or ref "${schemaKeyRef}"`);
        }
        else {
            v = this.compile(schemaKeyRef);
        }
        const valid = v(data);
        if (!("$async" in v))
            this.errors = v.errors;
        return valid;
    }
    compile(schema, _meta) {
        const sch = this._addSchema(schema, _meta);
        return (sch.validate || this._compileSchemaEnv(sch));
    }
    compileAsync(schema, meta) {
        if (typeof this.opts.loadSchema != "function") {
            throw new Error("options.loadSchema should be a function");
        }
        const { loadSchema } = this.opts;
        return runCompileAsync.call(this, schema, meta);
        async function runCompileAsync(_schema, _meta) {
            await loadMetaSchema.call(this, _schema.$schema);
            const sch = this._addSchema(_schema, _meta);
            return sch.validate || _compileAsync.call(this, sch);
        }
        async function loadMetaSchema($ref) {
            if ($ref && !this.getSchema($ref)) {
                await runCompileAsync.call(this, { $ref }, true);
            }
        }
        async function _compileAsync(sch) {
            try {
                return this._compileSchemaEnv(sch);
            }
            catch (e) {
                if (!(e instanceof ref_error_1.default))
                    throw e;
                checkLoaded.call(this, e);
                await loadMissingSchema.call(this, e.missingSchema);
                return _compileAsync.call(this, sch);
            }
        }
        function checkLoaded({ missingSchema: ref, missingRef }) {
            if (this.refs[ref]) {
                throw new Error(`AnySchema ${ref} is loaded but ${missingRef} cannot be resolved`);
            }
        }
        async function loadMissingSchema(ref) {
            const _schema = await _loadSchema.call(this, ref);
            if (!this.refs[ref])
                await loadMetaSchema.call(this, _schema.$schema);
            if (!this.refs[ref])
                this.addSchema(_schema, ref, meta);
        }
        async function _loadSchema(ref) {
            const p = this._loading[ref];
            if (p)
                return p;
            try {
                return await (this._loading[ref] = loadSchema(ref));
            }
            finally {
                delete this._loading[ref];
            }
        }
    }
    // Adds schema to the instance
    addSchema(schema, // If array is passed, `key` will be ignored
    key, // Optional schema key. Can be passed to `validate` method instead of schema object or id/ref. One schema per instance can have empty `id` and `key`.
    _meta, // true if schema is a meta-schema. Used internally, addMetaSchema should be used instead.
    _validateSchema = this.opts.validateSchema // false to skip schema validation. Used internally, option validateSchema should be used instead.
    ) {
        if (Array.isArray(schema)) {
            for (const sch of schema)
                this.addSchema(sch, undefined, _meta, _validateSchema);
            return this;
        }
        let id;
        if (typeof schema === "object") {
            const { schemaId } = this.opts;
            id = schema[schemaId];
            if (id !== undefined && typeof id != "string") {
                throw new Error(`schema ${schemaId} must be string`);
            }
        }
        key = (0, resolve_1.normalizeId)(key || id);
        this._checkUnique(key);
        this.schemas[key] = this._addSchema(schema, _meta, key, _validateSchema, true);
        return this;
    }
    // Add schema that will be used to validate other schemas
    // options in META_IGNORE_OPTIONS are alway set to false
    addMetaSchema(schema, key, // schema key
    _validateSchema = this.opts.validateSchema // false to skip schema validation, can be used to override validateSchema option for meta-schema
    ) {
        this.addSchema(schema, key, true, _validateSchema);
        return this;
    }
    //  Validate schema against its meta-schema
    validateSchema(schema, throwOrLogError) {
        if (typeof schema == "boolean")
            return true;
        let $schema;
        $schema = schema.$schema;
        if ($schema !== undefined && typeof $schema != "string") {
            throw new Error("$schema must be a string");
        }
        $schema = $schema || this.opts.defaultMeta || this.defaultMeta();
        if (!$schema) {
            this.logger.warn("meta-schema not available");
            this.errors = null;
            return true;
        }
        const valid = this.validate($schema, schema);
        if (!valid && throwOrLogError) {
            const message = "schema is invalid: " + this.errorsText();
            if (this.opts.validateSchema === "log")
                this.logger.error(message);
            else
                throw new Error(message);
        }
        return valid;
    }
    // Get compiled schema by `key` or `ref`.
    // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
    getSchema(keyRef) {
        let sch;
        while (typeof (sch = getSchEnv.call(this, keyRef)) == "string")
            keyRef = sch;
        if (sch === undefined) {
            const { schemaId } = this.opts;
            const root = new compile_1.SchemaEnv({ schema: {}, schemaId });
            sch = compile_1.resolveSchema.call(this, root, keyRef);
            if (!sch)
                return;
            this.refs[keyRef] = sch;
        }
        return (sch.validate || this._compileSchemaEnv(sch));
    }
    // Remove cached schema(s).
    // If no parameter is passed all schemas but meta-schemas are removed.
    // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
    // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
    removeSchema(schemaKeyRef) {
        if (schemaKeyRef instanceof RegExp) {
            this._removeAllSchemas(this.schemas, schemaKeyRef);
            this._removeAllSchemas(this.refs, schemaKeyRef);
            return this;
        }
        switch (typeof schemaKeyRef) {
            case "undefined":
                this._removeAllSchemas(this.schemas);
                this._removeAllSchemas(this.refs);
                this._cache.clear();
                return this;
            case "string": {
                const sch = getSchEnv.call(this, schemaKeyRef);
                if (typeof sch == "object")
                    this._cache.delete(sch.schema);
                delete this.schemas[schemaKeyRef];
                delete this.refs[schemaKeyRef];
                return this;
            }
            case "object": {
                const cacheKey = schemaKeyRef;
                this._cache.delete(cacheKey);
                let id = schemaKeyRef[this.opts.schemaId];
                if (id) {
                    id = (0, resolve_1.normalizeId)(id);
                    delete this.schemas[id];
                    delete this.refs[id];
                }
                return this;
            }
            default:
                throw new Error("ajv.removeSchema: invalid parameter");
        }
    }
    // add "vocabulary" - a collection of keywords
    addVocabulary(definitions) {
        for (const def of definitions)
            this.addKeyword(def);
        return this;
    }
    addKeyword(kwdOrDef, def // deprecated
    ) {
        let keyword;
        if (typeof kwdOrDef == "string") {
            keyword = kwdOrDef;
            if (typeof def == "object") {
                this.logger.warn("these parameters are deprecated, see docs for addKeyword");
                def.keyword = keyword;
            }
        }
        else if (typeof kwdOrDef == "object" && def === undefined) {
            def = kwdOrDef;
            keyword = def.keyword;
            if (Array.isArray(keyword) && !keyword.length) {
                throw new Error("addKeywords: keyword must be string or non-empty array");
            }
        }
        else {
            throw new Error("invalid addKeywords parameters");
        }
        checkKeyword.call(this, keyword, def);
        if (!def) {
            (0, util_1.eachItem)(keyword, (kwd) => addRule.call(this, kwd));
            return this;
        }
        keywordMetaschema.call(this, def);
        const definition = {
            ...def,
            type: (0, dataType_1.getJSONTypes)(def.type),
            schemaType: (0, dataType_1.getJSONTypes)(def.schemaType),
        };
        (0, util_1.eachItem)(keyword, definition.type.length === 0
            ? (k) => addRule.call(this, k, definition)
            : (k) => definition.type.forEach((t) => addRule.call(this, k, definition, t)));
        return this;
    }
    getKeyword(keyword) {
        const rule = this.RULES.all[keyword];
        return typeof rule == "object" ? rule.definition : !!rule;
    }
    // Remove keyword
    removeKeyword(keyword) {
        // TODO return type should be Ajv
        const { RULES } = this;
        delete RULES.keywords[keyword];
        delete RULES.all[keyword];
        for (const group of RULES.rules) {
            const i = group.rules.findIndex((rule) => rule.keyword === keyword);
            if (i >= 0)
                group.rules.splice(i, 1);
        }
        return this;
    }
    // Add format
    addFormat(name, format) {
        if (typeof format == "string")
            format = new RegExp(format);
        this.formats[name] = format;
        return this;
    }
    errorsText(errors = this.errors, // optional array of validation errors
    { separator = ", ", dataVar = "data" } = {} // optional options with properties `separator` and `dataVar`
    ) {
        if (!errors || errors.length === 0)
            return "No errors";
        return errors
            .map((e) => `${dataVar}${e.instancePath} ${e.message}`)
            .reduce((text, msg) => text + separator + msg);
    }
    $dataMetaSchema(metaSchema, keywordsJsonPointers) {
        const rules = this.RULES.all;
        metaSchema = JSON.parse(JSON.stringify(metaSchema));
        for (const jsonPointer of keywordsJsonPointers) {
            const segments = jsonPointer.split("/").slice(1); // first segment is an empty string
            let keywords = metaSchema;
            for (const seg of segments)
                keywords = keywords[seg];
            for (const key in rules) {
                const rule = rules[key];
                if (typeof rule != "object")
                    continue;
                const { $data } = rule.definition;
                const schema = keywords[key];
                if ($data && schema)
                    keywords[key] = schemaOrData(schema);
            }
        }
        return metaSchema;
    }
    _removeAllSchemas(schemas, regex) {
        for (const keyRef in schemas) {
            const sch = schemas[keyRef];
            if (!regex || regex.test(keyRef)) {
                if (typeof sch == "string") {
                    delete schemas[keyRef];
                }
                else if (sch && !sch.meta) {
                    this._cache.delete(sch.schema);
                    delete schemas[keyRef];
                }
            }
        }
    }
    _addSchema(schema, meta, baseId, validateSchema = this.opts.validateSchema, addSchema = this.opts.addUsedSchema) {
        let id;
        const { schemaId } = this.opts;
        if (typeof schema == "object") {
            id = schema[schemaId];
        }
        else {
            if (this.opts.jtd)
                throw new Error("schema must be object");
            else if (typeof schema != "boolean")
                throw new Error("schema must be object or boolean");
        }
        let sch = this._cache.get(schema);
        if (sch !== undefined)
            return sch;
        baseId = (0, resolve_1.normalizeId)(id || baseId);
        const localRefs = resolve_1.getSchemaRefs.call(this, schema, baseId);
        sch = new compile_1.SchemaEnv({ schema, schemaId, meta, baseId, localRefs });
        this._cache.set(sch.schema, sch);
        if (addSchema && !baseId.startsWith("#")) {
            // TODO atm it is allowed to overwrite schemas without id (instead of not adding them)
            if (baseId)
                this._checkUnique(baseId);
            this.refs[baseId] = sch;
        }
        if (validateSchema)
            this.validateSchema(schema, true);
        return sch;
    }
    _checkUnique(id) {
        if (this.schemas[id] || this.refs[id]) {
            throw new Error(`schema with key or id "${id}" already exists`);
        }
    }
    _compileSchemaEnv(sch) {
        if (sch.meta)
            this._compileMetaSchema(sch);
        else
            compile_1.compileSchema.call(this, sch);
        /* istanbul ignore if */
        if (!sch.validate)
            throw new Error("ajv implementation error");
        return sch.validate;
    }
    _compileMetaSchema(sch) {
        const currentOpts = this.opts;
        this.opts = this._metaOpts;
        try {
            compile_1.compileSchema.call(this, sch);
        }
        finally {
            this.opts = currentOpts;
        }
    }
}
exports["default"] = Ajv;
Ajv.ValidationError = validation_error_1.default;
Ajv.MissingRefError = ref_error_1.default;
function checkOptions(checkOpts, options, msg, log = "error") {
    for (const key in checkOpts) {
        const opt = key;
        if (opt in options)
            this.logger[log](`${msg}: option ${key}. ${checkOpts[opt]}`);
    }
}
function getSchEnv(keyRef) {
    keyRef = (0, resolve_1.normalizeId)(keyRef); // TODO tests fail without this line
    return this.schemas[keyRef] || this.refs[keyRef];
}
function addInitialSchemas() {
    const optsSchemas = this.opts.schemas;
    if (!optsSchemas)
        return;
    if (Array.isArray(optsSchemas))
        this.addSchema(optsSchemas);
    else
        for (const key in optsSchemas)
            this.addSchema(optsSchemas[key], key);
}
function addInitialFormats() {
    for (const name in this.opts.formats) {
        const format = this.opts.formats[name];
        if (format)
            this.addFormat(name, format);
    }
}
function addInitialKeywords(defs) {
    if (Array.isArray(defs)) {
        this.addVocabulary(defs);
        return;
    }
    this.logger.warn("keywords option as map is deprecated, pass array");
    for (const keyword in defs) {
        const def = defs[keyword];
        if (!def.keyword)
            def.keyword = keyword;
        this.addKeyword(def);
    }
}
function getMetaSchemaOptions() {
    const metaOpts = { ...this.opts };
    for (const opt of META_IGNORE_OPTIONS)
        delete metaOpts[opt];
    return metaOpts;
}
const noLogs = { log() { }, warn() { }, error() { } };
function getLogger(logger) {
    if (logger === false)
        return noLogs;
    if (logger === undefined)
        return console;
    if (logger.log && logger.warn && logger.error)
        return logger;
    throw new Error("logger must implement log, warn and error methods");
}
const KEYWORD_NAME = /^[a-z_$][a-z0-9_$:-]*$/i;
function checkKeyword(keyword, def) {
    const { RULES } = this;
    (0, util_1.eachItem)(keyword, (kwd) => {
        if (RULES.keywords[kwd])
            throw new Error(`Keyword ${kwd} is already defined`);
        if (!KEYWORD_NAME.test(kwd))
            throw new Error(`Keyword ${kwd} has invalid name`);
    });
    if (!def)
        return;
    if (def.$data && !("code" in def || "validate" in def)) {
        throw new Error('$data keyword must have "code" or "validate" function');
    }
}
function addRule(keyword, definition, dataType) {
    var _a;
    const post = definition === null || definition === void 0 ? void 0 : definition.post;
    if (dataType && post)
        throw new Error('keyword with "post" flag cannot have "type"');
    const { RULES } = this;
    let ruleGroup = post ? RULES.post : RULES.rules.find(({ type: t }) => t === dataType);
    if (!ruleGroup) {
        ruleGroup = { type: dataType, rules: [] };
        RULES.rules.push(ruleGroup);
    }
    RULES.keywords[keyword] = true;
    if (!definition)
        return;
    const rule = {
        keyword,
        definition: {
            ...definition,
            type: (0, dataType_1.getJSONTypes)(definition.type),
            schemaType: (0, dataType_1.getJSONTypes)(definition.schemaType),
        },
    };
    if (definition.before)
        addBeforeRule.call(this, ruleGroup, rule, definition.before);
    else
        ruleGroup.rules.push(rule);
    RULES.all[keyword] = rule;
    (_a = definition.implements) === null || _a === void 0 ? void 0 : _a.forEach((kwd) => this.addKeyword(kwd));
}
function addBeforeRule(ruleGroup, rule, before) {
    const i = ruleGroup.rules.findIndex((_rule) => _rule.keyword === before);
    if (i >= 0) {
        ruleGroup.rules.splice(i, 0, rule);
    }
    else {
        ruleGroup.rules.push(rule);
        this.logger.warn(`rule ${before} is not defined`);
    }
}
function keywordMetaschema(def) {
    let { metaSchema } = def;
    if (metaSchema === undefined)
        return;
    if (def.$data && this.opts.$data)
        metaSchema = schemaOrData(metaSchema);
    def.validateSchema = this.compile(metaSchema, true);
}
const $dataRef = {
    $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#",
};
function schemaOrData(schema) {
    return { anyOf: [schema, $dataRef] };
}
//# sourceMappingURL=core.js.map

/***/ }),

/***/ 33839:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
// https://github.com/ajv-validator/ajv/issues/889
const equal = __webpack_require__(92417);
equal.code = 'require("ajv/dist/runtime/equal").default';
exports["default"] = equal;
//# sourceMappingURL=equal.js.map

/***/ }),

/***/ 1987:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
// https://mathiasbynens.be/notes/javascript-encoding
// https://github.com/bestiejs/punycode.js - punycode.ucs2.decode
function ucs2length(str) {
    const len = str.length;
    let length = 0;
    let pos = 0;
    let value;
    while (pos < len) {
        length++;
        value = str.charCodeAt(pos++);
        if (value >= 0xd800 && value <= 0xdbff && pos < len) {
            // high surrogate, and there is a next character
            value = str.charCodeAt(pos);
            if ((value & 0xfc00) === 0xdc00)
                pos++; // low surrogate
        }
    }
    return length;
}
exports["default"] = ucs2length;
ucs2length.code = 'require("ajv/dist/runtime/ucs2length").default';
//# sourceMappingURL=ucs2length.js.map

/***/ }),

/***/ 76172:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const uri = __webpack_require__(16462);
uri.code = 'require("ajv/dist/runtime/uri").default';
exports["default"] = uri;
//# sourceMappingURL=uri.js.map

/***/ }),

/***/ 99401:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
class ValidationError extends Error {
    constructor(errors) {
        super("validation failed");
        this.errors = errors;
        this.ajv = this.validation = true;
    }
}
exports["default"] = ValidationError;
//# sourceMappingURL=validation_error.js.map

/***/ }),

/***/ 84896:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.validateAdditionalItems = void 0;
const codegen_1 = __webpack_require__(61089);
const util_1 = __webpack_require__(86824);
const error = {
    message: ({ params: { len } }) => (0, codegen_1.str) `must NOT have more than ${len} items`,
    params: ({ params: { len } }) => (0, codegen_1._) `{limit: ${len}}`,
};
const def = {
    keyword: "additionalItems",
    type: "array",
    schemaType: ["boolean", "object"],
    before: "uniqueItems",
    error,
    code(cxt) {
        const { parentSchema, it } = cxt;
        const { items } = parentSchema;
        if (!Array.isArray(items)) {
            (0, util_1.checkStrictMode)(it, '"additionalItems" is ignored when "items" is not an array of schemas');
            return;
        }
        validateAdditionalItems(cxt, items);
    },
};
function validateAdditionalItems(cxt, items) {
    const { gen, schema, data, keyword, it } = cxt;
    it.items = true;
    const len = gen.const("len", (0, codegen_1._) `${data}.length`);
    if (schema === false) {
        cxt.setParams({ len: items.length });
        cxt.pass((0, codegen_1._) `${len} <= ${items.length}`);
    }
    else if (typeof schema == "object" && !(0, util_1.alwaysValidSchema)(it, schema)) {
        const valid = gen.var("valid", (0, codegen_1._) `${len} <= ${items.length}`); // TODO var
        gen.if((0, codegen_1.not)(valid), () => validateItems(valid));
        cxt.ok(valid);
    }
    function validateItems(valid) {
        gen.forRange("i", items.length, len, (i) => {
            cxt.subschema({ keyword, dataProp: i, dataPropType: util_1.Type.Num }, valid);
            if (!it.allErrors)
                gen.if((0, codegen_1.not)(valid), () => gen.break());
        });
    }
}
exports.validateAdditionalItems = validateAdditionalItems;
exports["default"] = def;
//# sourceMappingURL=additionalItems.js.map

/***/ }),

/***/ 85333:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const code_1 = __webpack_require__(68185);
const codegen_1 = __webpack_require__(61089);
const names_1 = __webpack_require__(16842);
const util_1 = __webpack_require__(86824);
const error = {
    message: "must NOT have additional properties",
    params: ({ params }) => (0, codegen_1._) `{additionalProperty: ${params.additionalProperty}}`,
};
const def = {
    keyword: "additionalProperties",
    type: ["object"],
    schemaType: ["boolean", "object"],
    allowUndefined: true,
    trackErrors: true,
    error,
    code(cxt) {
        const { gen, schema, parentSchema, data, errsCount, it } = cxt;
        /* istanbul ignore if */
        if (!errsCount)
            throw new Error("ajv implementation error");
        const { allErrors, opts } = it;
        it.props = true;
        if (opts.removeAdditional !== "all" && (0, util_1.alwaysValidSchema)(it, schema))
            return;
        const props = (0, code_1.allSchemaProperties)(parentSchema.properties);
        const patProps = (0, code_1.allSchemaProperties)(parentSchema.patternProperties);
        checkAdditionalProperties();
        cxt.ok((0, codegen_1._) `${errsCount} === ${names_1.default.errors}`);
        function checkAdditionalProperties() {
            gen.forIn("key", data, (key) => {
                if (!props.length && !patProps.length)
                    additionalPropertyCode(key);
                else
                    gen.if(isAdditional(key), () => additionalPropertyCode(key));
            });
        }
        function isAdditional(key) {
            let definedProp;
            if (props.length > 8) {
                // TODO maybe an option instead of hard-coded 8?
                const propsSchema = (0, util_1.schemaRefOrVal)(it, parentSchema.properties, "properties");
                definedProp = (0, code_1.isOwnProperty)(gen, propsSchema, key);
            }
            else if (props.length) {
                definedProp = (0, codegen_1.or)(...props.map((p) => (0, codegen_1._) `${key} === ${p}`));
            }
            else {
                definedProp = codegen_1.nil;
            }
            if (patProps.length) {
                definedProp = (0, codegen_1.or)(definedProp, ...patProps.map((p) => (0, codegen_1._) `${(0, code_1.usePattern)(cxt, p)}.test(${key})`));
            }
            return (0, codegen_1.not)(definedProp);
        }
        function deleteAdditional(key) {
            gen.code((0, codegen_1._) `delete ${data}[${key}]`);
        }
        function additionalPropertyCode(key) {
            if (opts.removeAdditional === "all" || (opts.removeAdditional && schema === false)) {
                deleteAdditional(key);
                return;
            }
            if (schema === false) {
                cxt.setParams({ additionalProperty: key });
                cxt.error();
                if (!allErrors)
                    gen.break();
                return;
            }
            if (typeof schema == "object" && !(0, util_1.alwaysValidSchema)(it, schema)) {
                const valid = gen.name("valid");
                if (opts.removeAdditional === "failing") {
                    applyAdditionalSchema(key, valid, false);
                    gen.if((0, codegen_1.not)(valid), () => {
                        cxt.reset();
                        deleteAdditional(key);
                    });
                }
                else {
                    applyAdditionalSchema(key, valid);
                    if (!allErrors)
                        gen.if((0, codegen_1.not)(valid), () => gen.break());
                }
            }
        }
        function applyAdditionalSchema(key, valid, errors) {
            const subschema = {
                keyword: "additionalProperties",
                dataProp: key,
                dataPropType: util_1.Type.Str,
            };
            if (errors === false) {
                Object.assign(subschema, {
                    compositeRule: true,
                    createErrors: false,
                    allErrors: false,
                });
            }
            cxt.subschema(subschema, valid);
        }
    },
};
exports["default"] = def;
//# sourceMappingURL=additionalProperties.js.map

/***/ }),

/***/ 55031:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const util_1 = __webpack_require__(86824);
const def = {
    keyword: "allOf",
    schemaType: "array",
    code(cxt) {
        const { gen, schema, it } = cxt;
        /* istanbul ignore if */
        if (!Array.isArray(schema))
            throw new Error("ajv implementation error");
        const valid = gen.name("valid");
        schema.forEach((sch, i) => {
            if ((0, util_1.alwaysValidSchema)(it, sch))
                return;
            const schCxt = cxt.subschema({ keyword: "allOf", schemaProp: i }, valid);
            cxt.ok(valid);
            cxt.mergeEvaluated(schCxt);
        });
    },
};
exports["default"] = def;
//# sourceMappingURL=allOf.js.map

/***/ }),

/***/ 15572:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const code_1 = __webpack_require__(68185);
const def = {
    keyword: "anyOf",
    schemaType: "array",
    trackErrors: true,
    code: code_1.validateUnion,
    error: { message: "must match a schema in anyOf" },
};
exports["default"] = def;
//# sourceMappingURL=anyOf.js.map

/***/ }),

/***/ 78896:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const codegen_1 = __webpack_require__(61089);
const util_1 = __webpack_require__(86824);
const error = {
    message: ({ params: { min, max } }) => max === undefined
        ? (0, codegen_1.str) `must contain at least ${min} valid item(s)`
        : (0, codegen_1.str) `must contain at least ${min} and no more than ${max} valid item(s)`,
    params: ({ params: { min, max } }) => max === undefined ? (0, codegen_1._) `{minContains: ${min}}` : (0, codegen_1._) `{minContains: ${min}, maxContains: ${max}}`,
};
const def = {
    keyword: "contains",
    type: "array",
    schemaType: ["object", "boolean"],
    before: "uniqueItems",
    trackErrors: true,
    error,
    code(cxt) {
        const { gen, schema, parentSchema, data, it } = cxt;
        let min;
        let max;
        const { minContains, maxContains } = parentSchema;
        if (it.opts.next) {
            min = minContains === undefined ? 1 : minContains;
            max = maxContains;
        }
        else {
            min = 1;
        }
        const len = gen.const("len", (0, codegen_1._) `${data}.length`);
        cxt.setParams({ min, max });
        if (max === undefined && min === 0) {
            (0, util_1.checkStrictMode)(it, `"minContains" == 0 without "maxContains": "contains" keyword ignored`);
            return;
        }
        if (max !== undefined && min > max) {
            (0, util_1.checkStrictMode)(it, `"minContains" > "maxContains" is always invalid`);
            cxt.fail();
            return;
        }
        if ((0, util_1.alwaysValidSchema)(it, schema)) {
            let cond = (0, codegen_1._) `${len} >= ${min}`;
            if (max !== undefined)
                cond = (0, codegen_1._) `${cond} && ${len} <= ${max}`;
            cxt.pass(cond);
            return;
        }
        it.items = true;
        const valid = gen.name("valid");
        if (max === undefined && min === 1) {
            validateItems(valid, () => gen.if(valid, () => gen.break()));
        }
        else if (min === 0) {
            gen.let(valid, true);
            if (max !== undefined)
                gen.if((0, codegen_1._) `${data}.length > 0`, validateItemsWithCount);
        }
        else {
            gen.let(valid, false);
            validateItemsWithCount();
        }
        cxt.result(valid, () => cxt.reset());
        function validateItemsWithCount() {
            const schValid = gen.name("_valid");
            const count = gen.let("count", 0);
            validateItems(schValid, () => gen.if(schValid, () => checkLimits(count)));
        }
        function validateItems(_valid, block) {
            gen.forRange("i", 0, len, (i) => {
                cxt.subschema({
                    keyword: "contains",
                    dataProp: i,
                    dataPropType: util_1.Type.Num,
                    compositeRule: true,
                }, _valid);
                block();
            });
        }
        function checkLimits(count) {
            gen.code((0, codegen_1._) `${count}++`);
            if (max === undefined) {
                gen.if((0, codegen_1._) `${count} >= ${min}`, () => gen.assign(valid, true).break());
            }
            else {
                gen.if((0, codegen_1._) `${count} > ${max}`, () => gen.assign(valid, false).break());
                if (min === 1)
                    gen.assign(valid, true);
                else
                    gen.if((0, codegen_1._) `${count} >= ${min}`, () => gen.assign(valid, true));
            }
        }
    },
};
exports["default"] = def;
//# sourceMappingURL=contains.js.map

/***/ }),

/***/ 76037:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.validateSchemaDeps = exports.validatePropertyDeps = exports.error = void 0;
const codegen_1 = __webpack_require__(61089);
const util_1 = __webpack_require__(86824);
const code_1 = __webpack_require__(68185);
exports.error = {
    message: ({ params: { property, depsCount, deps } }) => {
        const property_ies = depsCount === 1 ? "property" : "properties";
        return (0, codegen_1.str) `must have ${property_ies} ${deps} when property ${property} is present`;
    },
    params: ({ params: { property, depsCount, deps, missingProperty } }) => (0, codegen_1._) `{property: ${property},
    missingProperty: ${missingProperty},
    depsCount: ${depsCount},
    deps: ${deps}}`, // TODO change to reference
};
const def = {
    keyword: "dependencies",
    type: "object",
    schemaType: "object",
    error: exports.error,
    code(cxt) {
        const [propDeps, schDeps] = splitDependencies(cxt);
        validatePropertyDeps(cxt, propDeps);
        validateSchemaDeps(cxt, schDeps);
    },
};
function splitDependencies({ schema }) {
    const propertyDeps = {};
    const schemaDeps = {};
    for (const key in schema) {
        if (key === "__proto__")
            continue;
        const deps = Array.isArray(schema[key]) ? propertyDeps : schemaDeps;
        deps[key] = schema[key];
    }
    return [propertyDeps, schemaDeps];
}
function validatePropertyDeps(cxt, propertyDeps = cxt.schema) {
    const { gen, data, it } = cxt;
    if (Object.keys(propertyDeps).length === 0)
        return;
    const missing = gen.let("missing");
    for (const prop in propertyDeps) {
        const deps = propertyDeps[prop];
        if (deps.length === 0)
            continue;
        const hasProperty = (0, code_1.propertyInData)(gen, data, prop, it.opts.ownProperties);
        cxt.setParams({
            property: prop,
            depsCount: deps.length,
            deps: deps.join(", "),
        });
        if (it.allErrors) {
            gen.if(hasProperty, () => {
                for (const depProp of deps) {
                    (0, code_1.checkReportMissingProp)(cxt, depProp);
                }
            });
        }
        else {
            gen.if((0, codegen_1._) `${hasProperty} && (${(0, code_1.checkMissingProp)(cxt, deps, missing)})`);
            (0, code_1.reportMissingProp)(cxt, missing);
            gen.else();
        }
    }
}
exports.validatePropertyDeps = validatePropertyDeps;
function validateSchemaDeps(cxt, schemaDeps = cxt.schema) {
    const { gen, data, keyword, it } = cxt;
    const valid = gen.name("valid");
    for (const prop in schemaDeps) {
        if ((0, util_1.alwaysValidSchema)(it, schemaDeps[prop]))
            continue;
        gen.if((0, code_1.propertyInData)(gen, data, prop, it.opts.ownProperties), () => {
            const schCxt = cxt.subschema({ keyword, schemaProp: prop }, valid);
            cxt.mergeValidEvaluated(schCxt, valid);
        }, () => gen.var(valid, true) // TODO var
        );
        cxt.ok(valid);
    }
}
exports.validateSchemaDeps = validateSchemaDeps;
exports["default"] = def;
//# sourceMappingURL=dependencies.js.map

/***/ }),

/***/ 97474:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const codegen_1 = __webpack_require__(61089);
const util_1 = __webpack_require__(86824);
const error = {
    message: ({ params }) => (0, codegen_1.str) `must match "${params.ifClause}" schema`,
    params: ({ params }) => (0, codegen_1._) `{failingKeyword: ${params.ifClause}}`,
};
const def = {
    keyword: "if",
    schemaType: ["object", "boolean"],
    trackErrors: true,
    error,
    code(cxt) {
        const { gen, parentSchema, it } = cxt;
        if (parentSchema.then === undefined && parentSchema.else === undefined) {
            (0, util_1.checkStrictMode)(it, '"if" without "then" and "else" is ignored');
        }
        const hasThen = hasSchema(it, "then");
        const hasElse = hasSchema(it, "else");
        if (!hasThen && !hasElse)
            return;
        const valid = gen.let("valid", true);
        const schValid = gen.name("_valid");
        validateIf();
        cxt.reset();
        if (hasThen && hasElse) {
            const ifClause = gen.let("ifClause");
            cxt.setParams({ ifClause });
            gen.if(schValid, validateClause("then", ifClause), validateClause("else", ifClause));
        }
        else if (hasThen) {
            gen.if(schValid, validateClause("then"));
        }
        else {
            gen.if((0, codegen_1.not)(schValid), validateClause("else"));
        }
        cxt.pass(valid, () => cxt.error(true));
        function validateIf() {
            const schCxt = cxt.subschema({
                keyword: "if",
                compositeRule: true,
                createErrors: false,
                allErrors: false,
            }, schValid);
            cxt.mergeEvaluated(schCxt);
        }
        function validateClause(keyword, ifClause) {
            return () => {
                const schCxt = cxt.subschema({ keyword }, schValid);
                gen.assign(valid, schValid);
                cxt.mergeValidEvaluated(schCxt, valid);
                if (ifClause)
                    gen.assign(ifClause, (0, codegen_1._) `${keyword}`);
                else
                    cxt.setParams({ ifClause: keyword });
            };
        }
    },
};
function hasSchema(it, keyword) {
    const schema = it.schema[keyword];
    return schema !== undefined && !(0, util_1.alwaysValidSchema)(it, schema);
}
exports["default"] = def;
//# sourceMappingURL=if.js.map

/***/ }),

/***/ 39322:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const additionalItems_1 = __webpack_require__(84896);
const prefixItems_1 = __webpack_require__(32947);
const items_1 = __webpack_require__(46718);
const items2020_1 = __webpack_require__(12252);
const contains_1 = __webpack_require__(78896);
const dependencies_1 = __webpack_require__(76037);
const propertyNames_1 = __webpack_require__(5961);
const additionalProperties_1 = __webpack_require__(85333);
const properties_1 = __webpack_require__(27649);
const patternProperties_1 = __webpack_require__(9454);
const not_1 = __webpack_require__(84488);
const anyOf_1 = __webpack_require__(15572);
const oneOf_1 = __webpack_require__(28761);
const allOf_1 = __webpack_require__(55031);
const if_1 = __webpack_require__(97474);
const thenElse_1 = __webpack_require__(38227);
function getApplicator(draft2020 = false) {
    const applicator = [
        // any
        not_1.default,
        anyOf_1.default,
        oneOf_1.default,
        allOf_1.default,
        if_1.default,
        thenElse_1.default,
        // object
        propertyNames_1.default,
        additionalProperties_1.default,
        dependencies_1.default,
        properties_1.default,
        patternProperties_1.default,
    ];
    // array
    if (draft2020)
        applicator.push(prefixItems_1.default, items2020_1.default);
    else
        applicator.push(additionalItems_1.default, items_1.default);
    applicator.push(contains_1.default);
    return applicator;
}
exports["default"] = getApplicator;
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 46718:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.validateTuple = void 0;
const codegen_1 = __webpack_require__(61089);
const util_1 = __webpack_require__(86824);
const code_1 = __webpack_require__(68185);
const def = {
    keyword: "items",
    type: "array",
    schemaType: ["object", "array", "boolean"],
    before: "uniqueItems",
    code(cxt) {
        const { schema, it } = cxt;
        if (Array.isArray(schema))
            return validateTuple(cxt, "additionalItems", schema);
        it.items = true;
        if ((0, util_1.alwaysValidSchema)(it, schema))
            return;
        cxt.ok((0, code_1.validateArray)(cxt));
    },
};
function validateTuple(cxt, extraItems, schArr = cxt.schema) {
    const { gen, parentSchema, data, keyword, it } = cxt;
    checkStrictTuple(parentSchema);
    if (it.opts.unevaluated && schArr.length && it.items !== true) {
        it.items = util_1.mergeEvaluated.items(gen, schArr.length, it.items);
    }
    const valid = gen.name("valid");
    const len = gen.const("len", (0, codegen_1._) `${data}.length`);
    schArr.forEach((sch, i) => {
        if ((0, util_1.alwaysValidSchema)(it, sch))
            return;
        gen.if((0, codegen_1._) `${len} > ${i}`, () => cxt.subschema({
            keyword,
            schemaProp: i,
            dataProp: i,
        }, valid));
        cxt.ok(valid);
    });
    function checkStrictTuple(sch) {
        const { opts, errSchemaPath } = it;
        const l = schArr.length;
        const fullTuple = l === sch.minItems && (l === sch.maxItems || sch[extraItems] === false);
        if (opts.strictTuples && !fullTuple) {
            const msg = `"${keyword}" is ${l}-tuple, but minItems or maxItems/${extraItems} are not specified or different at path "${errSchemaPath}"`;
            (0, util_1.checkStrictMode)(it, msg, opts.strictTuples);
        }
    }
}
exports.validateTuple = validateTuple;
exports["default"] = def;
//# sourceMappingURL=items.js.map

/***/ }),

/***/ 12252:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const codegen_1 = __webpack_require__(61089);
const util_1 = __webpack_require__(86824);
const code_1 = __webpack_require__(68185);
const additionalItems_1 = __webpack_require__(84896);
const error = {
    message: ({ params: { len } }) => (0, codegen_1.str) `must NOT have more than ${len} items`,
    params: ({ params: { len } }) => (0, codegen_1._) `{limit: ${len}}`,
};
const def = {
    keyword: "items",
    type: "array",
    schemaType: ["object", "boolean"],
    before: "uniqueItems",
    error,
    code(cxt) {
        const { schema, parentSchema, it } = cxt;
        const { prefixItems } = parentSchema;
        it.items = true;
        if ((0, util_1.alwaysValidSchema)(it, schema))
            return;
        if (prefixItems)
            (0, additionalItems_1.validateAdditionalItems)(cxt, prefixItems);
        else
            cxt.ok((0, code_1.validateArray)(cxt));
    },
};
exports["default"] = def;
//# sourceMappingURL=items2020.js.map

/***/ }),

/***/ 84488:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const util_1 = __webpack_require__(86824);
const def = {
    keyword: "not",
    schemaType: ["object", "boolean"],
    trackErrors: true,
    code(cxt) {
        const { gen, schema, it } = cxt;
        if ((0, util_1.alwaysValidSchema)(it, schema)) {
            cxt.fail();
            return;
        }
        const valid = gen.name("valid");
        cxt.subschema({
            keyword: "not",
            compositeRule: true,
            createErrors: false,
            allErrors: false,
        }, valid);
        cxt.failResult(valid, () => cxt.reset(), () => cxt.error());
    },
    error: { message: "must NOT be valid" },
};
exports["default"] = def;
//# sourceMappingURL=not.js.map

/***/ }),

/***/ 28761:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const codegen_1 = __webpack_require__(61089);
const util_1 = __webpack_require__(86824);
const error = {
    message: "must match exactly one schema in oneOf",
    params: ({ params }) => (0, codegen_1._) `{passingSchemas: ${params.passing}}`,
};
const def = {
    keyword: "oneOf",
    schemaType: "array",
    trackErrors: true,
    error,
    code(cxt) {
        const { gen, schema, parentSchema, it } = cxt;
        /* istanbul ignore if */
        if (!Array.isArray(schema))
            throw new Error("ajv implementation error");
        if (it.opts.discriminator && parentSchema.discriminator)
            return;
        const schArr = schema;
        const valid = gen.let("valid", false);
        const passing = gen.let("passing", null);
        const schValid = gen.name("_valid");
        cxt.setParams({ passing });
        // TODO possibly fail straight away (with warning or exception) if there are two empty always valid schemas
        gen.block(validateOneOf);
        cxt.result(valid, () => cxt.reset(), () => cxt.error(true));
        function validateOneOf() {
            schArr.forEach((sch, i) => {
                let schCxt;
                if ((0, util_1.alwaysValidSchema)(it, sch)) {
                    gen.var(schValid, true);
                }
                else {
                    schCxt = cxt.subschema({
                        keyword: "oneOf",
                        schemaProp: i,
                        compositeRule: true,
                    }, schValid);
                }
                if (i > 0) {
                    gen
                        .if((0, codegen_1._) `${schValid} && ${valid}`)
                        .assign(valid, false)
                        .assign(passing, (0, codegen_1._) `[${passing}, ${i}]`)
                        .else();
                }
                gen.if(schValid, () => {
                    gen.assign(valid, true);
                    gen.assign(passing, i);
                    if (schCxt)
                        cxt.mergeEvaluated(schCxt, codegen_1.Name);
                });
            });
        }
    },
};
exports["default"] = def;
//# sourceMappingURL=oneOf.js.map

/***/ }),

/***/ 9454:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const code_1 = __webpack_require__(68185);
const codegen_1 = __webpack_require__(61089);
const util_1 = __webpack_require__(86824);
const util_2 = __webpack_require__(86824);
const def = {
    keyword: "patternProperties",
    type: "object",
    schemaType: "object",
    code(cxt) {
        const { gen, schema, data, parentSchema, it } = cxt;
        const { opts } = it;
        const patterns = (0, code_1.allSchemaProperties)(schema);
        const alwaysValidPatterns = patterns.filter((p) => (0, util_1.alwaysValidSchema)(it, schema[p]));
        if (patterns.length === 0 ||
            (alwaysValidPatterns.length === patterns.length &&
                (!it.opts.unevaluated || it.props === true))) {
            return;
        }
        const checkProperties = opts.strictSchema && !opts.allowMatchingProperties && parentSchema.properties;
        const valid = gen.name("valid");
        if (it.props !== true && !(it.props instanceof codegen_1.Name)) {
            it.props = (0, util_2.evaluatedPropsToName)(gen, it.props);
        }
        const { props } = it;
        validatePatternProperties();
        function validatePatternProperties() {
            for (const pat of patterns) {
                if (checkProperties)
                    checkMatchingProperties(pat);
                if (it.allErrors) {
                    validateProperties(pat);
                }
                else {
                    gen.var(valid, true); // TODO var
                    validateProperties(pat);
                    gen.if(valid);
                }
            }
        }
        function checkMatchingProperties(pat) {
            for (const prop in checkProperties) {
                if (new RegExp(pat).test(prop)) {
                    (0, util_1.checkStrictMode)(it, `property ${prop} matches pattern ${pat} (use allowMatchingProperties)`);
                }
            }
        }
        function validateProperties(pat) {
            gen.forIn("key", data, (key) => {
                gen.if((0, codegen_1._) `${(0, code_1.usePattern)(cxt, pat)}.test(${key})`, () => {
                    const alwaysValid = alwaysValidPatterns.includes(pat);
                    if (!alwaysValid) {
                        cxt.subschema({
                            keyword: "patternProperties",
                            schemaProp: pat,
                            dataProp: key,
                            dataPropType: util_2.Type.Str,
                        }, valid);
                    }
                    if (it.opts.unevaluated && props !== true) {
                        gen.assign((0, codegen_1._) `${props}[${key}]`, true);
                    }
                    else if (!alwaysValid && !it.allErrors) {
                        // can short-circuit if `unevaluatedProperties` is not supported (opts.next === false)
                        // or if all properties were evaluated (props === true)
                        gen.if((0, codegen_1.not)(valid), () => gen.break());
                    }
                });
            });
        }
    },
};
exports["default"] = def;
//# sourceMappingURL=patternProperties.js.map

/***/ }),

/***/ 32947:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const items_1 = __webpack_require__(46718);
const def = {
    keyword: "prefixItems",
    type: "array",
    schemaType: ["array"],
    before: "uniqueItems",
    code: (cxt) => (0, items_1.validateTuple)(cxt, "items"),
};
exports["default"] = def;
//# sourceMappingURL=prefixItems.js.map

/***/ }),

/***/ 27649:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const validate_1 = __webpack_require__(24587);
const code_1 = __webpack_require__(68185);
const util_1 = __webpack_require__(86824);
const additionalProperties_1 = __webpack_require__(85333);
const def = {
    keyword: "properties",
    type: "object",
    schemaType: "object",
    code(cxt) {
        const { gen, schema, parentSchema, data, it } = cxt;
        if (it.opts.removeAdditional === "all" && parentSchema.additionalProperties === undefined) {
            additionalProperties_1.default.code(new validate_1.KeywordCxt(it, additionalProperties_1.default, "additionalProperties"));
        }
        const allProps = (0, code_1.allSchemaProperties)(schema);
        for (const prop of allProps) {
            it.definedProperties.add(prop);
        }
        if (it.opts.unevaluated && allProps.length && it.props !== true) {
            it.props = util_1.mergeEvaluated.props(gen, (0, util_1.toHash)(allProps), it.props);
        }
        const properties = allProps.filter((p) => !(0, util_1.alwaysValidSchema)(it, schema[p]));
        if (properties.length === 0)
            return;
        const valid = gen.name("valid");
        for (const prop of properties) {
            if (hasDefault(prop)) {
                applyPropertySchema(prop);
            }
            else {
                gen.if((0, code_1.propertyInData)(gen, data, prop, it.opts.ownProperties));
                applyPropertySchema(prop);
                if (!it.allErrors)
                    gen.else().var(valid, true);
                gen.endIf();
            }
            cxt.it.definedProperties.add(prop);
            cxt.ok(valid);
        }
        function hasDefault(prop) {
            return it.opts.useDefaults && !it.compositeRule && schema[prop].default !== undefined;
        }
        function applyPropertySchema(prop) {
            cxt.subschema({
                keyword: "properties",
                schemaProp: prop,
                dataProp: prop,
            }, valid);
        }
    },
};
exports["default"] = def;
//# sourceMappingURL=properties.js.map

/***/ }),

/***/ 5961:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const codegen_1 = __webpack_require__(61089);
const util_1 = __webpack_require__(86824);
const error = {
    message: "property name must be valid",
    params: ({ params }) => (0, codegen_1._) `{propertyName: ${params.propertyName}}`,
};
const def = {
    keyword: "propertyNames",
    type: "object",
    schemaType: ["object", "boolean"],
    error,
    code(cxt) {
        const { gen, schema, data, it } = cxt;
        if ((0, util_1.alwaysValidSchema)(it, schema))
            return;
        const valid = gen.name("valid");
        gen.forIn("key", data, (key) => {
            cxt.setParams({ propertyName: key });
            cxt.subschema({
                keyword: "propertyNames",
                data: key,
                dataTypes: ["string"],
                propertyName: key,
                compositeRule: true,
            }, valid);
            gen.if((0, codegen_1.not)(valid), () => {
                cxt.error(true);
                if (!it.allErrors)
                    gen.break();
            });
        });
        cxt.ok(valid);
    },
};
exports["default"] = def;
//# sourceMappingURL=propertyNames.js.map

/***/ }),

/***/ 38227:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const util_1 = __webpack_require__(86824);
const def = {
    keyword: ["then", "else"],
    schemaType: ["object", "boolean"],
    code({ keyword, parentSchema, it }) {
        if (parentSchema.if === undefined)
            (0, util_1.checkStrictMode)(it, `"${keyword}" without "if" is ignored`);
    },
};
exports["default"] = def;
//# sourceMappingURL=thenElse.js.map

/***/ }),

/***/ 68185:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.validateUnion = exports.validateArray = exports.usePattern = exports.callValidateCode = exports.schemaProperties = exports.allSchemaProperties = exports.noPropertyInData = exports.propertyInData = exports.isOwnProperty = exports.hasPropFunc = exports.reportMissingProp = exports.checkMissingProp = exports.checkReportMissingProp = void 0;
const codegen_1 = __webpack_require__(61089);
const util_1 = __webpack_require__(86824);
const names_1 = __webpack_require__(16842);
const util_2 = __webpack_require__(86824);
function checkReportMissingProp(cxt, prop) {
    const { gen, data, it } = cxt;
    gen.if(noPropertyInData(gen, data, prop, it.opts.ownProperties), () => {
        cxt.setParams({ missingProperty: (0, codegen_1._) `${prop}` }, true);
        cxt.error();
    });
}
exports.checkReportMissingProp = checkReportMissingProp;
function checkMissingProp({ gen, data, it: { opts } }, properties, missing) {
    return (0, codegen_1.or)(...properties.map((prop) => (0, codegen_1.and)(noPropertyInData(gen, data, prop, opts.ownProperties), (0, codegen_1._) `${missing} = ${prop}`)));
}
exports.checkMissingProp = checkMissingProp;
function reportMissingProp(cxt, missing) {
    cxt.setParams({ missingProperty: missing }, true);
    cxt.error();
}
exports.reportMissingProp = reportMissingProp;
function hasPropFunc(gen) {
    return gen.scopeValue("func", {
        // eslint-disable-next-line @typescript-eslint/unbound-method
        ref: Object.prototype.hasOwnProperty,
        code: (0, codegen_1._) `Object.prototype.hasOwnProperty`,
    });
}
exports.hasPropFunc = hasPropFunc;
function isOwnProperty(gen, data, property) {
    return (0, codegen_1._) `${hasPropFunc(gen)}.call(${data}, ${property})`;
}
exports.isOwnProperty = isOwnProperty;
function propertyInData(gen, data, property, ownProperties) {
    const cond = (0, codegen_1._) `${data}${(0, codegen_1.getProperty)(property)} !== undefined`;
    return ownProperties ? (0, codegen_1._) `${cond} && ${isOwnProperty(gen, data, property)}` : cond;
}
exports.propertyInData = propertyInData;
function noPropertyInData(gen, data, property, ownProperties) {
    const cond = (0, codegen_1._) `${data}${(0, codegen_1.getProperty)(property)} === undefined`;
    return ownProperties ? (0, codegen_1.or)(cond, (0, codegen_1.not)(isOwnProperty(gen, data, property))) : cond;
}
exports.noPropertyInData = noPropertyInData;
function allSchemaProperties(schemaMap) {
    return schemaMap ? Object.keys(schemaMap).filter((p) => p !== "__proto__") : [];
}
exports.allSchemaProperties = allSchemaProperties;
function schemaProperties(it, schemaMap) {
    return allSchemaProperties(schemaMap).filter((p) => !(0, util_1.alwaysValidSchema)(it, schemaMap[p]));
}
exports.schemaProperties = schemaProperties;
function callValidateCode({ schemaCode, data, it: { gen, topSchemaRef, schemaPath, errorPath }, it }, func, context, passSchema) {
    const dataAndSchema = passSchema ? (0, codegen_1._) `${schemaCode}, ${data}, ${topSchemaRef}${schemaPath}` : data;
    const valCxt = [
        [names_1.default.instancePath, (0, codegen_1.strConcat)(names_1.default.instancePath, errorPath)],
        [names_1.default.parentData, it.parentData],
        [names_1.default.parentDataProperty, it.parentDataProperty],
        [names_1.default.rootData, names_1.default.rootData],
    ];
    if (it.opts.dynamicRef)
        valCxt.push([names_1.default.dynamicAnchors, names_1.default.dynamicAnchors]);
    const args = (0, codegen_1._) `${dataAndSchema}, ${gen.object(...valCxt)}`;
    return context !== codegen_1.nil ? (0, codegen_1._) `${func}.call(${context}, ${args})` : (0, codegen_1._) `${func}(${args})`;
}
exports.callValidateCode = callValidateCode;
const newRegExp = (0, codegen_1._) `new RegExp`;
function usePattern({ gen, it: { opts } }, pattern) {
    const u = opts.unicodeRegExp ? "u" : "";
    const { regExp } = opts.code;
    const rx = regExp(pattern, u);
    return gen.scopeValue("pattern", {
        key: rx.toString(),
        ref: rx,
        code: (0, codegen_1._) `${regExp.code === "new RegExp" ? newRegExp : (0, util_2.useFunc)(gen, regExp)}(${pattern}, ${u})`,
    });
}
exports.usePattern = usePattern;
function validateArray(cxt) {
    const { gen, data, keyword, it } = cxt;
    const valid = gen.name("valid");
    if (it.allErrors) {
        const validArr = gen.let("valid", true);
        validateItems(() => gen.assign(validArr, false));
        return validArr;
    }
    gen.var(valid, true);
    validateItems(() => gen.break());
    return valid;
    function validateItems(notValid) {
        const len = gen.const("len", (0, codegen_1._) `${data}.length`);
        gen.forRange("i", 0, len, (i) => {
            cxt.subschema({
                keyword,
                dataProp: i,
                dataPropType: util_1.Type.Num,
            }, valid);
            gen.if((0, codegen_1.not)(valid), notValid);
        });
    }
}
exports.validateArray = validateArray;
function validateUnion(cxt) {
    const { gen, schema, keyword, it } = cxt;
    /* istanbul ignore if */
    if (!Array.isArray(schema))
        throw new Error("ajv implementation error");
    const alwaysValid = schema.some((sch) => (0, util_1.alwaysValidSchema)(it, sch));
    if (alwaysValid && !it.opts.unevaluated)
        return;
    const valid = gen.let("valid", false);
    const schValid = gen.name("_valid");
    gen.block(() => schema.forEach((_sch, i) => {
        const schCxt = cxt.subschema({
            keyword,
            schemaProp: i,
            compositeRule: true,
        }, schValid);
        gen.assign(valid, (0, codegen_1._) `${valid} || ${schValid}`);
        const merged = cxt.mergeValidEvaluated(schCxt, schValid);
        // can short-circuit if `unevaluatedProperties/Items` not supported (opts.unevaluated !== true)
        // or if all properties and items were evaluated (it.props === true && it.items === true)
        if (!merged)
            gen.if((0, codegen_1.not)(valid));
    }));
    cxt.result(valid, () => cxt.reset(), () => cxt.error(true));
}
exports.validateUnion = validateUnion;
//# sourceMappingURL=code.js.map

/***/ }),

/***/ 31240:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const def = {
    keyword: "id",
    code() {
        throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
    },
};
exports["default"] = def;
//# sourceMappingURL=id.js.map

/***/ }),

/***/ 74176:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const id_1 = __webpack_require__(31240);
const ref_1 = __webpack_require__(31578);
const core = [
    "$schema",
    "$id",
    "$defs",
    "$vocabulary",
    { keyword: "$comment" },
    "definitions",
    id_1.default,
    ref_1.default,
];
exports["default"] = core;
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 31578:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.callRef = exports.getValidate = void 0;
const ref_error_1 = __webpack_require__(60010);
const code_1 = __webpack_require__(68185);
const codegen_1 = __webpack_require__(61089);
const names_1 = __webpack_require__(16842);
const compile_1 = __webpack_require__(84029);
const util_1 = __webpack_require__(86824);
const def = {
    keyword: "$ref",
    schemaType: "string",
    code(cxt) {
        const { gen, schema: $ref, it } = cxt;
        const { baseId, schemaEnv: env, validateName, opts, self } = it;
        const { root } = env;
        if (($ref === "#" || $ref === "#/") && baseId === root.baseId)
            return callRootRef();
        const schOrEnv = compile_1.resolveRef.call(self, root, baseId, $ref);
        if (schOrEnv === undefined)
            throw new ref_error_1.default(it.opts.uriResolver, baseId, $ref);
        if (schOrEnv instanceof compile_1.SchemaEnv)
            return callValidate(schOrEnv);
        return inlineRefSchema(schOrEnv);
        function callRootRef() {
            if (env === root)
                return callRef(cxt, validateName, env, env.$async);
            const rootName = gen.scopeValue("root", { ref: root });
            return callRef(cxt, (0, codegen_1._) `${rootName}.validate`, root, root.$async);
        }
        function callValidate(sch) {
            const v = getValidate(cxt, sch);
            callRef(cxt, v, sch, sch.$async);
        }
        function inlineRefSchema(sch) {
            const schName = gen.scopeValue("schema", opts.code.source === true ? { ref: sch, code: (0, codegen_1.stringify)(sch) } : { ref: sch });
            const valid = gen.name("valid");
            const schCxt = cxt.subschema({
                schema: sch,
                dataTypes: [],
                schemaPath: codegen_1.nil,
                topSchemaRef: schName,
                errSchemaPath: $ref,
            }, valid);
            cxt.mergeEvaluated(schCxt);
            cxt.ok(valid);
        }
    },
};
function getValidate(cxt, sch) {
    const { gen } = cxt;
    return sch.validate
        ? gen.scopeValue("validate", { ref: sch.validate })
        : (0, codegen_1._) `${gen.scopeValue("wrapper", { ref: sch })}.validate`;
}
exports.getValidate = getValidate;
function callRef(cxt, v, sch, $async) {
    const { gen, it } = cxt;
    const { allErrors, schemaEnv: env, opts } = it;
    const passCxt = opts.passContext ? names_1.default.this : codegen_1.nil;
    if ($async)
        callAsyncRef();
    else
        callSyncRef();
    function callAsyncRef() {
        if (!env.$async)
            throw new Error("async schema referenced by sync schema");
        const valid = gen.let("valid");
        gen.try(() => {
            gen.code((0, codegen_1._) `await ${(0, code_1.callValidateCode)(cxt, v, passCxt)}`);
            addEvaluatedFrom(v); // TODO will not work with async, it has to be returned with the result
            if (!allErrors)
                gen.assign(valid, true);
        }, (e) => {
            gen.if((0, codegen_1._) `!(${e} instanceof ${it.ValidationError})`, () => gen.throw(e));
            addErrorsFrom(e);
            if (!allErrors)
                gen.assign(valid, false);
        });
        cxt.ok(valid);
    }
    function callSyncRef() {
        cxt.result((0, code_1.callValidateCode)(cxt, v, passCxt), () => addEvaluatedFrom(v), () => addErrorsFrom(v));
    }
    function addErrorsFrom(source) {
        const errs = (0, codegen_1._) `${source}.errors`;
        gen.assign(names_1.default.vErrors, (0, codegen_1._) `${names_1.default.vErrors} === null ? ${errs} : ${names_1.default.vErrors}.concat(${errs})`); // TODO tagged
        gen.assign(names_1.default.errors, (0, codegen_1._) `${names_1.default.vErrors}.length`);
    }
    function addEvaluatedFrom(source) {
        var _a;
        if (!it.opts.unevaluated)
            return;
        const schEvaluated = (_a = sch === null || sch === void 0 ? void 0 : sch.validate) === null || _a === void 0 ? void 0 : _a.evaluated;
        // TODO refactor
        if (it.props !== true) {
            if (schEvaluated && !schEvaluated.dynamicProps) {
                if (schEvaluated.props !== undefined) {
                    it.props = util_1.mergeEvaluated.props(gen, schEvaluated.props, it.props);
                }
            }
            else {
                const props = gen.var("props", (0, codegen_1._) `${source}.evaluated.props`);
                it.props = util_1.mergeEvaluated.props(gen, props, it.props, codegen_1.Name);
            }
        }
        if (it.items !== true) {
            if (schEvaluated && !schEvaluated.dynamicItems) {
                if (schEvaluated.items !== undefined) {
                    it.items = util_1.mergeEvaluated.items(gen, schEvaluated.items, it.items);
                }
            }
            else {
                const items = gen.var("items", (0, codegen_1._) `${source}.evaluated.items`);
                it.items = util_1.mergeEvaluated.items(gen, items, it.items, codegen_1.Name);
            }
        }
    }
}
exports.callRef = callRef;
exports["default"] = def;
//# sourceMappingURL=ref.js.map

/***/ }),

/***/ 8622:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const codegen_1 = __webpack_require__(61089);
const types_1 = __webpack_require__(5485);
const compile_1 = __webpack_require__(84029);
const util_1 = __webpack_require__(86824);
const error = {
    message: ({ params: { discrError, tagName } }) => discrError === types_1.DiscrError.Tag
        ? `tag "${tagName}" must be string`
        : `value of tag "${tagName}" must be in oneOf`,
    params: ({ params: { discrError, tag, tagName } }) => (0, codegen_1._) `{error: ${discrError}, tag: ${tagName}, tagValue: ${tag}}`,
};
const def = {
    keyword: "discriminator",
    type: "object",
    schemaType: "object",
    error,
    code(cxt) {
        const { gen, data, schema, parentSchema, it } = cxt;
        const { oneOf } = parentSchema;
        if (!it.opts.discriminator) {
            throw new Error("discriminator: requires discriminator option");
        }
        const tagName = schema.propertyName;
        if (typeof tagName != "string")
            throw new Error("discriminator: requires propertyName");
        if (schema.mapping)
            throw new Error("discriminator: mapping is not supported");
        if (!oneOf)
            throw new Error("discriminator: requires oneOf keyword");
        const valid = gen.let("valid", false);
        const tag = gen.const("tag", (0, codegen_1._) `${data}${(0, codegen_1.getProperty)(tagName)}`);
        gen.if((0, codegen_1._) `typeof ${tag} == "string"`, () => validateMapping(), () => cxt.error(false, { discrError: types_1.DiscrError.Tag, tag, tagName }));
        cxt.ok(valid);
        function validateMapping() {
            const mapping = getMapping();
            gen.if(false);
            for (const tagValue in mapping) {
                gen.elseIf((0, codegen_1._) `${tag} === ${tagValue}`);
                gen.assign(valid, applyTagSchema(mapping[tagValue]));
            }
            gen.else();
            cxt.error(false, { discrError: types_1.DiscrError.Mapping, tag, tagName });
            gen.endIf();
        }
        function applyTagSchema(schemaProp) {
            const _valid = gen.name("valid");
            const schCxt = cxt.subschema({ keyword: "oneOf", schemaProp }, _valid);
            cxt.mergeEvaluated(schCxt, codegen_1.Name);
            return _valid;
        }
        function getMapping() {
            var _a;
            const oneOfMapping = {};
            const topRequired = hasRequired(parentSchema);
            let tagRequired = true;
            for (let i = 0; i < oneOf.length; i++) {
                let sch = oneOf[i];
                if ((sch === null || sch === void 0 ? void 0 : sch.$ref) && !(0, util_1.schemaHasRulesButRef)(sch, it.self.RULES)) {
                    sch = compile_1.resolveRef.call(it.self, it.schemaEnv.root, it.baseId, sch === null || sch === void 0 ? void 0 : sch.$ref);
                    if (sch instanceof compile_1.SchemaEnv)
                        sch = sch.schema;
                }
                const propSch = (_a = sch === null || sch === void 0 ? void 0 : sch.properties) === null || _a === void 0 ? void 0 : _a[tagName];
                if (typeof propSch != "object") {
                    throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${tagName}"`);
                }
                tagRequired = tagRequired && (topRequired || hasRequired(sch));
                addMappings(propSch, i);
            }
            if (!tagRequired)
                throw new Error(`discriminator: "${tagName}" must be required`);
            return oneOfMapping;
            function hasRequired({ required }) {
                return Array.isArray(required) && required.includes(tagName);
            }
            function addMappings(sch, i) {
                if (sch.const) {
                    addMapping(sch.const, i);
                }
                else if (sch.enum) {
                    for (const tagValue of sch.enum) {
                        addMapping(tagValue, i);
                    }
                }
                else {
                    throw new Error(`discriminator: "properties/${tagName}" must have "const" or "enum"`);
                }
            }
            function addMapping(tagValue, i) {
                if (typeof tagValue != "string" || tagValue in oneOfMapping) {
                    throw new Error(`discriminator: "${tagName}" values must be unique strings`);
                }
                oneOfMapping[tagValue] = i;
            }
        }
    },
};
exports["default"] = def;
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 5485:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DiscrError = void 0;
var DiscrError;
(function (DiscrError) {
    DiscrError["Tag"] = "tag";
    DiscrError["Mapping"] = "mapping";
})(DiscrError = exports.DiscrError || (exports.DiscrError = {}));
//# sourceMappingURL=types.js.map

/***/ }),

/***/ 44840:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const core_1 = __webpack_require__(74176);
const validation_1 = __webpack_require__(87271);
const applicator_1 = __webpack_require__(39322);
const format_1 = __webpack_require__(17047);
const metadata_1 = __webpack_require__(53936);
const draft7Vocabularies = [
    core_1.default,
    validation_1.default,
    (0, applicator_1.default)(),
    format_1.default,
    metadata_1.metadataVocabulary,
    metadata_1.contentVocabulary,
];
exports["default"] = draft7Vocabularies;
//# sourceMappingURL=draft7.js.map

/***/ }),

/***/ 896:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const codegen_1 = __webpack_require__(61089);
const error = {
    message: ({ schemaCode }) => (0, codegen_1.str) `must match format "${schemaCode}"`,
    params: ({ schemaCode }) => (0, codegen_1._) `{format: ${schemaCode}}`,
};
const def = {
    keyword: "format",
    type: ["number", "string"],
    schemaType: "string",
    $data: true,
    error,
    code(cxt, ruleType) {
        const { gen, data, $data, schema, schemaCode, it } = cxt;
        const { opts, errSchemaPath, schemaEnv, self } = it;
        if (!opts.validateFormats)
            return;
        if ($data)
            validate$DataFormat();
        else
            validateFormat();
        function validate$DataFormat() {
            const fmts = gen.scopeValue("formats", {
                ref: self.formats,
                code: opts.code.formats,
            });
            const fDef = gen.const("fDef", (0, codegen_1._) `${fmts}[${schemaCode}]`);
            const fType = gen.let("fType");
            const format = gen.let("format");
            // TODO simplify
            gen.if((0, codegen_1._) `typeof ${fDef} == "object" && !(${fDef} instanceof RegExp)`, () => gen.assign(fType, (0, codegen_1._) `${fDef}.type || "string"`).assign(format, (0, codegen_1._) `${fDef}.validate`), () => gen.assign(fType, (0, codegen_1._) `"string"`).assign(format, fDef));
            cxt.fail$data((0, codegen_1.or)(unknownFmt(), invalidFmt()));
            function unknownFmt() {
                if (opts.strictSchema === false)
                    return codegen_1.nil;
                return (0, codegen_1._) `${schemaCode} && !${format}`;
            }
            function invalidFmt() {
                const callFormat = schemaEnv.$async
                    ? (0, codegen_1._) `(${fDef}.async ? await ${format}(${data}) : ${format}(${data}))`
                    : (0, codegen_1._) `${format}(${data})`;
                const validData = (0, codegen_1._) `(typeof ${format} == "function" ? ${callFormat} : ${format}.test(${data}))`;
                return (0, codegen_1._) `${format} && ${format} !== true && ${fType} === ${ruleType} && !${validData}`;
            }
        }
        function validateFormat() {
            const formatDef = self.formats[schema];
            if (!formatDef) {
                unknownFormat();
                return;
            }
            if (formatDef === true)
                return;
            const [fmtType, format, fmtRef] = getFormat(formatDef);
            if (fmtType === ruleType)
                cxt.pass(validCondition());
            function unknownFormat() {
                if (opts.strictSchema === false) {
                    self.logger.warn(unknownMsg());
                    return;
                }
                throw new Error(unknownMsg());
                function unknownMsg() {
                    return `unknown format "${schema}" ignored in schema at path "${errSchemaPath}"`;
                }
            }
            function getFormat(fmtDef) {
                const code = fmtDef instanceof RegExp
                    ? (0, codegen_1.regexpCode)(fmtDef)
                    : opts.code.formats
                        ? (0, codegen_1._) `${opts.code.formats}${(0, codegen_1.getProperty)(schema)}`
                        : undefined;
                const fmt = gen.scopeValue("formats", { key: schema, ref: fmtDef, code });
                if (typeof fmtDef == "object" && !(fmtDef instanceof RegExp)) {
                    return [fmtDef.type || "string", fmtDef.validate, (0, codegen_1._) `${fmt}.validate`];
                }
                return ["string", fmtDef, fmt];
            }
            function validCondition() {
                if (typeof formatDef == "object" && !(formatDef instanceof RegExp) && formatDef.async) {
                    if (!schemaEnv.$async)
                        throw new Error("async format in sync schema");
                    return (0, codegen_1._) `await ${fmtRef}(${data})`;
                }
                return typeof format == "function" ? (0, codegen_1._) `${fmtRef}(${data})` : (0, codegen_1._) `${fmtRef}.test(${data})`;
            }
        }
    },
};
exports["default"] = def;
//# sourceMappingURL=format.js.map

/***/ }),

/***/ 17047:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const format_1 = __webpack_require__(896);
const format = [format_1.default];
exports["default"] = format;
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 53936:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.contentVocabulary = exports.metadataVocabulary = void 0;
exports.metadataVocabulary = [
    "title",
    "description",
    "default",
    "deprecated",
    "readOnly",
    "writeOnly",
    "examples",
];
exports.contentVocabulary = [
    "contentMediaType",
    "contentEncoding",
    "contentSchema",
];
//# sourceMappingURL=metadata.js.map

/***/ }),

/***/ 11211:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const codegen_1 = __webpack_require__(61089);
const util_1 = __webpack_require__(86824);
const equal_1 = __webpack_require__(33839);
const error = {
    message: "must be equal to constant",
    params: ({ schemaCode }) => (0, codegen_1._) `{allowedValue: ${schemaCode}}`,
};
const def = {
    keyword: "const",
    $data: true,
    error,
    code(cxt) {
        const { gen, data, $data, schemaCode, schema } = cxt;
        if ($data || (schema && typeof schema == "object")) {
            cxt.fail$data((0, codegen_1._) `!${(0, util_1.useFunc)(gen, equal_1.default)}(${data}, ${schemaCode})`);
        }
        else {
            cxt.fail((0, codegen_1._) `${schema} !== ${data}`);
        }
    },
};
exports["default"] = def;
//# sourceMappingURL=const.js.map

/***/ }),

/***/ 81835:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const codegen_1 = __webpack_require__(61089);
const util_1 = __webpack_require__(86824);
const equal_1 = __webpack_require__(33839);
const error = {
    message: "must be equal to one of the allowed values",
    params: ({ schemaCode }) => (0, codegen_1._) `{allowedValues: ${schemaCode}}`,
};
const def = {
    keyword: "enum",
    schemaType: "array",
    $data: true,
    error,
    code(cxt) {
        const { gen, data, $data, schema, schemaCode, it } = cxt;
        if (!$data && schema.length === 0)
            throw new Error("enum must have non-empty array");
        const useLoop = schema.length >= it.opts.loopEnum;
        let eql;
        const getEql = () => (eql !== null && eql !== void 0 ? eql : (eql = (0, util_1.useFunc)(gen, equal_1.default)));
        let valid;
        if (useLoop || $data) {
            valid = gen.let("valid");
            cxt.block$data(valid, loopEnum);
        }
        else {
            /* istanbul ignore if */
            if (!Array.isArray(schema))
                throw new Error("ajv implementation error");
            const vSchema = gen.const("vSchema", schemaCode);
            valid = (0, codegen_1.or)(...schema.map((_x, i) => equalCode(vSchema, i)));
        }
        cxt.pass(valid);
        function loopEnum() {
            gen.assign(valid, false);
            gen.forOf("v", schemaCode, (v) => gen.if((0, codegen_1._) `${getEql()}(${data}, ${v})`, () => gen.assign(valid, true).break()));
        }
        function equalCode(vSchema, i) {
            const sch = schema[i];
            return typeof sch === "object" && sch !== null
                ? (0, codegen_1._) `${getEql()}(${data}, ${vSchema}[${i}])`
                : (0, codegen_1._) `${data} === ${sch}`;
        }
    },
};
exports["default"] = def;
//# sourceMappingURL=enum.js.map

/***/ }),

/***/ 87271:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const limitNumber_1 = __webpack_require__(90094);
const multipleOf_1 = __webpack_require__(89696);
const limitLength_1 = __webpack_require__(23716);
const pattern_1 = __webpack_require__(54622);
const limitProperties_1 = __webpack_require__(66784);
const required_1 = __webpack_require__(84888);
const limitItems_1 = __webpack_require__(19202);
const uniqueItems_1 = __webpack_require__(4218);
const const_1 = __webpack_require__(11211);
const enum_1 = __webpack_require__(81835);
const validation = [
    // number
    limitNumber_1.default,
    multipleOf_1.default,
    // string
    limitLength_1.default,
    pattern_1.default,
    // object
    limitProperties_1.default,
    required_1.default,
    // array
    limitItems_1.default,
    uniqueItems_1.default,
    // any
    { keyword: "type", schemaType: ["string", "array"] },
    { keyword: "nullable", schemaType: "boolean" },
    const_1.default,
    enum_1.default,
];
exports["default"] = validation;
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 19202:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const codegen_1 = __webpack_require__(61089);
const error = {
    message({ keyword, schemaCode }) {
        const comp = keyword === "maxItems" ? "more" : "fewer";
        return (0, codegen_1.str) `must NOT have ${comp} than ${schemaCode} items`;
    },
    params: ({ schemaCode }) => (0, codegen_1._) `{limit: ${schemaCode}}`,
};
const def = {
    keyword: ["maxItems", "minItems"],
    type: "array",
    schemaType: "number",
    $data: true,
    error,
    code(cxt) {
        const { keyword, data, schemaCode } = cxt;
        const op = keyword === "maxItems" ? codegen_1.operators.GT : codegen_1.operators.LT;
        cxt.fail$data((0, codegen_1._) `${data}.length ${op} ${schemaCode}`);
    },
};
exports["default"] = def;
//# sourceMappingURL=limitItems.js.map

/***/ }),

/***/ 23716:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const codegen_1 = __webpack_require__(61089);
const util_1 = __webpack_require__(86824);
const ucs2length_1 = __webpack_require__(1987);
const error = {
    message({ keyword, schemaCode }) {
        const comp = keyword === "maxLength" ? "more" : "fewer";
        return (0, codegen_1.str) `must NOT have ${comp} than ${schemaCode} characters`;
    },
    params: ({ schemaCode }) => (0, codegen_1._) `{limit: ${schemaCode}}`,
};
const def = {
    keyword: ["maxLength", "minLength"],
    type: "string",
    schemaType: "number",
    $data: true,
    error,
    code(cxt) {
        const { keyword, data, schemaCode, it } = cxt;
        const op = keyword === "maxLength" ? codegen_1.operators.GT : codegen_1.operators.LT;
        const len = it.opts.unicode === false ? (0, codegen_1._) `${data}.length` : (0, codegen_1._) `${(0, util_1.useFunc)(cxt.gen, ucs2length_1.default)}(${data})`;
        cxt.fail$data((0, codegen_1._) `${len} ${op} ${schemaCode}`);
    },
};
exports["default"] = def;
//# sourceMappingURL=limitLength.js.map

/***/ }),

/***/ 90094:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const codegen_1 = __webpack_require__(61089);
const ops = codegen_1.operators;
const KWDs = {
    maximum: { okStr: "<=", ok: ops.LTE, fail: ops.GT },
    minimum: { okStr: ">=", ok: ops.GTE, fail: ops.LT },
    exclusiveMaximum: { okStr: "<", ok: ops.LT, fail: ops.GTE },
    exclusiveMinimum: { okStr: ">", ok: ops.GT, fail: ops.LTE },
};
const error = {
    message: ({ keyword, schemaCode }) => (0, codegen_1.str) `must be ${KWDs[keyword].okStr} ${schemaCode}`,
    params: ({ keyword, schemaCode }) => (0, codegen_1._) `{comparison: ${KWDs[keyword].okStr}, limit: ${schemaCode}}`,
};
const def = {
    keyword: Object.keys(KWDs),
    type: "number",
    schemaType: "number",
    $data: true,
    error,
    code(cxt) {
        const { keyword, data, schemaCode } = cxt;
        cxt.fail$data((0, codegen_1._) `${data} ${KWDs[keyword].fail} ${schemaCode} || isNaN(${data})`);
    },
};
exports["default"] = def;
//# sourceMappingURL=limitNumber.js.map

/***/ }),

/***/ 66784:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const codegen_1 = __webpack_require__(61089);
const error = {
    message({ keyword, schemaCode }) {
        const comp = keyword === "maxProperties" ? "more" : "fewer";
        return (0, codegen_1.str) `must NOT have ${comp} than ${schemaCode} properties`;
    },
    params: ({ schemaCode }) => (0, codegen_1._) `{limit: ${schemaCode}}`,
};
const def = {
    keyword: ["maxProperties", "minProperties"],
    type: "object",
    schemaType: "number",
    $data: true,
    error,
    code(cxt) {
        const { keyword, data, schemaCode } = cxt;
        const op = keyword === "maxProperties" ? codegen_1.operators.GT : codegen_1.operators.LT;
        cxt.fail$data((0, codegen_1._) `Object.keys(${data}).length ${op} ${schemaCode}`);
    },
};
exports["default"] = def;
//# sourceMappingURL=limitProperties.js.map

/***/ }),

/***/ 89696:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const codegen_1 = __webpack_require__(61089);
const error = {
    message: ({ schemaCode }) => (0, codegen_1.str) `must be multiple of ${schemaCode}`,
    params: ({ schemaCode }) => (0, codegen_1._) `{multipleOf: ${schemaCode}}`,
};
const def = {
    keyword: "multipleOf",
    type: "number",
    schemaType: "number",
    $data: true,
    error,
    code(cxt) {
        const { gen, data, schemaCode, it } = cxt;
        // const bdt = bad$DataType(schemaCode, <string>def.schemaType, $data)
        const prec = it.opts.multipleOfPrecision;
        const res = gen.let("res");
        const invalid = prec
            ? (0, codegen_1._) `Math.abs(Math.round(${res}) - ${res}) > 1e-${prec}`
            : (0, codegen_1._) `${res} !== parseInt(${res})`;
        cxt.fail$data((0, codegen_1._) `(${schemaCode} === 0 || (${res} = ${data}/${schemaCode}, ${invalid}))`);
    },
};
exports["default"] = def;
//# sourceMappingURL=multipleOf.js.map

/***/ }),

/***/ 54622:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const code_1 = __webpack_require__(68185);
const codegen_1 = __webpack_require__(61089);
const error = {
    message: ({ schemaCode }) => (0, codegen_1.str) `must match pattern "${schemaCode}"`,
    params: ({ schemaCode }) => (0, codegen_1._) `{pattern: ${schemaCode}}`,
};
const def = {
    keyword: "pattern",
    type: "string",
    schemaType: "string",
    $data: true,
    error,
    code(cxt) {
        const { data, $data, schema, schemaCode, it } = cxt;
        // TODO regexp should be wrapped in try/catchs
        const u = it.opts.unicodeRegExp ? "u" : "";
        const regExp = $data ? (0, codegen_1._) `(new RegExp(${schemaCode}, ${u}))` : (0, code_1.usePattern)(cxt, schema);
        cxt.fail$data((0, codegen_1._) `!${regExp}.test(${data})`);
    },
};
exports["default"] = def;
//# sourceMappingURL=pattern.js.map

/***/ }),

/***/ 84888:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const code_1 = __webpack_require__(68185);
const codegen_1 = __webpack_require__(61089);
const util_1 = __webpack_require__(86824);
const error = {
    message: ({ params: { missingProperty } }) => (0, codegen_1.str) `must have required property '${missingProperty}'`,
    params: ({ params: { missingProperty } }) => (0, codegen_1._) `{missingProperty: ${missingProperty}}`,
};
const def = {
    keyword: "required",
    type: "object",
    schemaType: "array",
    $data: true,
    error,
    code(cxt) {
        const { gen, schema, schemaCode, data, $data, it } = cxt;
        const { opts } = it;
        if (!$data && schema.length === 0)
            return;
        const useLoop = schema.length >= opts.loopRequired;
        if (it.allErrors)
            allErrorsMode();
        else
            exitOnErrorMode();
        if (opts.strictRequired) {
            const props = cxt.parentSchema.properties;
            const { definedProperties } = cxt.it;
            for (const requiredKey of schema) {
                if ((props === null || props === void 0 ? void 0 : props[requiredKey]) === undefined && !definedProperties.has(requiredKey)) {
                    const schemaPath = it.schemaEnv.baseId + it.errSchemaPath;
                    const msg = `required property "${requiredKey}" is not defined at "${schemaPath}" (strictRequired)`;
                    (0, util_1.checkStrictMode)(it, msg, it.opts.strictRequired);
                }
            }
        }
        function allErrorsMode() {
            if (useLoop || $data) {
                cxt.block$data(codegen_1.nil, loopAllRequired);
            }
            else {
                for (const prop of schema) {
                    (0, code_1.checkReportMissingProp)(cxt, prop);
                }
            }
        }
        function exitOnErrorMode() {
            const missing = gen.let("missing");
            if (useLoop || $data) {
                const valid = gen.let("valid", true);
                cxt.block$data(valid, () => loopUntilMissing(missing, valid));
                cxt.ok(valid);
            }
            else {
                gen.if((0, code_1.checkMissingProp)(cxt, schema, missing));
                (0, code_1.reportMissingProp)(cxt, missing);
                gen.else();
            }
        }
        function loopAllRequired() {
            gen.forOf("prop", schemaCode, (prop) => {
                cxt.setParams({ missingProperty: prop });
                gen.if((0, code_1.noPropertyInData)(gen, data, prop, opts.ownProperties), () => cxt.error());
            });
        }
        function loopUntilMissing(missing, valid) {
            cxt.setParams({ missingProperty: missing });
            gen.forOf(missing, schemaCode, () => {
                gen.assign(valid, (0, code_1.propertyInData)(gen, data, missing, opts.ownProperties));
                gen.if((0, codegen_1.not)(valid), () => {
                    cxt.error();
                    gen.break();
                });
            }, codegen_1.nil);
        }
    },
};
exports["default"] = def;
//# sourceMappingURL=required.js.map

/***/ }),

/***/ 4218:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const dataType_1 = __webpack_require__(50723);
const codegen_1 = __webpack_require__(61089);
const util_1 = __webpack_require__(86824);
const equal_1 = __webpack_require__(33839);
const error = {
    message: ({ params: { i, j } }) => (0, codegen_1.str) `must NOT have duplicate items (items ## ${j} and ${i} are identical)`,
    params: ({ params: { i, j } }) => (0, codegen_1._) `{i: ${i}, j: ${j}}`,
};
const def = {
    keyword: "uniqueItems",
    type: "array",
    schemaType: "boolean",
    $data: true,
    error,
    code(cxt) {
        const { gen, data, $data, schema, parentSchema, schemaCode, it } = cxt;
        if (!$data && !schema)
            return;
        const valid = gen.let("valid");
        const itemTypes = parentSchema.items ? (0, dataType_1.getSchemaTypes)(parentSchema.items) : [];
        cxt.block$data(valid, validateUniqueItems, (0, codegen_1._) `${schemaCode} === false`);
        cxt.ok(valid);
        function validateUniqueItems() {
            const i = gen.let("i", (0, codegen_1._) `${data}.length`);
            const j = gen.let("j");
            cxt.setParams({ i, j });
            gen.assign(valid, true);
            gen.if((0, codegen_1._) `${i} > 1`, () => (canOptimize() ? loopN : loopN2)(i, j));
        }
        function canOptimize() {
            return itemTypes.length > 0 && !itemTypes.some((t) => t === "object" || t === "array");
        }
        function loopN(i, j) {
            const item = gen.name("item");
            const wrongType = (0, dataType_1.checkDataTypes)(itemTypes, item, it.opts.strictNumbers, dataType_1.DataType.Wrong);
            const indices = gen.const("indices", (0, codegen_1._) `{}`);
            gen.for((0, codegen_1._) `;${i}--;`, () => {
                gen.let(item, (0, codegen_1._) `${data}[${i}]`);
                gen.if(wrongType, (0, codegen_1._) `continue`);
                if (itemTypes.length > 1)
                    gen.if((0, codegen_1._) `typeof ${item} == "string"`, (0, codegen_1._) `${item} += "_"`);
                gen
                    .if((0, codegen_1._) `typeof ${indices}[${item}] == "number"`, () => {
                    gen.assign(j, (0, codegen_1._) `${indices}[${item}]`);
                    cxt.error();
                    gen.assign(valid, false).break();
                })
                    .code((0, codegen_1._) `${indices}[${item}] = ${i}`);
            });
        }
        function loopN2(i, j) {
            const eql = (0, util_1.useFunc)(gen, equal_1.default);
            const outer = gen.name("outer");
            gen.label(outer).for((0, codegen_1._) `;${i}--;`, () => gen.for((0, codegen_1._) `${j} = ${i}; ${j}--;`, () => gen.if((0, codegen_1._) `${eql}(${data}[${i}], ${data}[${j}])`, () => {
                cxt.error();
                gen.assign(valid, false).break(outer);
            })));
        }
    },
};
exports["default"] = def;
//# sourceMappingURL=uniqueItems.js.map

/***/ }),

/***/ 75226:
/***/ ((module, exports, __webpack_require__) => {

const nodeFetch = __webpack_require__(12837)
const realFetch = nodeFetch.default || nodeFetch

const fetch = function (url, options) {
  // Support schemaless URIs on the server for parity with the browser.
  // Ex: //github.com/ -> https://github.com/
  if (/^\/\//.test(url)) {
    url = 'https:' + url
  }
  return realFetch.call(this, url, options)
}

fetch.ponyfill = true

module.exports = exports = fetch
exports.fetch = fetch
exports.Headers = nodeFetch.Headers
exports.Request = nodeFetch.Request
exports.Response = nodeFetch.Response

// Needed for TypeScript consumers without esModuleInterop.
exports["default"] = fetch


/***/ }),

/***/ 54786:
/***/ ((module, exports, __webpack_require__) => {

/* eslint-env browser */

/**
 * This is the web browser implementation of `debug()`.
 */

exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = localstorage();
exports.destroy = (() => {
	let warned = false;

	return () => {
		if (!warned) {
			warned = true;
			console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
		}
	};
})();

/**
 * Colors.
 */

exports.colors = [
	'#0000CC',
	'#0000FF',
	'#0033CC',
	'#0033FF',
	'#0066CC',
	'#0066FF',
	'#0099CC',
	'#0099FF',
	'#00CC00',
	'#00CC33',
	'#00CC66',
	'#00CC99',
	'#00CCCC',
	'#00CCFF',
	'#3300CC',
	'#3300FF',
	'#3333CC',
	'#3333FF',
	'#3366CC',
	'#3366FF',
	'#3399CC',
	'#3399FF',
	'#33CC00',
	'#33CC33',
	'#33CC66',
	'#33CC99',
	'#33CCCC',
	'#33CCFF',
	'#6600CC',
	'#6600FF',
	'#6633CC',
	'#6633FF',
	'#66CC00',
	'#66CC33',
	'#9900CC',
	'#9900FF',
	'#9933CC',
	'#9933FF',
	'#99CC00',
	'#99CC33',
	'#CC0000',
	'#CC0033',
	'#CC0066',
	'#CC0099',
	'#CC00CC',
	'#CC00FF',
	'#CC3300',
	'#CC3333',
	'#CC3366',
	'#CC3399',
	'#CC33CC',
	'#CC33FF',
	'#CC6600',
	'#CC6633',
	'#CC9900',
	'#CC9933',
	'#CCCC00',
	'#CCCC33',
	'#FF0000',
	'#FF0033',
	'#FF0066',
	'#FF0099',
	'#FF00CC',
	'#FF00FF',
	'#FF3300',
	'#FF3333',
	'#FF3366',
	'#FF3399',
	'#FF33CC',
	'#FF33FF',
	'#FF6600',
	'#FF6633',
	'#FF9900',
	'#FF9933',
	'#FFCC00',
	'#FFCC33'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

// eslint-disable-next-line complexity
function useColors() {
	// NB: In an Electron preload script, document will be defined but not fully
	// initialized. Since we know we're in Chrome, we'll just detect this case
	// explicitly
	if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
		return true;
	}

	// Internet Explorer and Edge do not support colors.
	if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
		return false;
	}

	// Is webkit? http://stackoverflow.com/a/16459606/376773
	// document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
	return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
		// Is firebug? http://stackoverflow.com/a/398120/376773
		(typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
		// Is firefox >= v31?
		// https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
		(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
		// Double check webkit in userAgent just in case we are in a worker
		(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
	args[0] = (this.useColors ? '%c' : '') +
		this.namespace +
		(this.useColors ? ' %c' : ' ') +
		args[0] +
		(this.useColors ? '%c ' : ' ') +
		'+' + module.exports.humanize(this.diff);

	if (!this.useColors) {
		return;
	}

	const c = 'color: ' + this.color;
	args.splice(1, 0, c, 'color: inherit');

	// The final "%c" is somewhat tricky, because there could be other
	// arguments passed either before or after the %c, so we need to
	// figure out the correct index to insert the CSS into
	let index = 0;
	let lastC = 0;
	args[0].replace(/%[a-zA-Z%]/g, match => {
		if (match === '%%') {
			return;
		}
		index++;
		if (match === '%c') {
			// We only are interested in the *last* %c
			// (the user may have provided their own)
			lastC = index;
		}
	});

	args.splice(lastC, 0, c);
}

/**
 * Invokes `console.debug()` when available.
 * No-op when `console.debug` is not a "function".
 * If `console.debug` is not available, falls back
 * to `console.log`.
 *
 * @api public
 */
exports.log = console.debug || console.log || (() => {});

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */
function save(namespaces) {
	try {
		if (namespaces) {
			exports.storage.setItem('debug', namespaces);
		} else {
			exports.storage.removeItem('debug');
		}
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */
function load() {
	let r;
	try {
		r = exports.storage.getItem('debug');
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}

	// If debug isn't set in LS, and we're in Electron, try to load $DEBUG
	if (!r && typeof process !== 'undefined' && 'env' in process) {
		r = process.env.DEBUG;
	}

	return r;
}

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
	try {
		// TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
		// The Browser also has localStorage in the global context.
		return localStorage;
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}
}

module.exports = __webpack_require__(50509)(exports);

const {formatters} = module.exports;

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

formatters.j = function (v) {
	try {
		return JSON.stringify(v);
	} catch (error) {
		return '[UnexpectedJSONParseError]: ' + error.message;
	}
};


/***/ }),

/***/ 50509:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 */

function setup(env) {
	createDebug.debug = createDebug;
	createDebug.default = createDebug;
	createDebug.coerce = coerce;
	createDebug.disable = disable;
	createDebug.enable = enable;
	createDebug.enabled = enabled;
	createDebug.humanize = __webpack_require__(6269);
	createDebug.destroy = destroy;

	Object.keys(env).forEach(key => {
		createDebug[key] = env[key];
	});

	/**
	* The currently active debug mode names, and names to skip.
	*/

	createDebug.names = [];
	createDebug.skips = [];

	/**
	* Map of special "%n" handling functions, for the debug "format" argument.
	*
	* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
	*/
	createDebug.formatters = {};

	/**
	* Selects a color for a debug namespace
	* @param {String} namespace The namespace string for the debug instance to be colored
	* @return {Number|String} An ANSI color code for the given namespace
	* @api private
	*/
	function selectColor(namespace) {
		let hash = 0;

		for (let i = 0; i < namespace.length; i++) {
			hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
			hash |= 0; // Convert to 32bit integer
		}

		return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
	}
	createDebug.selectColor = selectColor;

	/**
	* Create a debugger with the given `namespace`.
	*
	* @param {String} namespace
	* @return {Function}
	* @api public
	*/
	function createDebug(namespace) {
		let prevTime;
		let enableOverride = null;
		let namespacesCache;
		let enabledCache;

		function debug(...args) {
			// Disabled?
			if (!debug.enabled) {
				return;
			}

			const self = debug;

			// Set `diff` timestamp
			const curr = Number(new Date());
			const ms = curr - (prevTime || curr);
			self.diff = ms;
			self.prev = prevTime;
			self.curr = curr;
			prevTime = curr;

			args[0] = createDebug.coerce(args[0]);

			if (typeof args[0] !== 'string') {
				// Anything else let's inspect with %O
				args.unshift('%O');
			}

			// Apply any `formatters` transformations
			let index = 0;
			args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
				// If we encounter an escaped % then don't increase the array index
				if (match === '%%') {
					return '%';
				}
				index++;
				const formatter = createDebug.formatters[format];
				if (typeof formatter === 'function') {
					const val = args[index];
					match = formatter.call(self, val);

					// Now we need to remove `args[index]` since it's inlined in the `format`
					args.splice(index, 1);
					index--;
				}
				return match;
			});

			// Apply env-specific formatting (colors, etc.)
			createDebug.formatArgs.call(self, args);

			const logFn = self.log || createDebug.log;
			logFn.apply(self, args);
		}

		debug.namespace = namespace;
		debug.useColors = createDebug.useColors();
		debug.color = createDebug.selectColor(namespace);
		debug.extend = extend;
		debug.destroy = createDebug.destroy; // XXX Temporary. Will be removed in the next major release.

		Object.defineProperty(debug, 'enabled', {
			enumerable: true,
			configurable: false,
			get: () => {
				if (enableOverride !== null) {
					return enableOverride;
				}
				if (namespacesCache !== createDebug.namespaces) {
					namespacesCache = createDebug.namespaces;
					enabledCache = createDebug.enabled(namespace);
				}

				return enabledCache;
			},
			set: v => {
				enableOverride = v;
			}
		});

		// Env-specific initialization logic for debug instances
		if (typeof createDebug.init === 'function') {
			createDebug.init(debug);
		}

		return debug;
	}

	function extend(namespace, delimiter) {
		const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
		newDebug.log = this.log;
		return newDebug;
	}

	/**
	* Enables a debug mode by namespaces. This can include modes
	* separated by a colon and wildcards.
	*
	* @param {String} namespaces
	* @api public
	*/
	function enable(namespaces) {
		createDebug.save(namespaces);
		createDebug.namespaces = namespaces;

		createDebug.names = [];
		createDebug.skips = [];

		let i;
		const split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
		const len = split.length;

		for (i = 0; i < len; i++) {
			if (!split[i]) {
				// ignore empty strings
				continue;
			}

			namespaces = split[i].replace(/\*/g, '.*?');

			if (namespaces[0] === '-') {
				createDebug.skips.push(new RegExp('^' + namespaces.slice(1) + '$'));
			} else {
				createDebug.names.push(new RegExp('^' + namespaces + '$'));
			}
		}
	}

	/**
	* Disable debug output.
	*
	* @return {String} namespaces
	* @api public
	*/
	function disable() {
		const namespaces = [
			...createDebug.names.map(toNamespace),
			...createDebug.skips.map(toNamespace).map(namespace => '-' + namespace)
		].join(',');
		createDebug.enable('');
		return namespaces;
	}

	/**
	* Returns true if the given mode name is enabled, false otherwise.
	*
	* @param {String} name
	* @return {Boolean}
	* @api public
	*/
	function enabled(name) {
		if (name[name.length - 1] === '*') {
			return true;
		}

		let i;
		let len;

		for (i = 0, len = createDebug.skips.length; i < len; i++) {
			if (createDebug.skips[i].test(name)) {
				return false;
			}
		}

		for (i = 0, len = createDebug.names.length; i < len; i++) {
			if (createDebug.names[i].test(name)) {
				return true;
			}
		}

		return false;
	}

	/**
	* Convert regexp to namespace
	*
	* @param {RegExp} regxep
	* @return {String} namespace
	* @api private
	*/
	function toNamespace(regexp) {
		return regexp.toString()
			.substring(2, regexp.toString().length - 2)
			.replace(/\.\*\?$/, '*');
	}

	/**
	* Coerce `val`.
	*
	* @param {Mixed} val
	* @return {Mixed}
	* @api private
	*/
	function coerce(val) {
		if (val instanceof Error) {
			return val.stack || val.message;
		}
		return val;
	}

	/**
	* XXX DO NOT USE. This is a temporary stub function.
	* XXX It WILL be removed in the next major release.
	*/
	function destroy() {
		console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
	}

	createDebug.enable(createDebug.load());

	return createDebug;
}

module.exports = setup;


/***/ }),

/***/ 23510:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Detect Electron renderer / nwjs process, which is node, but we should
 * treat as a browser.
 */

if (typeof process === 'undefined' || process.type === 'renderer' || process.browser === true || process.__nwjs) {
	module.exports = __webpack_require__(54786);
} else {
	module.exports = __webpack_require__(29923);
}


/***/ }),

/***/ 29923:
/***/ ((module, exports, __webpack_require__) => {

/**
 * Module dependencies.
 */

const tty = __webpack_require__(76224);
const util = __webpack_require__(73837);

/**
 * This is the Node.js implementation of `debug()`.
 */

exports.init = init;
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.destroy = util.deprecate(
	() => {},
	'Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.'
);

/**
 * Colors.
 */

exports.colors = [6, 2, 3, 4, 5, 1];

try {
	// Optional dependency (as in, doesn't need to be installed, NOT like optionalDependencies in package.json)
	// eslint-disable-next-line import/no-extraneous-dependencies
	const supportsColor = __webpack_require__(95427);

	if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
		exports.colors = [
			20,
			21,
			26,
			27,
			32,
			33,
			38,
			39,
			40,
			41,
			42,
			43,
			44,
			45,
			56,
			57,
			62,
			63,
			68,
			69,
			74,
			75,
			76,
			77,
			78,
			79,
			80,
			81,
			92,
			93,
			98,
			99,
			112,
			113,
			128,
			129,
			134,
			135,
			148,
			149,
			160,
			161,
			162,
			163,
			164,
			165,
			166,
			167,
			168,
			169,
			170,
			171,
			172,
			173,
			178,
			179,
			184,
			185,
			196,
			197,
			198,
			199,
			200,
			201,
			202,
			203,
			204,
			205,
			206,
			207,
			208,
			209,
			214,
			215,
			220,
			221
		];
	}
} catch (error) {
	// Swallow - we only care if `supports-color` is available; it doesn't have to be.
}

/**
 * Build up the default `inspectOpts` object from the environment variables.
 *
 *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
 */

exports.inspectOpts = Object.keys(process.env).filter(key => {
	return /^debug_/i.test(key);
}).reduce((obj, key) => {
	// Camel-case
	const prop = key
		.substring(6)
		.toLowerCase()
		.replace(/_([a-z])/g, (_, k) => {
			return k.toUpperCase();
		});

	// Coerce string value into JS value
	let val = process.env[key];
	if (/^(yes|on|true|enabled)$/i.test(val)) {
		val = true;
	} else if (/^(no|off|false|disabled)$/i.test(val)) {
		val = false;
	} else if (val === 'null') {
		val = null;
	} else {
		val = Number(val);
	}

	obj[prop] = val;
	return obj;
}, {});

/**
 * Is stdout a TTY? Colored output is enabled when `true`.
 */

function useColors() {
	return 'colors' in exports.inspectOpts ?
		Boolean(exports.inspectOpts.colors) :
		tty.isatty(process.stderr.fd);
}

/**
 * Adds ANSI color escape codes if enabled.
 *
 * @api public
 */

function formatArgs(args) {
	const {namespace: name, useColors} = this;

	if (useColors) {
		const c = this.color;
		const colorCode = '\u001B[3' + (c < 8 ? c : '8;5;' + c);
		const prefix = `  ${colorCode};1m${name} \u001B[0m`;

		args[0] = prefix + args[0].split('\n').join('\n' + prefix);
		args.push(colorCode + 'm+' + module.exports.humanize(this.diff) + '\u001B[0m');
	} else {
		args[0] = getDate() + name + ' ' + args[0];
	}
}

function getDate() {
	if (exports.inspectOpts.hideDate) {
		return '';
	}
	return new Date().toISOString() + ' ';
}

/**
 * Invokes `util.format()` with the specified arguments and writes to stderr.
 */

function log(...args) {
	return process.stderr.write(util.format(...args) + '\n');
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */
function save(namespaces) {
	if (namespaces) {
		process.env.DEBUG = namespaces;
	} else {
		// If you set a process.env field to null or undefined, it gets cast to the
		// string 'null' or 'undefined'. Just delete instead.
		delete process.env.DEBUG;
	}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
	return process.env.DEBUG;
}

/**
 * Init logic for `debug` instances.
 *
 * Create a new `inspectOpts` object in case `useColors` is set
 * differently for a particular `debug` instance.
 */

function init(debug) {
	debug.inspectOpts = {};

	const keys = Object.keys(exports.inspectOpts);
	for (let i = 0; i < keys.length; i++) {
		debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
	}
}

module.exports = __webpack_require__(50509)(exports);

const {formatters} = module.exports;

/**
 * Map %o to `util.inspect()`, all on a single line.
 */

formatters.o = function (v) {
	this.inspectOpts.colors = this.useColors;
	return util.inspect(v, this.inspectOpts)
		.split('\n')
		.map(str => str.trim())
		.join(' ');
};

/**
 * Map %O to `util.inspect()`, allowing multiple lines if needed.
 */

formatters.O = function (v) {
	this.inspectOpts.colors = this.useColors;
	return util.inspect(v, this.inspectOpts);
};


/***/ }),

/***/ 92417:
/***/ ((module) => {

"use strict";


// do not edit .js files directly - edit src/index.jst



module.exports = function equal(a, b) {
  if (a === b) return true;

  if (a && b && typeof a == 'object' && typeof b == 'object') {
    if (a.constructor !== b.constructor) return false;

    var length, i, keys;
    if (Array.isArray(a)) {
      length = a.length;
      if (length != b.length) return false;
      for (i = length; i-- !== 0;)
        if (!equal(a[i], b[i])) return false;
      return true;
    }



    if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
    if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
    if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();

    keys = Object.keys(a);
    length = keys.length;
    if (length !== Object.keys(b).length) return false;

    for (i = length; i-- !== 0;)
      if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;

    for (i = length; i-- !== 0;) {
      var key = keys[i];

      if (!equal(a[key], b[key])) return false;
    }

    return true;
  }

  // true if both NaN, false otherwise
  return a!==a && b!==b;
};


/***/ }),

/***/ 61802:
/***/ ((module) => {

"use strict";

module.exports = (flag, argv) => {
	argv = argv || process.argv;
	const prefix = flag.startsWith('-') ? '' : (flag.length === 1 ? '-' : '--');
	const pos = argv.indexOf(prefix + flag);
	const terminatorPos = argv.indexOf('--');
	return pos !== -1 && (terminatorPos === -1 ? true : pos < terminatorPos);
};


/***/ }),

/***/ 19358:
/***/ ((module) => {

"use strict";


var traverse = module.exports = function (schema, opts, cb) {
  // Legacy support for v0.3.1 and earlier.
  if (typeof opts == 'function') {
    cb = opts;
    opts = {};
  }

  cb = opts.cb || cb;
  var pre = (typeof cb == 'function') ? cb : cb.pre || function() {};
  var post = cb.post || function() {};

  _traverse(opts, pre, post, schema, '', schema);
};


traverse.keywords = {
  additionalItems: true,
  items: true,
  contains: true,
  additionalProperties: true,
  propertyNames: true,
  not: true,
  if: true,
  then: true,
  else: true
};

traverse.arrayKeywords = {
  items: true,
  allOf: true,
  anyOf: true,
  oneOf: true
};

traverse.propsKeywords = {
  $defs: true,
  definitions: true,
  properties: true,
  patternProperties: true,
  dependencies: true
};

traverse.skipKeywords = {
  default: true,
  enum: true,
  const: true,
  required: true,
  maximum: true,
  minimum: true,
  exclusiveMaximum: true,
  exclusiveMinimum: true,
  multipleOf: true,
  maxLength: true,
  minLength: true,
  pattern: true,
  format: true,
  maxItems: true,
  minItems: true,
  uniqueItems: true,
  maxProperties: true,
  minProperties: true
};


function _traverse(opts, pre, post, schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex) {
  if (schema && typeof schema == 'object' && !Array.isArray(schema)) {
    pre(schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
    for (var key in schema) {
      var sch = schema[key];
      if (Array.isArray(sch)) {
        if (key in traverse.arrayKeywords) {
          for (var i=0; i<sch.length; i++)
            _traverse(opts, pre, post, sch[i], jsonPtr + '/' + key + '/' + i, rootSchema, jsonPtr, key, schema, i);
        }
      } else if (key in traverse.propsKeywords) {
        if (sch && typeof sch == 'object') {
          for (var prop in sch)
            _traverse(opts, pre, post, sch[prop], jsonPtr + '/' + key + '/' + escapeJsonPtr(prop), rootSchema, jsonPtr, key, schema, prop);
        }
      } else if (key in traverse.keywords || (opts.allKeys && !(key in traverse.skipKeywords))) {
        _traverse(opts, pre, post, sch, jsonPtr + '/' + key, rootSchema, jsonPtr, key, schema);
      }
    }
    post(schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
  }
}


function escapeJsonPtr(str) {
  return str.replace(/~/g, '~0').replace(/\//g, '~1');
}


/***/ }),

/***/ 6269:
/***/ ((module) => {

/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var w = d * 7;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isFinite(val)) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'weeks':
    case 'week':
    case 'w':
      return n * w;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (msAbs >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (msAbs >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (msAbs >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return plural(ms, msAbs, d, 'day');
  }
  if (msAbs >= h) {
    return plural(ms, msAbs, h, 'hour');
  }
  if (msAbs >= m) {
    return plural(ms, msAbs, m, 'minute');
  }
  if (msAbs >= s) {
    return plural(ms, msAbs, s, 'second');
  }
  return ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, msAbs, n, name) {
  var isPlural = msAbs >= n * 1.5;
  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
}


/***/ }),

/***/ 12837:
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Stream = _interopDefault(__webpack_require__(12781));
var http = _interopDefault(__webpack_require__(13685));
var Url = _interopDefault(__webpack_require__(57310));
var whatwgUrl = _interopDefault(__webpack_require__(88533));
var https = _interopDefault(__webpack_require__(95687));
var zlib = _interopDefault(__webpack_require__(59796));

// Based on https://github.com/tmpvar/jsdom/blob/aa85b2abf07766ff7bf5c1f6daafb3726f2f2db5/lib/jsdom/living/blob.js

// fix for "Readable" isn't a named export issue
const Readable = Stream.Readable;

const BUFFER = Symbol('buffer');
const TYPE = Symbol('type');

class Blob {
	constructor() {
		this[TYPE] = '';

		const blobParts = arguments[0];
		const options = arguments[1];

		const buffers = [];
		let size = 0;

		if (blobParts) {
			const a = blobParts;
			const length = Number(a.length);
			for (let i = 0; i < length; i++) {
				const element = a[i];
				let buffer;
				if (element instanceof Buffer) {
					buffer = element;
				} else if (ArrayBuffer.isView(element)) {
					buffer = Buffer.from(element.buffer, element.byteOffset, element.byteLength);
				} else if (element instanceof ArrayBuffer) {
					buffer = Buffer.from(element);
				} else if (element instanceof Blob) {
					buffer = element[BUFFER];
				} else {
					buffer = Buffer.from(typeof element === 'string' ? element : String(element));
				}
				size += buffer.length;
				buffers.push(buffer);
			}
		}

		this[BUFFER] = Buffer.concat(buffers);

		let type = options && options.type !== undefined && String(options.type).toLowerCase();
		if (type && !/[^\u0020-\u007E]/.test(type)) {
			this[TYPE] = type;
		}
	}
	get size() {
		return this[BUFFER].length;
	}
	get type() {
		return this[TYPE];
	}
	text() {
		return Promise.resolve(this[BUFFER].toString());
	}
	arrayBuffer() {
		const buf = this[BUFFER];
		const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
		return Promise.resolve(ab);
	}
	stream() {
		const readable = new Readable();
		readable._read = function () {};
		readable.push(this[BUFFER]);
		readable.push(null);
		return readable;
	}
	toString() {
		return '[object Blob]';
	}
	slice() {
		const size = this.size;

		const start = arguments[0];
		const end = arguments[1];
		let relativeStart, relativeEnd;
		if (start === undefined) {
			relativeStart = 0;
		} else if (start < 0) {
			relativeStart = Math.max(size + start, 0);
		} else {
			relativeStart = Math.min(start, size);
		}
		if (end === undefined) {
			relativeEnd = size;
		} else if (end < 0) {
			relativeEnd = Math.max(size + end, 0);
		} else {
			relativeEnd = Math.min(end, size);
		}
		const span = Math.max(relativeEnd - relativeStart, 0);

		const buffer = this[BUFFER];
		const slicedBuffer = buffer.slice(relativeStart, relativeStart + span);
		const blob = new Blob([], { type: arguments[2] });
		blob[BUFFER] = slicedBuffer;
		return blob;
	}
}

Object.defineProperties(Blob.prototype, {
	size: { enumerable: true },
	type: { enumerable: true },
	slice: { enumerable: true }
});

Object.defineProperty(Blob.prototype, Symbol.toStringTag, {
	value: 'Blob',
	writable: false,
	enumerable: false,
	configurable: true
});

/**
 * fetch-error.js
 *
 * FetchError interface for operational errors
 */

/**
 * Create FetchError instance
 *
 * @param   String      message      Error message for human
 * @param   String      type         Error type for machine
 * @param   String      systemError  For Node.js system error
 * @return  FetchError
 */
function FetchError(message, type, systemError) {
  Error.call(this, message);

  this.message = message;
  this.type = type;

  // when err.type is `system`, err.code contains system error code
  if (systemError) {
    this.code = this.errno = systemError.code;
  }

  // hide custom error implementation details from end-users
  Error.captureStackTrace(this, this.constructor);
}

FetchError.prototype = Object.create(Error.prototype);
FetchError.prototype.constructor = FetchError;
FetchError.prototype.name = 'FetchError';

let convert;
try {
	convert = (__webpack_require__(35543).convert);
} catch (e) {}

const INTERNALS = Symbol('Body internals');

// fix an issue where "PassThrough" isn't a named export for node <10
const PassThrough = Stream.PassThrough;

/**
 * Body mixin
 *
 * Ref: https://fetch.spec.whatwg.org/#body
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */
function Body(body) {
	var _this = this;

	var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
	    _ref$size = _ref.size;

	let size = _ref$size === undefined ? 0 : _ref$size;
	var _ref$timeout = _ref.timeout;
	let timeout = _ref$timeout === undefined ? 0 : _ref$timeout;

	if (body == null) {
		// body is undefined or null
		body = null;
	} else if (isURLSearchParams(body)) {
		// body is a URLSearchParams
		body = Buffer.from(body.toString());
	} else if (isBlob(body)) ; else if (Buffer.isBuffer(body)) ; else if (Object.prototype.toString.call(body) === '[object ArrayBuffer]') {
		// body is ArrayBuffer
		body = Buffer.from(body);
	} else if (ArrayBuffer.isView(body)) {
		// body is ArrayBufferView
		body = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
	} else if (body instanceof Stream) ; else {
		// none of the above
		// coerce to string then buffer
		body = Buffer.from(String(body));
	}
	this[INTERNALS] = {
		body,
		disturbed: false,
		error: null
	};
	this.size = size;
	this.timeout = timeout;

	if (body instanceof Stream) {
		body.on('error', function (err) {
			const error = err.name === 'AbortError' ? err : new FetchError(`Invalid response body while trying to fetch ${_this.url}: ${err.message}`, 'system', err);
			_this[INTERNALS].error = error;
		});
	}
}

Body.prototype = {
	get body() {
		return this[INTERNALS].body;
	},

	get bodyUsed() {
		return this[INTERNALS].disturbed;
	},

	/**
  * Decode response as ArrayBuffer
  *
  * @return  Promise
  */
	arrayBuffer() {
		return consumeBody.call(this).then(function (buf) {
			return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
		});
	},

	/**
  * Return raw response as Blob
  *
  * @return Promise
  */
	blob() {
		let ct = this.headers && this.headers.get('content-type') || '';
		return consumeBody.call(this).then(function (buf) {
			return Object.assign(
			// Prevent copying
			new Blob([], {
				type: ct.toLowerCase()
			}), {
				[BUFFER]: buf
			});
		});
	},

	/**
  * Decode response as json
  *
  * @return  Promise
  */
	json() {
		var _this2 = this;

		return consumeBody.call(this).then(function (buffer) {
			try {
				return JSON.parse(buffer.toString());
			} catch (err) {
				return Body.Promise.reject(new FetchError(`invalid json response body at ${_this2.url} reason: ${err.message}`, 'invalid-json'));
			}
		});
	},

	/**
  * Decode response as text
  *
  * @return  Promise
  */
	text() {
		return consumeBody.call(this).then(function (buffer) {
			return buffer.toString();
		});
	},

	/**
  * Decode response as buffer (non-spec api)
  *
  * @return  Promise
  */
	buffer() {
		return consumeBody.call(this);
	},

	/**
  * Decode response as text, while automatically detecting the encoding and
  * trying to decode to UTF-8 (non-spec api)
  *
  * @return  Promise
  */
	textConverted() {
		var _this3 = this;

		return consumeBody.call(this).then(function (buffer) {
			return convertBody(buffer, _this3.headers);
		});
	}
};

// In browsers, all properties are enumerable.
Object.defineProperties(Body.prototype, {
	body: { enumerable: true },
	bodyUsed: { enumerable: true },
	arrayBuffer: { enumerable: true },
	blob: { enumerable: true },
	json: { enumerable: true },
	text: { enumerable: true }
});

Body.mixIn = function (proto) {
	for (const name of Object.getOwnPropertyNames(Body.prototype)) {
		// istanbul ignore else: future proof
		if (!(name in proto)) {
			const desc = Object.getOwnPropertyDescriptor(Body.prototype, name);
			Object.defineProperty(proto, name, desc);
		}
	}
};

/**
 * Consume and convert an entire Body to a Buffer.
 *
 * Ref: https://fetch.spec.whatwg.org/#concept-body-consume-body
 *
 * @return  Promise
 */
function consumeBody() {
	var _this4 = this;

	if (this[INTERNALS].disturbed) {
		return Body.Promise.reject(new TypeError(`body used already for: ${this.url}`));
	}

	this[INTERNALS].disturbed = true;

	if (this[INTERNALS].error) {
		return Body.Promise.reject(this[INTERNALS].error);
	}

	let body = this.body;

	// body is null
	if (body === null) {
		return Body.Promise.resolve(Buffer.alloc(0));
	}

	// body is blob
	if (isBlob(body)) {
		body = body.stream();
	}

	// body is buffer
	if (Buffer.isBuffer(body)) {
		return Body.Promise.resolve(body);
	}

	// istanbul ignore if: should never happen
	if (!(body instanceof Stream)) {
		return Body.Promise.resolve(Buffer.alloc(0));
	}

	// body is stream
	// get ready to actually consume the body
	let accum = [];
	let accumBytes = 0;
	let abort = false;

	return new Body.Promise(function (resolve, reject) {
		let resTimeout;

		// allow timeout on slow response body
		if (_this4.timeout) {
			resTimeout = setTimeout(function () {
				abort = true;
				reject(new FetchError(`Response timeout while trying to fetch ${_this4.url} (over ${_this4.timeout}ms)`, 'body-timeout'));
			}, _this4.timeout);
		}

		// handle stream errors
		body.on('error', function (err) {
			if (err.name === 'AbortError') {
				// if the request was aborted, reject with this Error
				abort = true;
				reject(err);
			} else {
				// other errors, such as incorrect content-encoding
				reject(new FetchError(`Invalid response body while trying to fetch ${_this4.url}: ${err.message}`, 'system', err));
			}
		});

		body.on('data', function (chunk) {
			if (abort || chunk === null) {
				return;
			}

			if (_this4.size && accumBytes + chunk.length > _this4.size) {
				abort = true;
				reject(new FetchError(`content size at ${_this4.url} over limit: ${_this4.size}`, 'max-size'));
				return;
			}

			accumBytes += chunk.length;
			accum.push(chunk);
		});

		body.on('end', function () {
			if (abort) {
				return;
			}

			clearTimeout(resTimeout);

			try {
				resolve(Buffer.concat(accum, accumBytes));
			} catch (err) {
				// handle streams that have accumulated too much data (issue #414)
				reject(new FetchError(`Could not create Buffer from response body for ${_this4.url}: ${err.message}`, 'system', err));
			}
		});
	});
}

/**
 * Detect buffer encoding and convert to target encoding
 * ref: http://www.w3.org/TR/2011/WD-html5-20110113/parsing.html#determining-the-character-encoding
 *
 * @param   Buffer  buffer    Incoming buffer
 * @param   String  encoding  Target encoding
 * @return  String
 */
function convertBody(buffer, headers) {
	if (typeof convert !== 'function') {
		throw new Error('The package `encoding` must be installed to use the textConverted() function');
	}

	const ct = headers.get('content-type');
	let charset = 'utf-8';
	let res, str;

	// header
	if (ct) {
		res = /charset=([^;]*)/i.exec(ct);
	}

	// no charset in content type, peek at response body for at most 1024 bytes
	str = buffer.slice(0, 1024).toString();

	// html5
	if (!res && str) {
		res = /<meta.+?charset=(['"])(.+?)\1/i.exec(str);
	}

	// html4
	if (!res && str) {
		res = /<meta[\s]+?http-equiv=(['"])content-type\1[\s]+?content=(['"])(.+?)\2/i.exec(str);
		if (!res) {
			res = /<meta[\s]+?content=(['"])(.+?)\1[\s]+?http-equiv=(['"])content-type\3/i.exec(str);
			if (res) {
				res.pop(); // drop last quote
			}
		}

		if (res) {
			res = /charset=(.*)/i.exec(res.pop());
		}
	}

	// xml
	if (!res && str) {
		res = /<\?xml.+?encoding=(['"])(.+?)\1/i.exec(str);
	}

	// found charset
	if (res) {
		charset = res.pop();

		// prevent decode issues when sites use incorrect encoding
		// ref: https://hsivonen.fi/encoding-menu/
		if (charset === 'gb2312' || charset === 'gbk') {
			charset = 'gb18030';
		}
	}

	// turn raw buffers into a single utf-8 buffer
	return convert(buffer, 'UTF-8', charset).toString();
}

/**
 * Detect a URLSearchParams object
 * ref: https://github.com/bitinn/node-fetch/issues/296#issuecomment-307598143
 *
 * @param   Object  obj     Object to detect by type or brand
 * @return  String
 */
function isURLSearchParams(obj) {
	// Duck-typing as a necessary condition.
	if (typeof obj !== 'object' || typeof obj.append !== 'function' || typeof obj.delete !== 'function' || typeof obj.get !== 'function' || typeof obj.getAll !== 'function' || typeof obj.has !== 'function' || typeof obj.set !== 'function') {
		return false;
	}

	// Brand-checking and more duck-typing as optional condition.
	return obj.constructor.name === 'URLSearchParams' || Object.prototype.toString.call(obj) === '[object URLSearchParams]' || typeof obj.sort === 'function';
}

/**
 * Check if `obj` is a W3C `Blob` object (which `File` inherits from)
 * @param  {*} obj
 * @return {boolean}
 */
function isBlob(obj) {
	return typeof obj === 'object' && typeof obj.arrayBuffer === 'function' && typeof obj.type === 'string' && typeof obj.stream === 'function' && typeof obj.constructor === 'function' && typeof obj.constructor.name === 'string' && /^(Blob|File)$/.test(obj.constructor.name) && /^(Blob|File)$/.test(obj[Symbol.toStringTag]);
}

/**
 * Clone body given Res/Req instance
 *
 * @param   Mixed  instance  Response or Request instance
 * @return  Mixed
 */
function clone(instance) {
	let p1, p2;
	let body = instance.body;

	// don't allow cloning a used body
	if (instance.bodyUsed) {
		throw new Error('cannot clone body after it is used');
	}

	// check that body is a stream and not form-data object
	// note: we can't clone the form-data object without having it as a dependency
	if (body instanceof Stream && typeof body.getBoundary !== 'function') {
		// tee instance body
		p1 = new PassThrough();
		p2 = new PassThrough();
		body.pipe(p1);
		body.pipe(p2);
		// set instance body to teed body and return the other teed body
		instance[INTERNALS].body = p1;
		body = p2;
	}

	return body;
}

/**
 * Performs the operation "extract a `Content-Type` value from |object|" as
 * specified in the specification:
 * https://fetch.spec.whatwg.org/#concept-bodyinit-extract
 *
 * This function assumes that instance.body is present.
 *
 * @param   Mixed  instance  Any options.body input
 */
function extractContentType(body) {
	if (body === null) {
		// body is null
		return null;
	} else if (typeof body === 'string') {
		// body is string
		return 'text/plain;charset=UTF-8';
	} else if (isURLSearchParams(body)) {
		// body is a URLSearchParams
		return 'application/x-www-form-urlencoded;charset=UTF-8';
	} else if (isBlob(body)) {
		// body is blob
		return body.type || null;
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		return null;
	} else if (Object.prototype.toString.call(body) === '[object ArrayBuffer]') {
		// body is ArrayBuffer
		return null;
	} else if (ArrayBuffer.isView(body)) {
		// body is ArrayBufferView
		return null;
	} else if (typeof body.getBoundary === 'function') {
		// detect form data input from form-data module
		return `multipart/form-data;boundary=${body.getBoundary()}`;
	} else if (body instanceof Stream) {
		// body is stream
		// can't really do much about this
		return null;
	} else {
		// Body constructor defaults other things to string
		return 'text/plain;charset=UTF-8';
	}
}

/**
 * The Fetch Standard treats this as if "total bytes" is a property on the body.
 * For us, we have to explicitly get it with a function.
 *
 * ref: https://fetch.spec.whatwg.org/#concept-body-total-bytes
 *
 * @param   Body    instance   Instance of Body
 * @return  Number?            Number of bytes, or null if not possible
 */
function getTotalBytes(instance) {
	const body = instance.body;


	if (body === null) {
		// body is null
		return 0;
	} else if (isBlob(body)) {
		return body.size;
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		return body.length;
	} else if (body && typeof body.getLengthSync === 'function') {
		// detect form data input from form-data module
		if (body._lengthRetrievers && body._lengthRetrievers.length == 0 || // 1.x
		body.hasKnownLength && body.hasKnownLength()) {
			// 2.x
			return body.getLengthSync();
		}
		return null;
	} else {
		// body is stream
		return null;
	}
}

/**
 * Write a Body to a Node.js WritableStream (e.g. http.Request) object.
 *
 * @param   Body    instance   Instance of Body
 * @return  Void
 */
function writeToStream(dest, instance) {
	const body = instance.body;


	if (body === null) {
		// body is null
		dest.end();
	} else if (isBlob(body)) {
		body.stream().pipe(dest);
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		dest.write(body);
		dest.end();
	} else {
		// body is stream
		body.pipe(dest);
	}
}

// expose Promise
Body.Promise = global.Promise;

/**
 * headers.js
 *
 * Headers class offers convenient helpers
 */

const invalidTokenRegex = /[^\^_`a-zA-Z\-0-9!#$%&'*+.|~]/;
const invalidHeaderCharRegex = /[^\t\x20-\x7e\x80-\xff]/;

function validateName(name) {
	name = `${name}`;
	if (invalidTokenRegex.test(name) || name === '') {
		throw new TypeError(`${name} is not a legal HTTP header name`);
	}
}

function validateValue(value) {
	value = `${value}`;
	if (invalidHeaderCharRegex.test(value)) {
		throw new TypeError(`${value} is not a legal HTTP header value`);
	}
}

/**
 * Find the key in the map object given a header name.
 *
 * Returns undefined if not found.
 *
 * @param   String  name  Header name
 * @return  String|Undefined
 */
function find(map, name) {
	name = name.toLowerCase();
	for (const key in map) {
		if (key.toLowerCase() === name) {
			return key;
		}
	}
	return undefined;
}

const MAP = Symbol('map');
class Headers {
	/**
  * Headers class
  *
  * @param   Object  headers  Response headers
  * @return  Void
  */
	constructor() {
		let init = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

		this[MAP] = Object.create(null);

		if (init instanceof Headers) {
			const rawHeaders = init.raw();
			const headerNames = Object.keys(rawHeaders);

			for (const headerName of headerNames) {
				for (const value of rawHeaders[headerName]) {
					this.append(headerName, value);
				}
			}

			return;
		}

		// We don't worry about converting prop to ByteString here as append()
		// will handle it.
		if (init == null) ; else if (typeof init === 'object') {
			const method = init[Symbol.iterator];
			if (method != null) {
				if (typeof method !== 'function') {
					throw new TypeError('Header pairs must be iterable');
				}

				// sequence<sequence<ByteString>>
				// Note: per spec we have to first exhaust the lists then process them
				const pairs = [];
				for (const pair of init) {
					if (typeof pair !== 'object' || typeof pair[Symbol.iterator] !== 'function') {
						throw new TypeError('Each header pair must be iterable');
					}
					pairs.push(Array.from(pair));
				}

				for (const pair of pairs) {
					if (pair.length !== 2) {
						throw new TypeError('Each header pair must be a name/value tuple');
					}
					this.append(pair[0], pair[1]);
				}
			} else {
				// record<ByteString, ByteString>
				for (const key of Object.keys(init)) {
					const value = init[key];
					this.append(key, value);
				}
			}
		} else {
			throw new TypeError('Provided initializer must be an object');
		}
	}

	/**
  * Return combined header value given name
  *
  * @param   String  name  Header name
  * @return  Mixed
  */
	get(name) {
		name = `${name}`;
		validateName(name);
		const key = find(this[MAP], name);
		if (key === undefined) {
			return null;
		}

		return this[MAP][key].join(', ');
	}

	/**
  * Iterate over all headers
  *
  * @param   Function  callback  Executed for each item with parameters (value, name, thisArg)
  * @param   Boolean   thisArg   `this` context for callback function
  * @return  Void
  */
	forEach(callback) {
		let thisArg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

		let pairs = getHeaders(this);
		let i = 0;
		while (i < pairs.length) {
			var _pairs$i = pairs[i];
			const name = _pairs$i[0],
			      value = _pairs$i[1];

			callback.call(thisArg, value, name, this);
			pairs = getHeaders(this);
			i++;
		}
	}

	/**
  * Overwrite header values given name
  *
  * @param   String  name   Header name
  * @param   String  value  Header value
  * @return  Void
  */
	set(name, value) {
		name = `${name}`;
		value = `${value}`;
		validateName(name);
		validateValue(value);
		const key = find(this[MAP], name);
		this[MAP][key !== undefined ? key : name] = [value];
	}

	/**
  * Append a value onto existing header
  *
  * @param   String  name   Header name
  * @param   String  value  Header value
  * @return  Void
  */
	append(name, value) {
		name = `${name}`;
		value = `${value}`;
		validateName(name);
		validateValue(value);
		const key = find(this[MAP], name);
		if (key !== undefined) {
			this[MAP][key].push(value);
		} else {
			this[MAP][name] = [value];
		}
	}

	/**
  * Check for header name existence
  *
  * @param   String   name  Header name
  * @return  Boolean
  */
	has(name) {
		name = `${name}`;
		validateName(name);
		return find(this[MAP], name) !== undefined;
	}

	/**
  * Delete all header values given name
  *
  * @param   String  name  Header name
  * @return  Void
  */
	delete(name) {
		name = `${name}`;
		validateName(name);
		const key = find(this[MAP], name);
		if (key !== undefined) {
			delete this[MAP][key];
		}
	}

	/**
  * Return raw headers (non-spec api)
  *
  * @return  Object
  */
	raw() {
		return this[MAP];
	}

	/**
  * Get an iterator on keys.
  *
  * @return  Iterator
  */
	keys() {
		return createHeadersIterator(this, 'key');
	}

	/**
  * Get an iterator on values.
  *
  * @return  Iterator
  */
	values() {
		return createHeadersIterator(this, 'value');
	}

	/**
  * Get an iterator on entries.
  *
  * This is the default iterator of the Headers object.
  *
  * @return  Iterator
  */
	[Symbol.iterator]() {
		return createHeadersIterator(this, 'key+value');
	}
}
Headers.prototype.entries = Headers.prototype[Symbol.iterator];

Object.defineProperty(Headers.prototype, Symbol.toStringTag, {
	value: 'Headers',
	writable: false,
	enumerable: false,
	configurable: true
});

Object.defineProperties(Headers.prototype, {
	get: { enumerable: true },
	forEach: { enumerable: true },
	set: { enumerable: true },
	append: { enumerable: true },
	has: { enumerable: true },
	delete: { enumerable: true },
	keys: { enumerable: true },
	values: { enumerable: true },
	entries: { enumerable: true }
});

function getHeaders(headers) {
	let kind = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'key+value';

	const keys = Object.keys(headers[MAP]).sort();
	return keys.map(kind === 'key' ? function (k) {
		return k.toLowerCase();
	} : kind === 'value' ? function (k) {
		return headers[MAP][k].join(', ');
	} : function (k) {
		return [k.toLowerCase(), headers[MAP][k].join(', ')];
	});
}

const INTERNAL = Symbol('internal');

function createHeadersIterator(target, kind) {
	const iterator = Object.create(HeadersIteratorPrototype);
	iterator[INTERNAL] = {
		target,
		kind,
		index: 0
	};
	return iterator;
}

const HeadersIteratorPrototype = Object.setPrototypeOf({
	next() {
		// istanbul ignore if
		if (!this || Object.getPrototypeOf(this) !== HeadersIteratorPrototype) {
			throw new TypeError('Value of `this` is not a HeadersIterator');
		}

		var _INTERNAL = this[INTERNAL];
		const target = _INTERNAL.target,
		      kind = _INTERNAL.kind,
		      index = _INTERNAL.index;

		const values = getHeaders(target, kind);
		const len = values.length;
		if (index >= len) {
			return {
				value: undefined,
				done: true
			};
		}

		this[INTERNAL].index = index + 1;

		return {
			value: values[index],
			done: false
		};
	}
}, Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]())));

Object.defineProperty(HeadersIteratorPrototype, Symbol.toStringTag, {
	value: 'HeadersIterator',
	writable: false,
	enumerable: false,
	configurable: true
});

/**
 * Export the Headers object in a form that Node.js can consume.
 *
 * @param   Headers  headers
 * @return  Object
 */
function exportNodeCompatibleHeaders(headers) {
	const obj = Object.assign({ __proto__: null }, headers[MAP]);

	// http.request() only supports string as Host header. This hack makes
	// specifying custom Host header possible.
	const hostHeaderKey = find(headers[MAP], 'Host');
	if (hostHeaderKey !== undefined) {
		obj[hostHeaderKey] = obj[hostHeaderKey][0];
	}

	return obj;
}

/**
 * Create a Headers object from an object of headers, ignoring those that do
 * not conform to HTTP grammar productions.
 *
 * @param   Object  obj  Object of headers
 * @return  Headers
 */
function createHeadersLenient(obj) {
	const headers = new Headers();
	for (const name of Object.keys(obj)) {
		if (invalidTokenRegex.test(name)) {
			continue;
		}
		if (Array.isArray(obj[name])) {
			for (const val of obj[name]) {
				if (invalidHeaderCharRegex.test(val)) {
					continue;
				}
				if (headers[MAP][name] === undefined) {
					headers[MAP][name] = [val];
				} else {
					headers[MAP][name].push(val);
				}
			}
		} else if (!invalidHeaderCharRegex.test(obj[name])) {
			headers[MAP][name] = [obj[name]];
		}
	}
	return headers;
}

const INTERNALS$1 = Symbol('Response internals');

// fix an issue where "STATUS_CODES" aren't a named export for node <10
const STATUS_CODES = http.STATUS_CODES;

/**
 * Response class
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */
class Response {
	constructor() {
		let body = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
		let opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		Body.call(this, body, opts);

		const status = opts.status || 200;
		const headers = new Headers(opts.headers);

		if (body != null && !headers.has('Content-Type')) {
			const contentType = extractContentType(body);
			if (contentType) {
				headers.append('Content-Type', contentType);
			}
		}

		this[INTERNALS$1] = {
			url: opts.url,
			status,
			statusText: opts.statusText || STATUS_CODES[status],
			headers,
			counter: opts.counter
		};
	}

	get url() {
		return this[INTERNALS$1].url || '';
	}

	get status() {
		return this[INTERNALS$1].status;
	}

	/**
  * Convenience property representing if the request ended normally
  */
	get ok() {
		return this[INTERNALS$1].status >= 200 && this[INTERNALS$1].status < 300;
	}

	get redirected() {
		return this[INTERNALS$1].counter > 0;
	}

	get statusText() {
		return this[INTERNALS$1].statusText;
	}

	get headers() {
		return this[INTERNALS$1].headers;
	}

	/**
  * Clone this response
  *
  * @return  Response
  */
	clone() {
		return new Response(clone(this), {
			url: this.url,
			status: this.status,
			statusText: this.statusText,
			headers: this.headers,
			ok: this.ok,
			redirected: this.redirected
		});
	}
}

Body.mixIn(Response.prototype);

Object.defineProperties(Response.prototype, {
	url: { enumerable: true },
	status: { enumerable: true },
	ok: { enumerable: true },
	redirected: { enumerable: true },
	statusText: { enumerable: true },
	headers: { enumerable: true },
	clone: { enumerable: true }
});

Object.defineProperty(Response.prototype, Symbol.toStringTag, {
	value: 'Response',
	writable: false,
	enumerable: false,
	configurable: true
});

const INTERNALS$2 = Symbol('Request internals');
const URL = Url.URL || whatwgUrl.URL;

// fix an issue where "format", "parse" aren't a named export for node <10
const parse_url = Url.parse;
const format_url = Url.format;

/**
 * Wrapper around `new URL` to handle arbitrary URLs
 *
 * @param  {string} urlStr
 * @return {void}
 */
function parseURL(urlStr) {
	/*
 	Check whether the URL is absolute or not
 		Scheme: https://tools.ietf.org/html/rfc3986#section-3.1
 	Absolute URL: https://tools.ietf.org/html/rfc3986#section-4.3
 */
	if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.exec(urlStr)) {
		urlStr = new URL(urlStr).toString();
	}

	// Fallback to old implementation for arbitrary URLs
	return parse_url(urlStr);
}

const streamDestructionSupported = 'destroy' in Stream.Readable.prototype;

/**
 * Check if a value is an instance of Request.
 *
 * @param   Mixed   input
 * @return  Boolean
 */
function isRequest(input) {
	return typeof input === 'object' && typeof input[INTERNALS$2] === 'object';
}

function isAbortSignal(signal) {
	const proto = signal && typeof signal === 'object' && Object.getPrototypeOf(signal);
	return !!(proto && proto.constructor.name === 'AbortSignal');
}

/**
 * Request class
 *
 * @param   Mixed   input  Url or Request instance
 * @param   Object  init   Custom options
 * @return  Void
 */
class Request {
	constructor(input) {
		let init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		let parsedURL;

		// normalize input
		if (!isRequest(input)) {
			if (input && input.href) {
				// in order to support Node.js' Url objects; though WHATWG's URL objects
				// will fall into this branch also (since their `toString()` will return
				// `href` property anyway)
				parsedURL = parseURL(input.href);
			} else {
				// coerce input to a string before attempting to parse
				parsedURL = parseURL(`${input}`);
			}
			input = {};
		} else {
			parsedURL = parseURL(input.url);
		}

		let method = init.method || input.method || 'GET';
		method = method.toUpperCase();

		if ((init.body != null || isRequest(input) && input.body !== null) && (method === 'GET' || method === 'HEAD')) {
			throw new TypeError('Request with GET/HEAD method cannot have body');
		}

		let inputBody = init.body != null ? init.body : isRequest(input) && input.body !== null ? clone(input) : null;

		Body.call(this, inputBody, {
			timeout: init.timeout || input.timeout || 0,
			size: init.size || input.size || 0
		});

		const headers = new Headers(init.headers || input.headers || {});

		if (inputBody != null && !headers.has('Content-Type')) {
			const contentType = extractContentType(inputBody);
			if (contentType) {
				headers.append('Content-Type', contentType);
			}
		}

		let signal = isRequest(input) ? input.signal : null;
		if ('signal' in init) signal = init.signal;

		if (signal != null && !isAbortSignal(signal)) {
			throw new TypeError('Expected signal to be an instanceof AbortSignal');
		}

		this[INTERNALS$2] = {
			method,
			redirect: init.redirect || input.redirect || 'follow',
			headers,
			parsedURL,
			signal
		};

		// node-fetch-only options
		this.follow = init.follow !== undefined ? init.follow : input.follow !== undefined ? input.follow : 20;
		this.compress = init.compress !== undefined ? init.compress : input.compress !== undefined ? input.compress : true;
		this.counter = init.counter || input.counter || 0;
		this.agent = init.agent || input.agent;
	}

	get method() {
		return this[INTERNALS$2].method;
	}

	get url() {
		return format_url(this[INTERNALS$2].parsedURL);
	}

	get headers() {
		return this[INTERNALS$2].headers;
	}

	get redirect() {
		return this[INTERNALS$2].redirect;
	}

	get signal() {
		return this[INTERNALS$2].signal;
	}

	/**
  * Clone this request
  *
  * @return  Request
  */
	clone() {
		return new Request(this);
	}
}

Body.mixIn(Request.prototype);

Object.defineProperty(Request.prototype, Symbol.toStringTag, {
	value: 'Request',
	writable: false,
	enumerable: false,
	configurable: true
});

Object.defineProperties(Request.prototype, {
	method: { enumerable: true },
	url: { enumerable: true },
	headers: { enumerable: true },
	redirect: { enumerable: true },
	clone: { enumerable: true },
	signal: { enumerable: true }
});

/**
 * Convert a Request to Node.js http request options.
 *
 * @param   Request  A Request instance
 * @return  Object   The options object to be passed to http.request
 */
function getNodeRequestOptions(request) {
	const parsedURL = request[INTERNALS$2].parsedURL;
	const headers = new Headers(request[INTERNALS$2].headers);

	// fetch step 1.3
	if (!headers.has('Accept')) {
		headers.set('Accept', '*/*');
	}

	// Basic fetch
	if (!parsedURL.protocol || !parsedURL.hostname) {
		throw new TypeError('Only absolute URLs are supported');
	}

	if (!/^https?:$/.test(parsedURL.protocol)) {
		throw new TypeError('Only HTTP(S) protocols are supported');
	}

	if (request.signal && request.body instanceof Stream.Readable && !streamDestructionSupported) {
		throw new Error('Cancellation of streamed requests with AbortSignal is not supported in node < 8');
	}

	// HTTP-network-or-cache fetch steps 2.4-2.7
	let contentLengthValue = null;
	if (request.body == null && /^(POST|PUT)$/i.test(request.method)) {
		contentLengthValue = '0';
	}
	if (request.body != null) {
		const totalBytes = getTotalBytes(request);
		if (typeof totalBytes === 'number') {
			contentLengthValue = String(totalBytes);
		}
	}
	if (contentLengthValue) {
		headers.set('Content-Length', contentLengthValue);
	}

	// HTTP-network-or-cache fetch step 2.11
	if (!headers.has('User-Agent')) {
		headers.set('User-Agent', 'node-fetch/1.0 (+https://github.com/bitinn/node-fetch)');
	}

	// HTTP-network-or-cache fetch step 2.15
	if (request.compress && !headers.has('Accept-Encoding')) {
		headers.set('Accept-Encoding', 'gzip,deflate');
	}

	let agent = request.agent;
	if (typeof agent === 'function') {
		agent = agent(parsedURL);
	}

	// HTTP-network fetch step 4.2
	// chunked encoding is handled by Node.js

	return Object.assign({}, parsedURL, {
		method: request.method,
		headers: exportNodeCompatibleHeaders(headers),
		agent
	});
}

/**
 * abort-error.js
 *
 * AbortError interface for cancelled requests
 */

/**
 * Create AbortError instance
 *
 * @param   String      message      Error message for human
 * @return  AbortError
 */
function AbortError(message) {
  Error.call(this, message);

  this.type = 'aborted';
  this.message = message;

  // hide custom error implementation details from end-users
  Error.captureStackTrace(this, this.constructor);
}

AbortError.prototype = Object.create(Error.prototype);
AbortError.prototype.constructor = AbortError;
AbortError.prototype.name = 'AbortError';

const URL$1 = Url.URL || whatwgUrl.URL;

// fix an issue where "PassThrough", "resolve" aren't a named export for node <10
const PassThrough$1 = Stream.PassThrough;

const isDomainOrSubdomain = function isDomainOrSubdomain(destination, original) {
	const orig = new URL$1(original).hostname;
	const dest = new URL$1(destination).hostname;

	return orig === dest || orig[orig.length - dest.length - 1] === '.' && orig.endsWith(dest);
};

/**
 * isSameProtocol reports whether the two provided URLs use the same protocol.
 *
 * Both domains must already be in canonical form.
 * @param {string|URL} original
 * @param {string|URL} destination
 */
const isSameProtocol = function isSameProtocol(destination, original) {
	const orig = new URL$1(original).protocol;
	const dest = new URL$1(destination).protocol;

	return orig === dest;
};

/**
 * Fetch function
 *
 * @param   Mixed    url   Absolute url or Request instance
 * @param   Object   opts  Fetch options
 * @return  Promise
 */
function fetch(url, opts) {

	// allow custom promise
	if (!fetch.Promise) {
		throw new Error('native promise missing, set fetch.Promise to your favorite alternative');
	}

	Body.Promise = fetch.Promise;

	// wrap http.request into fetch
	return new fetch.Promise(function (resolve, reject) {
		// build request object
		const request = new Request(url, opts);
		const options = getNodeRequestOptions(request);

		const send = (options.protocol === 'https:' ? https : http).request;
		const signal = request.signal;

		let response = null;

		const abort = function abort() {
			let error = new AbortError('The user aborted a request.');
			reject(error);
			if (request.body && request.body instanceof Stream.Readable) {
				destroyStream(request.body, error);
			}
			if (!response || !response.body) return;
			response.body.emit('error', error);
		};

		if (signal && signal.aborted) {
			abort();
			return;
		}

		const abortAndFinalize = function abortAndFinalize() {
			abort();
			finalize();
		};

		// send request
		const req = send(options);
		let reqTimeout;

		if (signal) {
			signal.addEventListener('abort', abortAndFinalize);
		}

		function finalize() {
			req.abort();
			if (signal) signal.removeEventListener('abort', abortAndFinalize);
			clearTimeout(reqTimeout);
		}

		if (request.timeout) {
			req.once('socket', function (socket) {
				reqTimeout = setTimeout(function () {
					reject(new FetchError(`network timeout at: ${request.url}`, 'request-timeout'));
					finalize();
				}, request.timeout);
			});
		}

		req.on('error', function (err) {
			reject(new FetchError(`request to ${request.url} failed, reason: ${err.message}`, 'system', err));

			if (response && response.body) {
				destroyStream(response.body, err);
			}

			finalize();
		});

		fixResponseChunkedTransferBadEnding(req, function (err) {
			if (signal && signal.aborted) {
				return;
			}

			if (response && response.body) {
				destroyStream(response.body, err);
			}
		});

		/* c8 ignore next 18 */
		if (parseInt(process.version.substring(1)) < 14) {
			// Before Node.js 14, pipeline() does not fully support async iterators and does not always
			// properly handle when the socket close/end events are out of order.
			req.on('socket', function (s) {
				s.addListener('close', function (hadError) {
					// if a data listener is still present we didn't end cleanly
					const hasDataListener = s.listenerCount('data') > 0;

					// if end happened before close but the socket didn't emit an error, do it now
					if (response && hasDataListener && !hadError && !(signal && signal.aborted)) {
						const err = new Error('Premature close');
						err.code = 'ERR_STREAM_PREMATURE_CLOSE';
						response.body.emit('error', err);
					}
				});
			});
		}

		req.on('response', function (res) {
			clearTimeout(reqTimeout);

			const headers = createHeadersLenient(res.headers);

			// HTTP fetch step 5
			if (fetch.isRedirect(res.statusCode)) {
				// HTTP fetch step 5.2
				const location = headers.get('Location');

				// HTTP fetch step 5.3
				let locationURL = null;
				try {
					locationURL = location === null ? null : new URL$1(location, request.url).toString();
				} catch (err) {
					// error here can only be invalid URL in Location: header
					// do not throw when options.redirect == manual
					// let the user extract the errorneous redirect URL
					if (request.redirect !== 'manual') {
						reject(new FetchError(`uri requested responds with an invalid redirect URL: ${location}`, 'invalid-redirect'));
						finalize();
						return;
					}
				}

				// HTTP fetch step 5.5
				switch (request.redirect) {
					case 'error':
						reject(new FetchError(`uri requested responds with a redirect, redirect mode is set to error: ${request.url}`, 'no-redirect'));
						finalize();
						return;
					case 'manual':
						// node-fetch-specific step: make manual redirect a bit easier to use by setting the Location header value to the resolved URL.
						if (locationURL !== null) {
							// handle corrupted header
							try {
								headers.set('Location', locationURL);
							} catch (err) {
								// istanbul ignore next: nodejs server prevent invalid response headers, we can't test this through normal request
								reject(err);
							}
						}
						break;
					case 'follow':
						// HTTP-redirect fetch step 2
						if (locationURL === null) {
							break;
						}

						// HTTP-redirect fetch step 5
						if (request.counter >= request.follow) {
							reject(new FetchError(`maximum redirect reached at: ${request.url}`, 'max-redirect'));
							finalize();
							return;
						}

						// HTTP-redirect fetch step 6 (counter increment)
						// Create a new Request object.
						const requestOpts = {
							headers: new Headers(request.headers),
							follow: request.follow,
							counter: request.counter + 1,
							agent: request.agent,
							compress: request.compress,
							method: request.method,
							body: request.body,
							signal: request.signal,
							timeout: request.timeout,
							size: request.size
						};

						if (!isDomainOrSubdomain(request.url, locationURL) || !isSameProtocol(request.url, locationURL)) {
							for (const name of ['authorization', 'www-authenticate', 'cookie', 'cookie2']) {
								requestOpts.headers.delete(name);
							}
						}

						// HTTP-redirect fetch step 9
						if (res.statusCode !== 303 && request.body && getTotalBytes(request) === null) {
							reject(new FetchError('Cannot follow redirect with body being a readable stream', 'unsupported-redirect'));
							finalize();
							return;
						}

						// HTTP-redirect fetch step 11
						if (res.statusCode === 303 || (res.statusCode === 301 || res.statusCode === 302) && request.method === 'POST') {
							requestOpts.method = 'GET';
							requestOpts.body = undefined;
							requestOpts.headers.delete('content-length');
						}

						// HTTP-redirect fetch step 15
						resolve(fetch(new Request(locationURL, requestOpts)));
						finalize();
						return;
				}
			}

			// prepare response
			res.once('end', function () {
				if (signal) signal.removeEventListener('abort', abortAndFinalize);
			});
			let body = res.pipe(new PassThrough$1());

			const response_options = {
				url: request.url,
				status: res.statusCode,
				statusText: res.statusMessage,
				headers: headers,
				size: request.size,
				timeout: request.timeout,
				counter: request.counter
			};

			// HTTP-network fetch step 12.1.1.3
			const codings = headers.get('Content-Encoding');

			// HTTP-network fetch step 12.1.1.4: handle content codings

			// in following scenarios we ignore compression support
			// 1. compression support is disabled
			// 2. HEAD request
			// 3. no Content-Encoding header
			// 4. no content response (204)
			// 5. content not modified response (304)
			if (!request.compress || request.method === 'HEAD' || codings === null || res.statusCode === 204 || res.statusCode === 304) {
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// For Node v6+
			// Be less strict when decoding compressed responses, since sometimes
			// servers send slightly invalid responses that are still accepted
			// by common browsers.
			// Always using Z_SYNC_FLUSH is what cURL does.
			const zlibOptions = {
				flush: zlib.Z_SYNC_FLUSH,
				finishFlush: zlib.Z_SYNC_FLUSH
			};

			// for gzip
			if (codings == 'gzip' || codings == 'x-gzip') {
				body = body.pipe(zlib.createGunzip(zlibOptions));
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// for deflate
			if (codings == 'deflate' || codings == 'x-deflate') {
				// handle the infamous raw deflate response from old servers
				// a hack for old IIS and Apache servers
				const raw = res.pipe(new PassThrough$1());
				raw.once('data', function (chunk) {
					// see http://stackoverflow.com/questions/37519828
					if ((chunk[0] & 0x0F) === 0x08) {
						body = body.pipe(zlib.createInflate());
					} else {
						body = body.pipe(zlib.createInflateRaw());
					}
					response = new Response(body, response_options);
					resolve(response);
				});
				raw.on('end', function () {
					// some old IIS servers return zero-length OK deflate responses, so 'data' is never emitted.
					if (!response) {
						response = new Response(body, response_options);
						resolve(response);
					}
				});
				return;
			}

			// for br
			if (codings == 'br' && typeof zlib.createBrotliDecompress === 'function') {
				body = body.pipe(zlib.createBrotliDecompress());
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// otherwise, use response as-is
			response = new Response(body, response_options);
			resolve(response);
		});

		writeToStream(req, request);
	});
}
function fixResponseChunkedTransferBadEnding(request, errorCallback) {
	let socket;

	request.on('socket', function (s) {
		socket = s;
	});

	request.on('response', function (response) {
		const headers = response.headers;

		if (headers['transfer-encoding'] === 'chunked' && !headers['content-length']) {
			response.once('close', function (hadError) {
				// tests for socket presence, as in some situations the
				// the 'socket' event is not triggered for the request
				// (happens in deno), avoids `TypeError`
				// if a data listener is still present we didn't end cleanly
				const hasDataListener = socket && socket.listenerCount('data') > 0;

				if (hasDataListener && !hadError) {
					const err = new Error('Premature close');
					err.code = 'ERR_STREAM_PREMATURE_CLOSE';
					errorCallback(err);
				}
			});
		}
	});
}

function destroyStream(stream, err) {
	if (stream.destroy) {
		stream.destroy(err);
	} else {
		// node < 8
		stream.emit('error', err);
		stream.end();
	}
}

/**
 * Redirect code matching
 *
 * @param   Number   code  Status code
 * @return  Boolean
 */
fetch.isRedirect = function (code) {
	return code === 301 || code === 302 || code === 303 || code === 307 || code === 308;
};

// expose Promise
fetch.Promise = global.Promise;

module.exports = exports = fetch;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports["default"] = exports;
exports.Headers = Headers;
exports.Request = Request;
exports.Response = Response;
exports.FetchError = FetchError;
exports.AbortError = AbortError;


/***/ }),

/***/ 45765:
/***/ ((module) => {

"use strict";


class NonError extends Error {
	constructor(message) {
		super(NonError._prepareSuperMessage(message));
		Object.defineProperty(this, 'name', {
			value: 'NonError',
			configurable: true,
			writable: true
		});

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, NonError);
		}
	}

	static _prepareSuperMessage(message) {
		try {
			return JSON.stringify(message);
		} catch {
			return String(message);
		}
	}
}

const commonProperties = [
	{property: 'name', enumerable: false},
	{property: 'message', enumerable: false},
	{property: 'stack', enumerable: false},
	{property: 'code', enumerable: true}
];

const isCalled = Symbol('.toJSON called');

const toJSON = from => {
	from[isCalled] = true;
	const json = from.toJSON();
	delete from[isCalled];
	return json;
};

const destroyCircular = ({
	from,
	seen,
	to_,
	forceEnumerable,
	maxDepth,
	depth
}) => {
	const to = to_ || (Array.isArray(from) ? [] : {});

	seen.push(from);

	if (depth >= maxDepth) {
		return to;
	}

	if (typeof from.toJSON === 'function' && from[isCalled] !== true) {
		return toJSON(from);
	}

	for (const [key, value] of Object.entries(from)) {
		if (typeof Buffer === 'function' && Buffer.isBuffer(value)) {
			to[key] = '[object Buffer]';
			continue;
		}

		if (typeof value === 'function') {
			continue;
		}

		if (!value || typeof value !== 'object') {
			to[key] = value;
			continue;
		}

		if (!seen.includes(from[key])) {
			depth++;

			to[key] = destroyCircular({
				from: from[key],
				seen: seen.slice(),
				forceEnumerable,
				maxDepth,
				depth
			});
			continue;
		}

		to[key] = '[Circular]';
	}

	for (const {property, enumerable} of commonProperties) {
		if (typeof from[property] === 'string') {
			Object.defineProperty(to, property, {
				value: from[property],
				enumerable: forceEnumerable ? true : enumerable,
				configurable: true,
				writable: true
			});
		}
	}

	return to;
};

const serializeError = (value, options = {}) => {
	const {maxDepth = Number.POSITIVE_INFINITY} = options;

	if (typeof value === 'object' && value !== null) {
		return destroyCircular({
			from: value,
			seen: [],
			forceEnumerable: true,
			maxDepth,
			depth: 0
		});
	}

	// People sometimes throw things besides Error objects…
	if (typeof value === 'function') {
		// `JSON.stringify()` discards functions. We do too, unless a function is thrown directly.
		return `[Function: ${(value.name || 'anonymous')}]`;
	}

	return value;
};

const deserializeError = (value, options = {}) => {
	const {maxDepth = Number.POSITIVE_INFINITY} = options;

	if (value instanceof Error) {
		return value;
	}

	if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
		const newError = new Error(); // eslint-disable-line unicorn/error-message
		destroyCircular({
			from: value,
			seen: [],
			to_: newError,
			maxDepth,
			depth: 0
		});
		return newError;
	}

	return new NonError(value);
};

module.exports = {
	serializeError,
	deserializeError
};


/***/ }),

/***/ 84543:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, copyDefault, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && (copyDefault || key !== "default"))
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toESM = (module2, isNodeMode) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", !isNodeMode && module2 && module2.__esModule ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};
var __toCommonJS = /* @__PURE__ */ ((cache2) => {
  return (module2, temp) => {
    return cache2 && cache2.get(module2) || (temp = __reExport(__markAsModule({}), module2, 1), cache2 && cache2.set(module2, temp), temp);
  };
})(typeof WeakMap !== "undefined" ? /* @__PURE__ */ new WeakMap() : 0);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/lib/errors/git-error.ts
var GitError;
var init_git_error = __esm({
  "src/lib/errors/git-error.ts"() {
    GitError = class extends Error {
      constructor(task, message) {
        super(message);
        this.task = task;
        Object.setPrototypeOf(this, new.target.prototype);
      }
    };
  }
});

// src/lib/errors/git-response-error.ts
var GitResponseError;
var init_git_response_error = __esm({
  "src/lib/errors/git-response-error.ts"() {
    init_git_error();
    GitResponseError = class extends GitError {
      constructor(git, message) {
        super(void 0, message || String(git));
        this.git = git;
      }
    };
  }
});

// src/lib/args/pathspec.ts
function pathspec(...paths) {
  const key = new String(paths);
  cache.set(key, paths);
  return key;
}
function isPathSpec(path) {
  return path instanceof String && cache.has(path);
}
function toPaths(pathSpec) {
  return cache.get(pathSpec) || [];
}
var cache;
var init_pathspec = __esm({
  "src/lib/args/pathspec.ts"() {
    cache = /* @__PURE__ */ new WeakMap();
  }
});

// src/lib/errors/git-construct-error.ts
var GitConstructError;
var init_git_construct_error = __esm({
  "src/lib/errors/git-construct-error.ts"() {
    init_git_error();
    GitConstructError = class extends GitError {
      constructor(config, message) {
        super(void 0, message);
        this.config = config;
      }
    };
  }
});

// src/lib/errors/git-plugin-error.ts
var GitPluginError;
var init_git_plugin_error = __esm({
  "src/lib/errors/git-plugin-error.ts"() {
    init_git_error();
    GitPluginError = class extends GitError {
      constructor(task, plugin, message) {
        super(task, message);
        this.task = task;
        this.plugin = plugin;
        Object.setPrototypeOf(this, new.target.prototype);
      }
    };
  }
});

// src/lib/errors/task-configuration-error.ts
var TaskConfigurationError;
var init_task_configuration_error = __esm({
  "src/lib/errors/task-configuration-error.ts"() {
    init_git_error();
    TaskConfigurationError = class extends GitError {
      constructor(message) {
        super(void 0, message);
      }
    };
  }
});

// src/lib/utils/util.ts
function asFunction(source) {
  return typeof source === "function" ? source : NOOP;
}
function isUserFunction(source) {
  return typeof source === "function" && source !== NOOP;
}
function splitOn(input, char) {
  const index = input.indexOf(char);
  if (index <= 0) {
    return [input, ""];
  }
  return [input.substr(0, index), input.substr(index + 1)];
}
function first(input, offset = 0) {
  return isArrayLike(input) && input.length > offset ? input[offset] : void 0;
}
function last(input, offset = 0) {
  if (isArrayLike(input) && input.length > offset) {
    return input[input.length - 1 - offset];
  }
}
function isArrayLike(input) {
  return !!(input && typeof input.length === "number");
}
function toLinesWithContent(input = "", trimmed2 = true, separator = "\n") {
  return input.split(separator).reduce((output, line) => {
    const lineContent = trimmed2 ? line.trim() : line;
    if (lineContent) {
      output.push(lineContent);
    }
    return output;
  }, []);
}
function forEachLineWithContent(input, callback) {
  return toLinesWithContent(input, true).map((line) => callback(line));
}
function folderExists(path) {
  return (0, import_file_exists.exists)(path, import_file_exists.FOLDER);
}
function append(target, item) {
  if (Array.isArray(target)) {
    if (!target.includes(item)) {
      target.push(item);
    }
  } else {
    target.add(item);
  }
  return item;
}
function including(target, item) {
  if (Array.isArray(target) && !target.includes(item)) {
    target.push(item);
  }
  return target;
}
function remove(target, item) {
  if (Array.isArray(target)) {
    const index = target.indexOf(item);
    if (index >= 0) {
      target.splice(index, 1);
    }
  } else {
    target.delete(item);
  }
  return item;
}
function asArray(source) {
  return Array.isArray(source) ? source : [source];
}
function asStringArray(source) {
  return asArray(source).map(String);
}
function asNumber(source, onNaN = 0) {
  if (source == null) {
    return onNaN;
  }
  const num = parseInt(source, 10);
  return isNaN(num) ? onNaN : num;
}
function prefixedArray(input, prefix) {
  const output = [];
  for (let i = 0, max = input.length; i < max; i++) {
    output.push(prefix, input[i]);
  }
  return output;
}
function bufferToString(input) {
  return (Array.isArray(input) ? Buffer.concat(input) : input).toString("utf-8");
}
function pick(source, properties) {
  return Object.assign({}, ...properties.map((property) => property in source ? { [property]: source[property] } : {}));
}
function delay(duration = 0) {
  return new Promise((done) => setTimeout(done, duration));
}
var import_file_exists, NULL, NOOP, objectToString;
var init_util = __esm({
  "src/lib/utils/util.ts"() {
    import_file_exists = __webpack_require__(30891);
    NULL = "\0";
    NOOP = () => {
    };
    objectToString = Object.prototype.toString.call.bind(Object.prototype.toString);
  }
});

// src/lib/utils/argument-filters.ts
function filterType(input, filter, def) {
  if (filter(input)) {
    return input;
  }
  return arguments.length > 2 ? def : void 0;
}
function filterPrimitives(input, omit) {
  const type = isPathSpec(input) ? "string" : typeof input;
  return /number|string|boolean/.test(type) && (!omit || !omit.includes(type));
}
function filterPlainObject(input) {
  return !!input && objectToString(input) === "[object Object]";
}
function filterFunction(input) {
  return typeof input === "function";
}
var filterArray, filterString, filterStringArray, filterStringOrStringArray, filterHasLength;
var init_argument_filters = __esm({
  "src/lib/utils/argument-filters.ts"() {
    init_util();
    init_pathspec();
    filterArray = (input) => {
      return Array.isArray(input);
    };
    filterString = (input) => {
      return typeof input === "string";
    };
    filterStringArray = (input) => {
      return Array.isArray(input) && input.every(filterString);
    };
    filterStringOrStringArray = (input) => {
      return filterString(input) || Array.isArray(input) && input.every(filterString);
    };
    filterHasLength = (input) => {
      if (input == null || "number|boolean|function".includes(typeof input)) {
        return false;
      }
      return Array.isArray(input) || typeof input === "string" || typeof input.length === "number";
    };
  }
});

// src/lib/utils/exit-codes.ts
var ExitCodes;
var init_exit_codes = __esm({
  "src/lib/utils/exit-codes.ts"() {
    ExitCodes = /* @__PURE__ */ ((ExitCodes2) => {
      ExitCodes2[ExitCodes2["SUCCESS"] = 0] = "SUCCESS";
      ExitCodes2[ExitCodes2["ERROR"] = 1] = "ERROR";
      ExitCodes2[ExitCodes2["NOT_FOUND"] = -2] = "NOT_FOUND";
      ExitCodes2[ExitCodes2["UNCLEAN"] = 128] = "UNCLEAN";
      return ExitCodes2;
    })(ExitCodes || {});
  }
});

// src/lib/utils/git-output-streams.ts
var GitOutputStreams;
var init_git_output_streams = __esm({
  "src/lib/utils/git-output-streams.ts"() {
    GitOutputStreams = class {
      constructor(stdOut, stdErr) {
        this.stdOut = stdOut;
        this.stdErr = stdErr;
      }
      asStrings() {
        return new GitOutputStreams(this.stdOut.toString("utf8"), this.stdErr.toString("utf8"));
      }
    };
  }
});

// src/lib/utils/line-parser.ts
var LineParser, RemoteLineParser;
var init_line_parser = __esm({
  "src/lib/utils/line-parser.ts"() {
    LineParser = class {
      constructor(regExp, useMatches) {
        this.matches = [];
        this.parse = (line, target) => {
          this.resetMatches();
          if (!this._regExp.every((reg, index) => this.addMatch(reg, index, line(index)))) {
            return false;
          }
          return this.useMatches(target, this.prepareMatches()) !== false;
        };
        this._regExp = Array.isArray(regExp) ? regExp : [regExp];
        if (useMatches) {
          this.useMatches = useMatches;
        }
      }
      useMatches(target, match) {
        throw new Error(`LineParser:useMatches not implemented`);
      }
      resetMatches() {
        this.matches.length = 0;
      }
      prepareMatches() {
        return this.matches;
      }
      addMatch(reg, index, line) {
        const matched = line && reg.exec(line);
        if (matched) {
          this.pushMatch(index, matched);
        }
        return !!matched;
      }
      pushMatch(_index, matched) {
        this.matches.push(...matched.slice(1));
      }
    };
    RemoteLineParser = class extends LineParser {
      addMatch(reg, index, line) {
        return /^remote:\s/.test(String(line)) && super.addMatch(reg, index, line);
      }
      pushMatch(index, matched) {
        if (index > 0 || matched.length > 1) {
          super.pushMatch(index, matched);
        }
      }
    };
  }
});

// src/lib/utils/simple-git-options.ts
function createInstanceConfig(...options) {
  const baseDir = process.cwd();
  const config = Object.assign(__spreadValues({ baseDir }, defaultOptions), ...options.filter((o) => typeof o === "object" && o));
  config.baseDir = config.baseDir || baseDir;
  config.trimmed = config.trimmed === true;
  return config;
}
var defaultOptions;
var init_simple_git_options = __esm({
  "src/lib/utils/simple-git-options.ts"() {
    defaultOptions = {
      binary: "git",
      maxConcurrentProcesses: 5,
      config: [],
      trimmed: false
    };
  }
});

// src/lib/utils/task-options.ts
function appendTaskOptions(options, commands = []) {
  if (!filterPlainObject(options)) {
    return commands;
  }
  return Object.keys(options).reduce((commands2, key) => {
    const value = options[key];
    if (isPathSpec(value)) {
      commands2.push(value);
    } else if (filterPrimitives(value, ["boolean"])) {
      commands2.push(key + "=" + value);
    } else {
      commands2.push(key);
    }
    return commands2;
  }, commands);
}
function getTrailingOptions(args, initialPrimitive = 0, objectOnly = false) {
  const command = [];
  for (let i = 0, max = initialPrimitive < 0 ? args.length : initialPrimitive; i < max; i++) {
    if ("string|number".includes(typeof args[i])) {
      command.push(String(args[i]));
    }
  }
  appendTaskOptions(trailingOptionsArgument(args), command);
  if (!objectOnly) {
    command.push(...trailingArrayArgument(args));
  }
  return command;
}
function trailingArrayArgument(args) {
  const hasTrailingCallback = typeof last(args) === "function";
  return filterType(last(args, hasTrailingCallback ? 1 : 0), filterArray, []);
}
function trailingOptionsArgument(args) {
  const hasTrailingCallback = filterFunction(last(args));
  return filterType(last(args, hasTrailingCallback ? 1 : 0), filterPlainObject);
}
function trailingFunctionArgument(args, includeNoop = true) {
  const callback = asFunction(last(args));
  return includeNoop || isUserFunction(callback) ? callback : void 0;
}
var init_task_options = __esm({
  "src/lib/utils/task-options.ts"() {
    init_argument_filters();
    init_util();
    init_pathspec();
  }
});

// src/lib/utils/task-parser.ts
function callTaskParser(parser3, streams) {
  return parser3(streams.stdOut, streams.stdErr);
}
function parseStringResponse(result, parsers12, texts, trim = true) {
  asArray(texts).forEach((text) => {
    for (let lines = toLinesWithContent(text, trim), i = 0, max = lines.length; i < max; i++) {
      const line = (offset = 0) => {
        if (i + offset >= max) {
          return;
        }
        return lines[i + offset];
      };
      parsers12.some(({ parse }) => parse(line, result));
    }
  });
  return result;
}
var init_task_parser = __esm({
  "src/lib/utils/task-parser.ts"() {
    init_util();
  }
});

// src/lib/utils/index.ts
var utils_exports = {};
__export(utils_exports, {
  ExitCodes: () => ExitCodes,
  GitOutputStreams: () => GitOutputStreams,
  LineParser: () => LineParser,
  NOOP: () => NOOP,
  NULL: () => NULL,
  RemoteLineParser: () => RemoteLineParser,
  append: () => append,
  appendTaskOptions: () => appendTaskOptions,
  asArray: () => asArray,
  asFunction: () => asFunction,
  asNumber: () => asNumber,
  asStringArray: () => asStringArray,
  bufferToString: () => bufferToString,
  callTaskParser: () => callTaskParser,
  createInstanceConfig: () => createInstanceConfig,
  delay: () => delay,
  filterArray: () => filterArray,
  filterFunction: () => filterFunction,
  filterHasLength: () => filterHasLength,
  filterPlainObject: () => filterPlainObject,
  filterPrimitives: () => filterPrimitives,
  filterString: () => filterString,
  filterStringArray: () => filterStringArray,
  filterStringOrStringArray: () => filterStringOrStringArray,
  filterType: () => filterType,
  first: () => first,
  folderExists: () => folderExists,
  forEachLineWithContent: () => forEachLineWithContent,
  getTrailingOptions: () => getTrailingOptions,
  including: () => including,
  isUserFunction: () => isUserFunction,
  last: () => last,
  objectToString: () => objectToString,
  parseStringResponse: () => parseStringResponse,
  pick: () => pick,
  prefixedArray: () => prefixedArray,
  remove: () => remove,
  splitOn: () => splitOn,
  toLinesWithContent: () => toLinesWithContent,
  trailingFunctionArgument: () => trailingFunctionArgument,
  trailingOptionsArgument: () => trailingOptionsArgument
});
var init_utils = __esm({
  "src/lib/utils/index.ts"() {
    init_argument_filters();
    init_exit_codes();
    init_git_output_streams();
    init_line_parser();
    init_simple_git_options();
    init_task_options();
    init_task_parser();
    init_util();
  }
});

// src/lib/tasks/check-is-repo.ts
var check_is_repo_exports = {};
__export(check_is_repo_exports, {
  CheckRepoActions: () => CheckRepoActions,
  checkIsBareRepoTask: () => checkIsBareRepoTask,
  checkIsRepoRootTask: () => checkIsRepoRootTask,
  checkIsRepoTask: () => checkIsRepoTask
});
function checkIsRepoTask(action) {
  switch (action) {
    case "bare" /* BARE */:
      return checkIsBareRepoTask();
    case "root" /* IS_REPO_ROOT */:
      return checkIsRepoRootTask();
  }
  const commands = ["rev-parse", "--is-inside-work-tree"];
  return {
    commands,
    format: "utf-8",
    onError,
    parser
  };
}
function checkIsRepoRootTask() {
  const commands = ["rev-parse", "--git-dir"];
  return {
    commands,
    format: "utf-8",
    onError,
    parser(path) {
      return /^\.(git)?$/.test(path.trim());
    }
  };
}
function checkIsBareRepoTask() {
  const commands = ["rev-parse", "--is-bare-repository"];
  return {
    commands,
    format: "utf-8",
    onError,
    parser
  };
}
function isNotRepoMessage(error) {
  return /(Not a git repository|Kein Git-Repository)/i.test(String(error));
}
var CheckRepoActions, onError, parser;
var init_check_is_repo = __esm({
  "src/lib/tasks/check-is-repo.ts"() {
    init_utils();
    CheckRepoActions = /* @__PURE__ */ ((CheckRepoActions2) => {
      CheckRepoActions2["BARE"] = "bare";
      CheckRepoActions2["IN_TREE"] = "tree";
      CheckRepoActions2["IS_REPO_ROOT"] = "root";
      return CheckRepoActions2;
    })(CheckRepoActions || {});
    onError = ({ exitCode }, error, done, fail) => {
      if (exitCode === 128 /* UNCLEAN */ && isNotRepoMessage(error)) {
        return done(Buffer.from("false"));
      }
      fail(error);
    };
    parser = (text) => {
      return text.trim() === "true";
    };
  }
});

// src/lib/responses/CleanSummary.ts
function cleanSummaryParser(dryRun, text) {
  const summary = new CleanResponse(dryRun);
  const regexp = dryRun ? dryRunRemovalRegexp : removalRegexp;
  toLinesWithContent(text).forEach((line) => {
    const removed = line.replace(regexp, "");
    summary.paths.push(removed);
    (isFolderRegexp.test(removed) ? summary.folders : summary.files).push(removed);
  });
  return summary;
}
var CleanResponse, removalRegexp, dryRunRemovalRegexp, isFolderRegexp;
var init_CleanSummary = __esm({
  "src/lib/responses/CleanSummary.ts"() {
    init_utils();
    CleanResponse = class {
      constructor(dryRun) {
        this.dryRun = dryRun;
        this.paths = [];
        this.files = [];
        this.folders = [];
      }
    };
    removalRegexp = /^[a-z]+\s*/i;
    dryRunRemovalRegexp = /^[a-z]+\s+[a-z]+\s*/i;
    isFolderRegexp = /\/$/;
  }
});

// src/lib/tasks/task.ts
var task_exports = {};
__export(task_exports, {
  EMPTY_COMMANDS: () => EMPTY_COMMANDS,
  adhocExecTask: () => adhocExecTask,
  configurationErrorTask: () => configurationErrorTask,
  isBufferTask: () => isBufferTask,
  isEmptyTask: () => isEmptyTask,
  straightThroughBufferTask: () => straightThroughBufferTask,
  straightThroughStringTask: () => straightThroughStringTask
});
function adhocExecTask(parser3) {
  return {
    commands: EMPTY_COMMANDS,
    format: "empty",
    parser: parser3
  };
}
function configurationErrorTask(error) {
  return {
    commands: EMPTY_COMMANDS,
    format: "empty",
    parser() {
      throw typeof error === "string" ? new TaskConfigurationError(error) : error;
    }
  };
}
function straightThroughStringTask(commands, trimmed2 = false) {
  return {
    commands,
    format: "utf-8",
    parser(text) {
      return trimmed2 ? String(text).trim() : text;
    }
  };
}
function straightThroughBufferTask(commands) {
  return {
    commands,
    format: "buffer",
    parser(buffer) {
      return buffer;
    }
  };
}
function isBufferTask(task) {
  return task.format === "buffer";
}
function isEmptyTask(task) {
  return task.format === "empty" || !task.commands.length;
}
var EMPTY_COMMANDS;
var init_task = __esm({
  "src/lib/tasks/task.ts"() {
    init_task_configuration_error();
    EMPTY_COMMANDS = [];
  }
});

// src/lib/tasks/clean.ts
var clean_exports = {};
__export(clean_exports, {
  CONFIG_ERROR_INTERACTIVE_MODE: () => CONFIG_ERROR_INTERACTIVE_MODE,
  CONFIG_ERROR_MODE_REQUIRED: () => CONFIG_ERROR_MODE_REQUIRED,
  CONFIG_ERROR_UNKNOWN_OPTION: () => CONFIG_ERROR_UNKNOWN_OPTION,
  CleanOptions: () => CleanOptions,
  cleanTask: () => cleanTask,
  cleanWithOptionsTask: () => cleanWithOptionsTask,
  isCleanOptionsArray: () => isCleanOptionsArray
});
function cleanWithOptionsTask(mode, customArgs) {
  const { cleanMode, options, valid } = getCleanOptions(mode);
  if (!cleanMode) {
    return configurationErrorTask(CONFIG_ERROR_MODE_REQUIRED);
  }
  if (!valid.options) {
    return configurationErrorTask(CONFIG_ERROR_UNKNOWN_OPTION + JSON.stringify(mode));
  }
  options.push(...customArgs);
  if (options.some(isInteractiveMode)) {
    return configurationErrorTask(CONFIG_ERROR_INTERACTIVE_MODE);
  }
  return cleanTask(cleanMode, options);
}
function cleanTask(mode, customArgs) {
  const commands = ["clean", `-${mode}`, ...customArgs];
  return {
    commands,
    format: "utf-8",
    parser(text) {
      return cleanSummaryParser(mode === "n" /* DRY_RUN */, text);
    }
  };
}
function isCleanOptionsArray(input) {
  return Array.isArray(input) && input.every((test) => CleanOptionValues.has(test));
}
function getCleanOptions(input) {
  let cleanMode;
  let options = [];
  let valid = { cleanMode: false, options: true };
  input.replace(/[^a-z]i/g, "").split("").forEach((char) => {
    if (isCleanMode(char)) {
      cleanMode = char;
      valid.cleanMode = true;
    } else {
      valid.options = valid.options && isKnownOption(options[options.length] = `-${char}`);
    }
  });
  return {
    cleanMode,
    options,
    valid
  };
}
function isCleanMode(cleanMode) {
  return cleanMode === "f" /* FORCE */ || cleanMode === "n" /* DRY_RUN */;
}
function isKnownOption(option) {
  return /^-[a-z]$/i.test(option) && CleanOptionValues.has(option.charAt(1));
}
function isInteractiveMode(option) {
  if (/^-[^\-]/.test(option)) {
    return option.indexOf("i") > 0;
  }
  return option === "--interactive";
}
var CONFIG_ERROR_INTERACTIVE_MODE, CONFIG_ERROR_MODE_REQUIRED, CONFIG_ERROR_UNKNOWN_OPTION, CleanOptions, CleanOptionValues;
var init_clean = __esm({
  "src/lib/tasks/clean.ts"() {
    init_CleanSummary();
    init_utils();
    init_task();
    CONFIG_ERROR_INTERACTIVE_MODE = "Git clean interactive mode is not supported";
    CONFIG_ERROR_MODE_REQUIRED = 'Git clean mode parameter ("n" or "f") is required';
    CONFIG_ERROR_UNKNOWN_OPTION = "Git clean unknown option found in: ";
    CleanOptions = /* @__PURE__ */ ((CleanOptions2) => {
      CleanOptions2["DRY_RUN"] = "n";
      CleanOptions2["FORCE"] = "f";
      CleanOptions2["IGNORED_INCLUDED"] = "x";
      CleanOptions2["IGNORED_ONLY"] = "X";
      CleanOptions2["EXCLUDING"] = "e";
      CleanOptions2["QUIET"] = "q";
      CleanOptions2["RECURSIVE"] = "d";
      return CleanOptions2;
    })(CleanOptions || {});
    CleanOptionValues = /* @__PURE__ */ new Set([
      "i",
      ...asStringArray(Object.values(CleanOptions))
    ]);
  }
});

// src/lib/responses/ConfigList.ts
function configListParser(text) {
  const config = new ConfigList();
  for (const item of configParser(text)) {
    config.addValue(item.file, String(item.key), item.value);
  }
  return config;
}
function configGetParser(text, key) {
  let value = null;
  const values = [];
  const scopes = /* @__PURE__ */ new Map();
  for (const item of configParser(text, key)) {
    if (item.key !== key) {
      continue;
    }
    values.push(value = item.value);
    if (!scopes.has(item.file)) {
      scopes.set(item.file, []);
    }
    scopes.get(item.file).push(value);
  }
  return {
    key,
    paths: Array.from(scopes.keys()),
    scopes,
    value,
    values
  };
}
function configFilePath(filePath) {
  return filePath.replace(/^(file):/, "");
}
function* configParser(text, requestedKey = null) {
  const lines = text.split("\0");
  for (let i = 0, max = lines.length - 1; i < max; ) {
    const file = configFilePath(lines[i++]);
    let value = lines[i++];
    let key = requestedKey;
    if (value.includes("\n")) {
      const line = splitOn(value, "\n");
      key = line[0];
      value = line[1];
    }
    yield { file, key, value };
  }
}
var ConfigList;
var init_ConfigList = __esm({
  "src/lib/responses/ConfigList.ts"() {
    init_utils();
    ConfigList = class {
      constructor() {
        this.files = [];
        this.values = /* @__PURE__ */ Object.create(null);
      }
      get all() {
        if (!this._all) {
          this._all = this.files.reduce((all, file) => {
            return Object.assign(all, this.values[file]);
          }, {});
        }
        return this._all;
      }
      addFile(file) {
        if (!(file in this.values)) {
          const latest = last(this.files);
          this.values[file] = latest ? Object.create(this.values[latest]) : {};
          this.files.push(file);
        }
        return this.values[file];
      }
      addValue(file, key, value) {
        const values = this.addFile(file);
        if (!values.hasOwnProperty(key)) {
          values[key] = value;
        } else if (Array.isArray(values[key])) {
          values[key].push(value);
        } else {
          values[key] = [values[key], value];
        }
        this._all = void 0;
      }
    };
  }
});

// src/lib/tasks/config.ts
function asConfigScope(scope, fallback) {
  if (typeof scope === "string" && GitConfigScope.hasOwnProperty(scope)) {
    return scope;
  }
  return fallback;
}
function addConfigTask(key, value, append2, scope) {
  const commands = ["config", `--${scope}`];
  if (append2) {
    commands.push("--add");
  }
  commands.push(key, value);
  return {
    commands,
    format: "utf-8",
    parser(text) {
      return text;
    }
  };
}
function getConfigTask(key, scope) {
  const commands = ["config", "--null", "--show-origin", "--get-all", key];
  if (scope) {
    commands.splice(1, 0, `--${scope}`);
  }
  return {
    commands,
    format: "utf-8",
    parser(text) {
      return configGetParser(text, key);
    }
  };
}
function listConfigTask(scope) {
  const commands = ["config", "--list", "--show-origin", "--null"];
  if (scope) {
    commands.push(`--${scope}`);
  }
  return {
    commands,
    format: "utf-8",
    parser(text) {
      return configListParser(text);
    }
  };
}
function config_default() {
  return {
    addConfig(key, value, ...rest) {
      return this._runTask(addConfigTask(key, value, rest[0] === true, asConfigScope(rest[1], "local" /* local */)), trailingFunctionArgument(arguments));
    },
    getConfig(key, scope) {
      return this._runTask(getConfigTask(key, asConfigScope(scope, void 0)), trailingFunctionArgument(arguments));
    },
    listConfig(...rest) {
      return this._runTask(listConfigTask(asConfigScope(rest[0], void 0)), trailingFunctionArgument(arguments));
    }
  };
}
var GitConfigScope;
var init_config = __esm({
  "src/lib/tasks/config.ts"() {
    init_ConfigList();
    init_utils();
    GitConfigScope = /* @__PURE__ */ ((GitConfigScope2) => {
      GitConfigScope2["system"] = "system";
      GitConfigScope2["global"] = "global";
      GitConfigScope2["local"] = "local";
      GitConfigScope2["worktree"] = "worktree";
      return GitConfigScope2;
    })(GitConfigScope || {});
  }
});

// src/lib/tasks/grep.ts
function grepQueryBuilder(...params) {
  return new GrepQuery().param(...params);
}
function parseGrep(grep) {
  const paths = /* @__PURE__ */ new Set();
  const results = {};
  forEachLineWithContent(grep, (input) => {
    const [path, line, preview] = input.split(NULL);
    paths.add(path);
    (results[path] = results[path] || []).push({
      line: asNumber(line),
      path,
      preview
    });
  });
  return {
    paths,
    results
  };
}
function grep_default() {
  return {
    grep(searchTerm) {
      const then = trailingFunctionArgument(arguments);
      const options = getTrailingOptions(arguments);
      for (const option of disallowedOptions) {
        if (options.includes(option)) {
          return this._runTask(configurationErrorTask(`git.grep: use of "${option}" is not supported.`), then);
        }
      }
      if (typeof searchTerm === "string") {
        searchTerm = grepQueryBuilder().param(searchTerm);
      }
      const commands = ["grep", "--null", "-n", "--full-name", ...options, ...searchTerm];
      return this._runTask({
        commands,
        format: "utf-8",
        parser(stdOut) {
          return parseGrep(stdOut);
        }
      }, then);
    }
  };
}
var disallowedOptions, Query, _a, GrepQuery;
var init_grep = __esm({
  "src/lib/tasks/grep.ts"() {
    init_utils();
    init_task();
    disallowedOptions = ["-h"];
    Query = Symbol("grepQuery");
    GrepQuery = class {
      constructor() {
        this[_a] = [];
      }
      *[(_a = Query, Symbol.iterator)]() {
        for (const query of this[Query]) {
          yield query;
        }
      }
      and(...and) {
        and.length && this[Query].push("--and", "(", ...prefixedArray(and, "-e"), ")");
        return this;
      }
      param(...param) {
        this[Query].push(...prefixedArray(param, "-e"));
        return this;
      }
    };
  }
});

// src/lib/tasks/reset.ts
var reset_exports = {};
__export(reset_exports, {
  ResetMode: () => ResetMode,
  getResetMode: () => getResetMode,
  resetTask: () => resetTask
});
function resetTask(mode, customArgs) {
  const commands = ["reset"];
  if (isValidResetMode(mode)) {
    commands.push(`--${mode}`);
  }
  commands.push(...customArgs);
  return straightThroughStringTask(commands);
}
function getResetMode(mode) {
  if (isValidResetMode(mode)) {
    return mode;
  }
  switch (typeof mode) {
    case "string":
    case "undefined":
      return "soft" /* SOFT */;
  }
  return;
}
function isValidResetMode(mode) {
  return ResetModes.includes(mode);
}
var ResetMode, ResetModes;
var init_reset = __esm({
  "src/lib/tasks/reset.ts"() {
    init_task();
    ResetMode = /* @__PURE__ */ ((ResetMode2) => {
      ResetMode2["MIXED"] = "mixed";
      ResetMode2["SOFT"] = "soft";
      ResetMode2["HARD"] = "hard";
      ResetMode2["MERGE"] = "merge";
      ResetMode2["KEEP"] = "keep";
      return ResetMode2;
    })(ResetMode || {});
    ResetModes = Array.from(Object.values(ResetMode));
  }
});

// src/lib/api.ts
var api_exports = {};
__export(api_exports, {
  CheckRepoActions: () => CheckRepoActions,
  CleanOptions: () => CleanOptions,
  GitConfigScope: () => GitConfigScope,
  GitConstructError: () => GitConstructError,
  GitError: () => GitError,
  GitPluginError: () => GitPluginError,
  GitResponseError: () => GitResponseError,
  ResetMode: () => ResetMode,
  TaskConfigurationError: () => TaskConfigurationError,
  grepQueryBuilder: () => grepQueryBuilder,
  pathspec: () => pathspec
});
var init_api = __esm({
  "src/lib/api.ts"() {
    init_pathspec();
    init_git_construct_error();
    init_git_error();
    init_git_plugin_error();
    init_git_response_error();
    init_task_configuration_error();
    init_check_is_repo();
    init_clean();
    init_config();
    init_grep();
    init_reset();
  }
});

// src/lib/plugins/abort-plugin.ts
function abortPlugin(signal) {
  if (!signal) {
    return;
  }
  const onSpawnAfter = {
    type: "spawn.after",
    action(_data, context) {
      function kill() {
        context.kill(new GitPluginError(void 0, "abort", "Abort signal received"));
      }
      signal.addEventListener("abort", kill);
      context.spawned.on("close", () => signal.removeEventListener("abort", kill));
    }
  };
  const onSpawnBefore = {
    type: "spawn.before",
    action(_data, context) {
      if (signal.aborted) {
        context.kill(new GitPluginError(void 0, "abort", "Abort already signaled"));
      }
    }
  };
  return [onSpawnBefore, onSpawnAfter];
}
var init_abort_plugin = __esm({
  "src/lib/plugins/abort-plugin.ts"() {
    init_git_plugin_error();
  }
});

// src/lib/plugins/block-unsafe-operations-plugin.ts
function isConfigSwitch(arg) {
  return typeof arg === "string" && arg.trim().toLowerCase() === "-c";
}
function preventProtocolOverride(arg, next) {
  if (!isConfigSwitch(arg)) {
    return;
  }
  if (!/^\s*protocol(.[a-z]+)?.allow/.test(next)) {
    return;
  }
  throw new GitPluginError(void 0, "unsafe", "Configuring protocol.allow is not permitted without enabling allowUnsafeExtProtocol");
}
function preventUploadPack(arg, method) {
  if (/^\s*--(upload|receive)-pack/.test(arg)) {
    throw new GitPluginError(void 0, "unsafe", `Use of --upload-pack or --receive-pack is not permitted without enabling allowUnsafePack`);
  }
  if (method === "clone" && /^\s*-u\b/.test(arg)) {
    throw new GitPluginError(void 0, "unsafe", `Use of clone with option -u is not permitted without enabling allowUnsafePack`);
  }
  if (method === "push" && /^\s*--exec\b/.test(arg)) {
    throw new GitPluginError(void 0, "unsafe", `Use of push with option --exec is not permitted without enabling allowUnsafePack`);
  }
}
function blockUnsafeOperationsPlugin({
  allowUnsafeProtocolOverride = false,
  allowUnsafePack = false
} = {}) {
  return {
    type: "spawn.args",
    action(args, context) {
      args.forEach((current, index) => {
        const next = index < args.length ? args[index + 1] : "";
        allowUnsafeProtocolOverride || preventProtocolOverride(current, next);
        allowUnsafePack || preventUploadPack(current, context.method);
      });
      return args;
    }
  };
}
var init_block_unsafe_operations_plugin = __esm({
  "src/lib/plugins/block-unsafe-operations-plugin.ts"() {
    init_git_plugin_error();
  }
});

// src/lib/plugins/command-config-prefixing-plugin.ts
function commandConfigPrefixingPlugin(configuration) {
  const prefix = prefixedArray(configuration, "-c");
  return {
    type: "spawn.args",
    action(data) {
      return [...prefix, ...data];
    }
  };
}
var init_command_config_prefixing_plugin = __esm({
  "src/lib/plugins/command-config-prefixing-plugin.ts"() {
    init_utils();
  }
});

// src/lib/plugins/completion-detection.plugin.ts
function completionDetectionPlugin({
  onClose = true,
  onExit = 50
} = {}) {
  function createEvents() {
    let exitCode = -1;
    const events = {
      close: (0, import_promise_deferred.deferred)(),
      closeTimeout: (0, import_promise_deferred.deferred)(),
      exit: (0, import_promise_deferred.deferred)(),
      exitTimeout: (0, import_promise_deferred.deferred)()
    };
    const result = Promise.race([
      onClose === false ? never : events.closeTimeout.promise,
      onExit === false ? never : events.exitTimeout.promise
    ]);
    configureTimeout(onClose, events.close, events.closeTimeout);
    configureTimeout(onExit, events.exit, events.exitTimeout);
    return {
      close(code) {
        exitCode = code;
        events.close.done();
      },
      exit(code) {
        exitCode = code;
        events.exit.done();
      },
      get exitCode() {
        return exitCode;
      },
      result
    };
  }
  function configureTimeout(flag, event, timeout) {
    if (flag === false) {
      return;
    }
    (flag === true ? event.promise : event.promise.then(() => delay(flag))).then(timeout.done);
  }
  return {
    type: "spawn.after",
    action(_0, _1) {
      return __async(this, arguments, function* (_data, { spawned, close }) {
        var _a2, _b;
        const events = createEvents();
        let deferClose = true;
        let quickClose = () => void (deferClose = false);
        (_a2 = spawned.stdout) == null ? void 0 : _a2.on("data", quickClose);
        (_b = spawned.stderr) == null ? void 0 : _b.on("data", quickClose);
        spawned.on("error", quickClose);
        spawned.on("close", (code) => events.close(code));
        spawned.on("exit", (code) => events.exit(code));
        try {
          yield events.result;
          if (deferClose) {
            yield delay(50);
          }
          close(events.exitCode);
        } catch (err) {
          close(events.exitCode, err);
        }
      });
    }
  };
}
var import_promise_deferred, never;
var init_completion_detection_plugin = __esm({
  "src/lib/plugins/completion-detection.plugin.ts"() {
    import_promise_deferred = __webpack_require__(9634);
    init_utils();
    never = (0, import_promise_deferred.deferred)().promise;
  }
});

// src/lib/plugins/error-detection.plugin.ts
function isTaskError(result) {
  return !!(result.exitCode && result.stdErr.length);
}
function getErrorMessage(result) {
  return Buffer.concat([...result.stdOut, ...result.stdErr]);
}
function errorDetectionHandler(overwrite = false, isError = isTaskError, errorMessage = getErrorMessage) {
  return (error, result) => {
    if (!overwrite && error || !isError(result)) {
      return error;
    }
    return errorMessage(result);
  };
}
function errorDetectionPlugin(config) {
  return {
    type: "task.error",
    action(data, context) {
      const error = config(data.error, {
        stdErr: context.stdErr,
        stdOut: context.stdOut,
        exitCode: context.exitCode
      });
      if (Buffer.isBuffer(error)) {
        return { error: new GitError(void 0, error.toString("utf-8")) };
      }
      return {
        error
      };
    }
  };
}
var init_error_detection_plugin = __esm({
  "src/lib/plugins/error-detection.plugin.ts"() {
    init_git_error();
  }
});

// src/lib/plugins/plugin-store.ts
var PluginStore;
var init_plugin_store = __esm({
  "src/lib/plugins/plugin-store.ts"() {
    init_utils();
    PluginStore = class {
      constructor() {
        this.plugins = /* @__PURE__ */ new Set();
      }
      add(plugin) {
        const plugins = [];
        asArray(plugin).forEach((plugin2) => plugin2 && this.plugins.add(append(plugins, plugin2)));
        return () => {
          plugins.forEach((plugin2) => this.plugins.delete(plugin2));
        };
      }
      exec(type, data, context) {
        let output = data;
        const contextual = Object.freeze(Object.create(context));
        for (const plugin of this.plugins) {
          if (plugin.type === type) {
            output = plugin.action(output, contextual);
          }
        }
        return output;
      }
    };
  }
});

// src/lib/plugins/progress-monitor-plugin.ts
function progressMonitorPlugin(progress) {
  const progressCommand = "--progress";
  const progressMethods = ["checkout", "clone", "fetch", "pull", "push"];
  const onProgress = {
    type: "spawn.after",
    action(_data, context) {
      var _a2;
      if (!context.commands.includes(progressCommand)) {
        return;
      }
      (_a2 = context.spawned.stderr) == null ? void 0 : _a2.on("data", (chunk) => {
        const message = /^([\s\S]+?):\s*(\d+)% \((\d+)\/(\d+)\)/.exec(chunk.toString("utf8"));
        if (!message) {
          return;
        }
        progress({
          method: context.method,
          stage: progressEventStage(message[1]),
          progress: asNumber(message[2]),
          processed: asNumber(message[3]),
          total: asNumber(message[4])
        });
      });
    }
  };
  const onArgs = {
    type: "spawn.args",
    action(args, context) {
      if (!progressMethods.includes(context.method)) {
        return args;
      }
      return including(args, progressCommand);
    }
  };
  return [onArgs, onProgress];
}
function progressEventStage(input) {
  return String(input.toLowerCase().split(" ", 1)) || "unknown";
}
var init_progress_monitor_plugin = __esm({
  "src/lib/plugins/progress-monitor-plugin.ts"() {
    init_utils();
  }
});

// src/lib/plugins/simple-git-plugin.ts
var init_simple_git_plugin = __esm({
  "src/lib/plugins/simple-git-plugin.ts"() {
  }
});

// src/lib/plugins/spawn-options-plugin.ts
function spawnOptionsPlugin(spawnOptions) {
  const options = pick(spawnOptions, ["uid", "gid"]);
  return {
    type: "spawn.options",
    action(data) {
      return __spreadValues(__spreadValues({}, options), data);
    }
  };
}
var init_spawn_options_plugin = __esm({
  "src/lib/plugins/spawn-options-plugin.ts"() {
    init_utils();
  }
});

// src/lib/plugins/timout-plugin.ts
function timeoutPlugin({
  block,
  stdErr = true,
  stdOut = true
}) {
  if (block > 0) {
    return {
      type: "spawn.after",
      action(_data, context) {
        var _a2, _b;
        let timeout;
        function wait() {
          timeout && clearTimeout(timeout);
          timeout = setTimeout(kill, block);
        }
        function stop() {
          var _a3, _b2;
          (_a3 = context.spawned.stdout) == null ? void 0 : _a3.off("data", wait);
          (_b2 = context.spawned.stderr) == null ? void 0 : _b2.off("data", wait);
          context.spawned.off("exit", stop);
          context.spawned.off("close", stop);
          timeout && clearTimeout(timeout);
        }
        function kill() {
          stop();
          context.kill(new GitPluginError(void 0, "timeout", `block timeout reached`));
        }
        stdOut && ((_a2 = context.spawned.stdout) == null ? void 0 : _a2.on("data", wait));
        stdErr && ((_b = context.spawned.stderr) == null ? void 0 : _b.on("data", wait));
        context.spawned.on("exit", stop);
        context.spawned.on("close", stop);
        wait();
      }
    };
  }
}
var init_timout_plugin = __esm({
  "src/lib/plugins/timout-plugin.ts"() {
    init_git_plugin_error();
  }
});

// src/lib/plugins/index.ts
var init_plugins = __esm({
  "src/lib/plugins/index.ts"() {
    init_abort_plugin();
    init_block_unsafe_operations_plugin();
    init_command_config_prefixing_plugin();
    init_completion_detection_plugin();
    init_error_detection_plugin();
    init_plugin_store();
    init_progress_monitor_plugin();
    init_simple_git_plugin();
    init_spawn_options_plugin();
    init_timout_plugin();
  }
});

// src/lib/plugins/suffix-paths.plugin.ts
function suffixPathsPlugin() {
  return {
    type: "spawn.args",
    action(data) {
      const prefix = [];
      let suffix;
      function append2(args) {
        (suffix = suffix || []).push(...args);
      }
      for (let i = 0; i < data.length; i++) {
        const param = data[i];
        if (isPathSpec(param)) {
          append2(toPaths(param));
          continue;
        }
        if (param === "--") {
          append2(data.slice(i + 1).flatMap((item) => isPathSpec(item) && toPaths(item) || item));
          break;
        }
        prefix.push(param);
      }
      return !suffix ? prefix : [...prefix, "--", ...suffix.map(String)];
    }
  };
}
var init_suffix_paths_plugin = __esm({
  "src/lib/plugins/suffix-paths.plugin.ts"() {
    init_pathspec();
  }
});

// src/lib/git-logger.ts
function createLog() {
  return (0, import_debug.default)("simple-git");
}
function prefixedLogger(to, prefix, forward) {
  if (!prefix || !String(prefix).replace(/\s*/, "")) {
    return !forward ? to : (message, ...args) => {
      to(message, ...args);
      forward(message, ...args);
    };
  }
  return (message, ...args) => {
    to(`%s ${message}`, prefix, ...args);
    if (forward) {
      forward(message, ...args);
    }
  };
}
function childLoggerName(name, childDebugger, { namespace: parentNamespace }) {
  if (typeof name === "string") {
    return name;
  }
  const childNamespace = childDebugger && childDebugger.namespace || "";
  if (childNamespace.startsWith(parentNamespace)) {
    return childNamespace.substr(parentNamespace.length + 1);
  }
  return childNamespace || parentNamespace;
}
function createLogger(label, verbose, initialStep, infoDebugger = createLog()) {
  const labelPrefix = label && `[${label}]` || "";
  const spawned = [];
  const debugDebugger = typeof verbose === "string" ? infoDebugger.extend(verbose) : verbose;
  const key = childLoggerName(filterType(verbose, filterString), debugDebugger, infoDebugger);
  return step(initialStep);
  function sibling(name, initial) {
    return append(spawned, createLogger(label, key.replace(/^[^:]+/, name), initial, infoDebugger));
  }
  function step(phase) {
    const stepPrefix = phase && `[${phase}]` || "";
    const debug2 = debugDebugger && prefixedLogger(debugDebugger, stepPrefix) || NOOP;
    const info = prefixedLogger(infoDebugger, `${labelPrefix} ${stepPrefix}`, debug2);
    return Object.assign(debugDebugger ? debug2 : info, {
      label,
      sibling,
      info,
      step
    });
  }
}
var import_debug;
var init_git_logger = __esm({
  "src/lib/git-logger.ts"() {
    import_debug = __toESM(__webpack_require__(23510));
    init_utils();
    import_debug.default.formatters.L = (value) => String(filterHasLength(value) ? value.length : "-");
    import_debug.default.formatters.B = (value) => {
      if (Buffer.isBuffer(value)) {
        return value.toString("utf8");
      }
      return objectToString(value);
    };
  }
});

// src/lib/runners/tasks-pending-queue.ts
var _TasksPendingQueue, TasksPendingQueue;
var init_tasks_pending_queue = __esm({
  "src/lib/runners/tasks-pending-queue.ts"() {
    init_git_error();
    init_git_logger();
    _TasksPendingQueue = class {
      constructor(logLabel = "GitExecutor") {
        this.logLabel = logLabel;
        this._queue = /* @__PURE__ */ new Map();
      }
      withProgress(task) {
        return this._queue.get(task);
      }
      createProgress(task) {
        const name = _TasksPendingQueue.getName(task.commands[0]);
        const logger = createLogger(this.logLabel, name);
        return {
          task,
          logger,
          name
        };
      }
      push(task) {
        const progress = this.createProgress(task);
        progress.logger("Adding task to the queue, commands = %o", task.commands);
        this._queue.set(task, progress);
        return progress;
      }
      fatal(err) {
        for (const [task, { logger }] of Array.from(this._queue.entries())) {
          if (task === err.task) {
            logger.info(`Failed %o`, err);
            logger(`Fatal exception, any as-yet un-started tasks run through this executor will not be attempted`);
          } else {
            logger.info(`A fatal exception occurred in a previous task, the queue has been purged: %o`, err.message);
          }
          this.complete(task);
        }
        if (this._queue.size !== 0) {
          throw new Error(`Queue size should be zero after fatal: ${this._queue.size}`);
        }
      }
      complete(task) {
        const progress = this.withProgress(task);
        if (progress) {
          this._queue.delete(task);
        }
      }
      attempt(task) {
        const progress = this.withProgress(task);
        if (!progress) {
          throw new GitError(void 0, "TasksPendingQueue: attempt called for an unknown task");
        }
        progress.logger("Starting task");
        return progress;
      }
      static getName(name = "empty") {
        return `task:${name}:${++_TasksPendingQueue.counter}`;
      }
    };
    TasksPendingQueue = _TasksPendingQueue;
    TasksPendingQueue.counter = 0;
  }
});

// src/lib/runners/git-executor-chain.ts
function pluginContext(task, commands) {
  return {
    method: first(task.commands) || "",
    commands
  };
}
function onErrorReceived(target, logger) {
  return (err) => {
    logger(`[ERROR] child process exception %o`, err);
    target.push(Buffer.from(String(err.stack), "ascii"));
  };
}
function onDataReceived(target, name, logger, output) {
  return (buffer) => {
    logger(`%s received %L bytes`, name, buffer);
    output(`%B`, buffer);
    target.push(buffer);
  };
}
var import_child_process, GitExecutorChain;
var init_git_executor_chain = __esm({
  "src/lib/runners/git-executor-chain.ts"() {
    import_child_process = __webpack_require__(32081);
    init_git_error();
    init_task();
    init_utils();
    init_tasks_pending_queue();
    GitExecutorChain = class {
      constructor(_executor, _scheduler, _plugins) {
        this._executor = _executor;
        this._scheduler = _scheduler;
        this._plugins = _plugins;
        this._chain = Promise.resolve();
        this._queue = new TasksPendingQueue();
      }
      get binary() {
        return this._executor.binary;
      }
      get cwd() {
        return this._cwd || this._executor.cwd;
      }
      set cwd(cwd) {
        this._cwd = cwd;
      }
      get env() {
        return this._executor.env;
      }
      get outputHandler() {
        return this._executor.outputHandler;
      }
      chain() {
        return this;
      }
      push(task) {
        this._queue.push(task);
        return this._chain = this._chain.then(() => this.attemptTask(task));
      }
      attemptTask(task) {
        return __async(this, null, function* () {
          const onScheduleComplete = yield this._scheduler.next();
          const onQueueComplete = () => this._queue.complete(task);
          try {
            const { logger } = this._queue.attempt(task);
            return yield isEmptyTask(task) ? this.attemptEmptyTask(task, logger) : this.attemptRemoteTask(task, logger);
          } catch (e) {
            throw this.onFatalException(task, e);
          } finally {
            onQueueComplete();
            onScheduleComplete();
          }
        });
      }
      onFatalException(task, e) {
        const gitError = e instanceof GitError ? Object.assign(e, { task }) : new GitError(task, e && String(e));
        this._chain = Promise.resolve();
        this._queue.fatal(gitError);
        return gitError;
      }
      attemptRemoteTask(task, logger) {
        return __async(this, null, function* () {
          const args = this._plugins.exec("spawn.args", [...task.commands], pluginContext(task, task.commands));
          const raw = yield this.gitResponse(task, this.binary, args, this.outputHandler, logger.step("SPAWN"));
          const outputStreams = yield this.handleTaskData(task, args, raw, logger.step("HANDLE"));
          logger(`passing response to task's parser as a %s`, task.format);
          if (isBufferTask(task)) {
            return callTaskParser(task.parser, outputStreams);
          }
          return callTaskParser(task.parser, outputStreams.asStrings());
        });
      }
      attemptEmptyTask(task, logger) {
        return __async(this, null, function* () {
          logger(`empty task bypassing child process to call to task's parser`);
          return task.parser(this);
        });
      }
      handleTaskData(task, args, result, logger) {
        const { exitCode, rejection, stdOut, stdErr } = result;
        return new Promise((done, fail) => {
          logger(`Preparing to handle process response exitCode=%d stdOut=`, exitCode);
          const { error } = this._plugins.exec("task.error", { error: rejection }, __spreadValues(__spreadValues({}, pluginContext(task, args)), result));
          if (error && task.onError) {
            logger.info(`exitCode=%s handling with custom error handler`);
            return task.onError(result, error, (newStdOut) => {
              logger.info(`custom error handler treated as success`);
              logger(`custom error returned a %s`, objectToString(newStdOut));
              done(new GitOutputStreams(Array.isArray(newStdOut) ? Buffer.concat(newStdOut) : newStdOut, Buffer.concat(stdErr)));
            }, fail);
          }
          if (error) {
            logger.info(`handling as error: exitCode=%s stdErr=%s rejection=%o`, exitCode, stdErr.length, rejection);
            return fail(error);
          }
          logger.info(`retrieving task output complete`);
          done(new GitOutputStreams(Buffer.concat(stdOut), Buffer.concat(stdErr)));
        });
      }
      gitResponse(task, command, args, outputHandler, logger) {
        return __async(this, null, function* () {
          const outputLogger = logger.sibling("output");
          const spawnOptions = this._plugins.exec("spawn.options", {
            cwd: this.cwd,
            env: this.env,
            windowsHide: true
          }, pluginContext(task, task.commands));
          return new Promise((done) => {
            const stdOut = [];
            const stdErr = [];
            logger.info(`%s %o`, command, args);
            logger("%O", spawnOptions);
            let rejection = this._beforeSpawn(task, args);
            if (rejection) {
              return done({
                stdOut,
                stdErr,
                exitCode: 9901,
                rejection
              });
            }
            this._plugins.exec("spawn.before", void 0, __spreadProps(__spreadValues({}, pluginContext(task, args)), {
              kill(reason) {
                rejection = reason || rejection;
              }
            }));
            const spawned = (0, import_child_process.spawn)(command, args, spawnOptions);
            spawned.stdout.on("data", onDataReceived(stdOut, "stdOut", logger, outputLogger.step("stdOut")));
            spawned.stderr.on("data", onDataReceived(stdErr, "stdErr", logger, outputLogger.step("stdErr")));
            spawned.on("error", onErrorReceived(stdErr, logger));
            if (outputHandler) {
              logger(`Passing child process stdOut/stdErr to custom outputHandler`);
              outputHandler(command, spawned.stdout, spawned.stderr, [...args]);
            }
            this._plugins.exec("spawn.after", void 0, __spreadProps(__spreadValues({}, pluginContext(task, args)), {
              spawned,
              close(exitCode, reason) {
                done({
                  stdOut,
                  stdErr,
                  exitCode,
                  rejection: rejection || reason
                });
              },
              kill(reason) {
                if (spawned.killed) {
                  return;
                }
                rejection = reason;
                spawned.kill("SIGINT");
              }
            }));
          });
        });
      }
      _beforeSpawn(task, args) {
        let rejection;
        this._plugins.exec("spawn.before", void 0, __spreadProps(__spreadValues({}, pluginContext(task, args)), {
          kill(reason) {
            rejection = reason || rejection;
          }
        }));
        return rejection;
      }
    };
  }
});

// src/lib/runners/git-executor.ts
var git_executor_exports = {};
__export(git_executor_exports, {
  GitExecutor: () => GitExecutor
});
var GitExecutor;
var init_git_executor = __esm({
  "src/lib/runners/git-executor.ts"() {
    init_git_executor_chain();
    GitExecutor = class {
      constructor(binary = "git", cwd, _scheduler, _plugins) {
        this.binary = binary;
        this.cwd = cwd;
        this._scheduler = _scheduler;
        this._plugins = _plugins;
        this._chain = new GitExecutorChain(this, this._scheduler, this._plugins);
      }
      chain() {
        return new GitExecutorChain(this, this._scheduler, this._plugins);
      }
      push(task) {
        return this._chain.push(task);
      }
    };
  }
});

// src/lib/task-callback.ts
function taskCallback(task, response, callback = NOOP) {
  const onSuccess = (data) => {
    callback(null, data);
  };
  const onError2 = (err) => {
    if ((err == null ? void 0 : err.task) === task) {
      callback(err instanceof GitResponseError ? addDeprecationNoticeToError(err) : err, void 0);
    }
  };
  response.then(onSuccess, onError2);
}
function addDeprecationNoticeToError(err) {
  let log = (name) => {
    console.warn(`simple-git deprecation notice: accessing GitResponseError.${name} should be GitResponseError.git.${name}, this will no longer be available in version 3`);
    log = NOOP;
  };
  return Object.create(err, Object.getOwnPropertyNames(err.git).reduce(descriptorReducer, {}));
  function descriptorReducer(all, name) {
    if (name in err) {
      return all;
    }
    all[name] = {
      enumerable: false,
      configurable: false,
      get() {
        log(name);
        return err.git[name];
      }
    };
    return all;
  }
}
var init_task_callback = __esm({
  "src/lib/task-callback.ts"() {
    init_git_response_error();
    init_utils();
  }
});

// src/lib/tasks/change-working-directory.ts
function changeWorkingDirectoryTask(directory, root) {
  return adhocExecTask((instance) => {
    if (!folderExists(directory)) {
      throw new Error(`Git.cwd: cannot change to non-directory "${directory}"`);
    }
    return (root || instance).cwd = directory;
  });
}
var init_change_working_directory = __esm({
  "src/lib/tasks/change-working-directory.ts"() {
    init_utils();
    init_task();
  }
});

// src/lib/tasks/checkout.ts
function checkoutTask(args) {
  const commands = ["checkout", ...args];
  if (commands[1] === "-b" && commands.includes("-B")) {
    commands[1] = remove(commands, "-B");
  }
  return straightThroughStringTask(commands);
}
function checkout_default() {
  return {
    checkout() {
      return this._runTask(checkoutTask(getTrailingOptions(arguments, 1)), trailingFunctionArgument(arguments));
    },
    checkoutBranch(branchName, startPoint) {
      return this._runTask(checkoutTask(["-b", branchName, startPoint, ...getTrailingOptions(arguments)]), trailingFunctionArgument(arguments));
    },
    checkoutLocalBranch(branchName) {
      return this._runTask(checkoutTask(["-b", branchName, ...getTrailingOptions(arguments)]), trailingFunctionArgument(arguments));
    }
  };
}
var init_checkout = __esm({
  "src/lib/tasks/checkout.ts"() {
    init_utils();
    init_task();
  }
});

// src/lib/parsers/parse-commit.ts
function parseCommitResult(stdOut) {
  const result = {
    author: null,
    branch: "",
    commit: "",
    root: false,
    summary: {
      changes: 0,
      insertions: 0,
      deletions: 0
    }
  };
  return parseStringResponse(result, parsers, stdOut);
}
var parsers;
var init_parse_commit = __esm({
  "src/lib/parsers/parse-commit.ts"() {
    init_utils();
    parsers = [
      new LineParser(/^\[([^\s]+)( \([^)]+\))? ([^\]]+)/, (result, [branch, root, commit]) => {
        result.branch = branch;
        result.commit = commit;
        result.root = !!root;
      }),
      new LineParser(/\s*Author:\s(.+)/i, (result, [author]) => {
        const parts = author.split("<");
        const email = parts.pop();
        if (!email || !email.includes("@")) {
          return;
        }
        result.author = {
          email: email.substr(0, email.length - 1),
          name: parts.join("<").trim()
        };
      }),
      new LineParser(/(\d+)[^,]*(?:,\s*(\d+)[^,]*)(?:,\s*(\d+))/g, (result, [changes, insertions, deletions]) => {
        result.summary.changes = parseInt(changes, 10) || 0;
        result.summary.insertions = parseInt(insertions, 10) || 0;
        result.summary.deletions = parseInt(deletions, 10) || 0;
      }),
      new LineParser(/^(\d+)[^,]*(?:,\s*(\d+)[^(]+\(([+-]))?/, (result, [changes, lines, direction]) => {
        result.summary.changes = parseInt(changes, 10) || 0;
        const count = parseInt(lines, 10) || 0;
        if (direction === "-") {
          result.summary.deletions = count;
        } else if (direction === "+") {
          result.summary.insertions = count;
        }
      })
    ];
  }
});

// src/lib/tasks/commit.ts
function commitTask(message, files, customArgs) {
  const commands = [
    "-c",
    "core.abbrev=40",
    "commit",
    ...prefixedArray(message, "-m"),
    ...files,
    ...customArgs
  ];
  return {
    commands,
    format: "utf-8",
    parser: parseCommitResult
  };
}
function commit_default() {
  return {
    commit(message, ...rest) {
      const next = trailingFunctionArgument(arguments);
      const task = rejectDeprecatedSignatures(message) || commitTask(asArray(message), asArray(filterType(rest[0], filterStringOrStringArray, [])), [...filterType(rest[1], filterArray, []), ...getTrailingOptions(arguments, 0, true)]);
      return this._runTask(task, next);
    }
  };
  function rejectDeprecatedSignatures(message) {
    return !filterStringOrStringArray(message) && configurationErrorTask(`git.commit: requires the commit message to be supplied as a string/string[]`);
  }
}
var init_commit = __esm({
  "src/lib/tasks/commit.ts"() {
    init_parse_commit();
    init_utils();
    init_task();
  }
});

// src/lib/tasks/hash-object.ts
function hashObjectTask(filePath, write) {
  const commands = ["hash-object", filePath];
  if (write) {
    commands.push("-w");
  }
  return straightThroughStringTask(commands, true);
}
var init_hash_object = __esm({
  "src/lib/tasks/hash-object.ts"() {
    init_task();
  }
});

// src/lib/responses/InitSummary.ts
function parseInit(bare, path, text) {
  const response = String(text).trim();
  let result;
  if (result = initResponseRegex.exec(response)) {
    return new InitSummary(bare, path, false, result[1]);
  }
  if (result = reInitResponseRegex.exec(response)) {
    return new InitSummary(bare, path, true, result[1]);
  }
  let gitDir = "";
  const tokens = response.split(" ");
  while (tokens.length) {
    const token = tokens.shift();
    if (token === "in") {
      gitDir = tokens.join(" ");
      break;
    }
  }
  return new InitSummary(bare, path, /^re/i.test(response), gitDir);
}
var InitSummary, initResponseRegex, reInitResponseRegex;
var init_InitSummary = __esm({
  "src/lib/responses/InitSummary.ts"() {
    InitSummary = class {
      constructor(bare, path, existing, gitDir) {
        this.bare = bare;
        this.path = path;
        this.existing = existing;
        this.gitDir = gitDir;
      }
    };
    initResponseRegex = /^Init.+ repository in (.+)$/;
    reInitResponseRegex = /^Rein.+ in (.+)$/;
  }
});

// src/lib/tasks/init.ts
function hasBareCommand(command) {
  return command.includes(bareCommand);
}
function initTask(bare = false, path, customArgs) {
  const commands = ["init", ...customArgs];
  if (bare && !hasBareCommand(commands)) {
    commands.splice(1, 0, bareCommand);
  }
  return {
    commands,
    format: "utf-8",
    parser(text) {
      return parseInit(commands.includes("--bare"), path, text);
    }
  };
}
var bareCommand;
var init_init = __esm({
  "src/lib/tasks/init.ts"() {
    init_InitSummary();
    bareCommand = "--bare";
  }
});

// src/lib/args/log-format.ts
function logFormatFromCommand(customArgs) {
  for (let i = 0; i < customArgs.length; i++) {
    const format = logFormatRegex.exec(customArgs[i]);
    if (format) {
      return `--${format[1]}`;
    }
  }
  return "" /* NONE */;
}
function isLogFormat(customArg) {
  return logFormatRegex.test(customArg);
}
var logFormatRegex;
var init_log_format = __esm({
  "src/lib/args/log-format.ts"() {
    logFormatRegex = /^--(stat|numstat|name-only|name-status)(=|$)/;
  }
});

// src/lib/responses/DiffSummary.ts
var DiffSummary;
var init_DiffSummary = __esm({
  "src/lib/responses/DiffSummary.ts"() {
    DiffSummary = class {
      constructor() {
        this.changed = 0;
        this.deletions = 0;
        this.insertions = 0;
        this.files = [];
      }
    };
  }
});

// src/lib/parsers/parse-diff-summary.ts
function getDiffParser(format = "" /* NONE */) {
  const parser3 = diffSummaryParsers[format];
  return (stdOut) => parseStringResponse(new DiffSummary(), parser3, stdOut, false);
}
var statParser, numStatParser, nameOnlyParser, nameStatusParser, diffSummaryParsers;
var init_parse_diff_summary = __esm({
  "src/lib/parsers/parse-diff-summary.ts"() {
    init_log_format();
    init_DiffSummary();
    init_utils();
    statParser = [
      new LineParser(/(.+)\s+\|\s+(\d+)(\s+[+\-]+)?$/, (result, [file, changes, alterations = ""]) => {
        result.files.push({
          file: file.trim(),
          changes: asNumber(changes),
          insertions: alterations.replace(/[^+]/g, "").length,
          deletions: alterations.replace(/[^-]/g, "").length,
          binary: false
        });
      }),
      new LineParser(/(.+) \|\s+Bin ([0-9.]+) -> ([0-9.]+) ([a-z]+)/, (result, [file, before, after]) => {
        result.files.push({
          file: file.trim(),
          before: asNumber(before),
          after: asNumber(after),
          binary: true
        });
      }),
      new LineParser(/(\d+) files? changed\s*((?:, \d+ [^,]+){0,2})/, (result, [changed, summary]) => {
        const inserted = /(\d+) i/.exec(summary);
        const deleted = /(\d+) d/.exec(summary);
        result.changed = asNumber(changed);
        result.insertions = asNumber(inserted == null ? void 0 : inserted[1]);
        result.deletions = asNumber(deleted == null ? void 0 : deleted[1]);
      })
    ];
    numStatParser = [
      new LineParser(/(\d+)\t(\d+)\t(.+)$/, (result, [changesInsert, changesDelete, file]) => {
        const insertions = asNumber(changesInsert);
        const deletions = asNumber(changesDelete);
        result.changed++;
        result.insertions += insertions;
        result.deletions += deletions;
        result.files.push({
          file,
          changes: insertions + deletions,
          insertions,
          deletions,
          binary: false
        });
      }),
      new LineParser(/-\t-\t(.+)$/, (result, [file]) => {
        result.changed++;
        result.files.push({
          file,
          after: 0,
          before: 0,
          binary: true
        });
      })
    ];
    nameOnlyParser = [
      new LineParser(/(.+)$/, (result, [file]) => {
        result.changed++;
        result.files.push({
          file,
          changes: 0,
          insertions: 0,
          deletions: 0,
          binary: false
        });
      })
    ];
    nameStatusParser = [
      new LineParser(/([ACDMRTUXB])\s*(.+)$/, (result, [_status, file]) => {
        result.changed++;
        result.files.push({
          file,
          changes: 0,
          insertions: 0,
          deletions: 0,
          binary: false
        });
      })
    ];
    diffSummaryParsers = {
      ["" /* NONE */]: statParser,
      ["--stat" /* STAT */]: statParser,
      ["--numstat" /* NUM_STAT */]: numStatParser,
      ["--name-status" /* NAME_STATUS */]: nameStatusParser,
      ["--name-only" /* NAME_ONLY */]: nameOnlyParser
    };
  }
});

// src/lib/parsers/parse-list-log-summary.ts
function lineBuilder(tokens, fields) {
  return fields.reduce((line, field, index) => {
    line[field] = tokens[index] || "";
    return line;
  }, /* @__PURE__ */ Object.create({ diff: null }));
}
function createListLogSummaryParser(splitter = SPLITTER, fields = defaultFieldNames, logFormat = "" /* NONE */) {
  const parseDiffResult = getDiffParser(logFormat);
  return function(stdOut) {
    const all = toLinesWithContent(stdOut, true, START_BOUNDARY).map(function(item) {
      const lineDetail = item.trim().split(COMMIT_BOUNDARY);
      const listLogLine = lineBuilder(lineDetail[0].trim().split(splitter), fields);
      if (lineDetail.length > 1 && !!lineDetail[1].trim()) {
        listLogLine.diff = parseDiffResult(lineDetail[1]);
      }
      return listLogLine;
    });
    return {
      all,
      latest: all.length && all[0] || null,
      total: all.length
    };
  };
}
var START_BOUNDARY, COMMIT_BOUNDARY, SPLITTER, defaultFieldNames;
var init_parse_list_log_summary = __esm({
  "src/lib/parsers/parse-list-log-summary.ts"() {
    init_utils();
    init_parse_diff_summary();
    init_log_format();
    START_BOUNDARY = "\xF2\xF2\xF2\xF2\xF2\xF2 ";
    COMMIT_BOUNDARY = " \xF2\xF2";
    SPLITTER = " \xF2 ";
    defaultFieldNames = ["hash", "date", "message", "refs", "author_name", "author_email"];
  }
});

// src/lib/tasks/diff.ts
var diff_exports = {};
__export(diff_exports, {
  diffSummaryTask: () => diffSummaryTask,
  validateLogFormatConfig: () => validateLogFormatConfig
});
function diffSummaryTask(customArgs) {
  let logFormat = logFormatFromCommand(customArgs);
  const commands = ["diff"];
  if (logFormat === "" /* NONE */) {
    logFormat = "--stat" /* STAT */;
    commands.push("--stat=4096");
  }
  commands.push(...customArgs);
  return validateLogFormatConfig(commands) || {
    commands,
    format: "utf-8",
    parser: getDiffParser(logFormat)
  };
}
function validateLogFormatConfig(customArgs) {
  const flags = customArgs.filter(isLogFormat);
  if (flags.length > 1) {
    return configurationErrorTask(`Summary flags are mutually exclusive - pick one of ${flags.join(",")}`);
  }
  if (flags.length && customArgs.includes("-z")) {
    return configurationErrorTask(`Summary flag ${flags} parsing is not compatible with null termination option '-z'`);
  }
}
var init_diff = __esm({
  "src/lib/tasks/diff.ts"() {
    init_log_format();
    init_parse_diff_summary();
    init_task();
  }
});

// src/lib/tasks/log.ts
function prettyFormat(format, splitter) {
  const fields = [];
  const formatStr = [];
  Object.keys(format).forEach((field) => {
    fields.push(field);
    formatStr.push(String(format[field]));
  });
  return [fields, formatStr.join(splitter)];
}
function userOptions(input) {
  return Object.keys(input).reduce((out, key) => {
    if (!(key in excludeOptions)) {
      out[key] = input[key];
    }
    return out;
  }, {});
}
function parseLogOptions(opt = {}, customArgs = []) {
  const splitter = filterType(opt.splitter, filterString, SPLITTER);
  const format = !filterPrimitives(opt.format) && opt.format ? opt.format : {
    hash: "%H",
    date: opt.strictDate === false ? "%ai" : "%aI",
    message: "%s",
    refs: "%D",
    body: opt.multiLine ? "%B" : "%b",
    author_name: opt.mailMap !== false ? "%aN" : "%an",
    author_email: opt.mailMap !== false ? "%aE" : "%ae"
  };
  const [fields, formatStr] = prettyFormat(format, splitter);
  const suffix = [];
  const command = [
    `--pretty=format:${START_BOUNDARY}${formatStr}${COMMIT_BOUNDARY}`,
    ...customArgs
  ];
  const maxCount = opt.n || opt["max-count"] || opt.maxCount;
  if (maxCount) {
    command.push(`--max-count=${maxCount}`);
  }
  if (opt.from || opt.to) {
    const rangeOperator = opt.symmetric !== false ? "..." : "..";
    suffix.push(`${opt.from || ""}${rangeOperator}${opt.to || ""}`);
  }
  if (filterString(opt.file)) {
    command.push("--follow", pathspec(opt.file));
  }
  appendTaskOptions(userOptions(opt), command);
  return {
    fields,
    splitter,
    commands: [...command, ...suffix]
  };
}
function logTask(splitter, fields, customArgs) {
  const parser3 = createListLogSummaryParser(splitter, fields, logFormatFromCommand(customArgs));
  return {
    commands: ["log", ...customArgs],
    format: "utf-8",
    parser: parser3
  };
}
function log_default() {
  return {
    log(...rest) {
      const next = trailingFunctionArgument(arguments);
      const options = parseLogOptions(trailingOptionsArgument(arguments), filterType(arguments[0], filterArray));
      const task = rejectDeprecatedSignatures(...rest) || validateLogFormatConfig(options.commands) || createLogTask(options);
      return this._runTask(task, next);
    }
  };
  function createLogTask(options) {
    return logTask(options.splitter, options.fields, options.commands);
  }
  function rejectDeprecatedSignatures(from, to) {
    return filterString(from) && filterString(to) && configurationErrorTask(`git.log(string, string) should be replaced with git.log({ from: string, to: string })`);
  }
}
var excludeOptions;
var init_log = __esm({
  "src/lib/tasks/log.ts"() {
    init_log_format();
    init_pathspec();
    init_parse_list_log_summary();
    init_utils();
    init_task();
    init_diff();
    excludeOptions = /* @__PURE__ */ ((excludeOptions2) => {
      excludeOptions2[excludeOptions2["--pretty"] = 0] = "--pretty";
      excludeOptions2[excludeOptions2["max-count"] = 1] = "max-count";
      excludeOptions2[excludeOptions2["maxCount"] = 2] = "maxCount";
      excludeOptions2[excludeOptions2["n"] = 3] = "n";
      excludeOptions2[excludeOptions2["file"] = 4] = "file";
      excludeOptions2[excludeOptions2["format"] = 5] = "format";
      excludeOptions2[excludeOptions2["from"] = 6] = "from";
      excludeOptions2[excludeOptions2["to"] = 7] = "to";
      excludeOptions2[excludeOptions2["splitter"] = 8] = "splitter";
      excludeOptions2[excludeOptions2["symmetric"] = 9] = "symmetric";
      excludeOptions2[excludeOptions2["mailMap"] = 10] = "mailMap";
      excludeOptions2[excludeOptions2["multiLine"] = 11] = "multiLine";
      excludeOptions2[excludeOptions2["strictDate"] = 12] = "strictDate";
      return excludeOptions2;
    })(excludeOptions || {});
  }
});

// src/lib/responses/MergeSummary.ts
var MergeSummaryConflict, MergeSummaryDetail;
var init_MergeSummary = __esm({
  "src/lib/responses/MergeSummary.ts"() {
    MergeSummaryConflict = class {
      constructor(reason, file = null, meta) {
        this.reason = reason;
        this.file = file;
        this.meta = meta;
      }
      toString() {
        return `${this.file}:${this.reason}`;
      }
    };
    MergeSummaryDetail = class {
      constructor() {
        this.conflicts = [];
        this.merges = [];
        this.result = "success";
      }
      get failed() {
        return this.conflicts.length > 0;
      }
      get reason() {
        return this.result;
      }
      toString() {
        if (this.conflicts.length) {
          return `CONFLICTS: ${this.conflicts.join(", ")}`;
        }
        return "OK";
      }
    };
  }
});

// src/lib/responses/PullSummary.ts
var PullSummary, PullFailedSummary;
var init_PullSummary = __esm({
  "src/lib/responses/PullSummary.ts"() {
    PullSummary = class {
      constructor() {
        this.remoteMessages = {
          all: []
        };
        this.created = [];
        this.deleted = [];
        this.files = [];
        this.deletions = {};
        this.insertions = {};
        this.summary = {
          changes: 0,
          deletions: 0,
          insertions: 0
        };
      }
    };
    PullFailedSummary = class {
      constructor() {
        this.remote = "";
        this.hash = {
          local: "",
          remote: ""
        };
        this.branch = {
          local: "",
          remote: ""
        };
        this.message = "";
      }
      toString() {
        return this.message;
      }
    };
  }
});

// src/lib/parsers/parse-remote-objects.ts
function objectEnumerationResult(remoteMessages) {
  return remoteMessages.objects = remoteMessages.objects || {
    compressing: 0,
    counting: 0,
    enumerating: 0,
    packReused: 0,
    reused: { count: 0, delta: 0 },
    total: { count: 0, delta: 0 }
  };
}
function asObjectCount(source) {
  const count = /^\s*(\d+)/.exec(source);
  const delta = /delta (\d+)/i.exec(source);
  return {
    count: asNumber(count && count[1] || "0"),
    delta: asNumber(delta && delta[1] || "0")
  };
}
var remoteMessagesObjectParsers;
var init_parse_remote_objects = __esm({
  "src/lib/parsers/parse-remote-objects.ts"() {
    init_utils();
    remoteMessagesObjectParsers = [
      new RemoteLineParser(/^remote:\s*(enumerating|counting|compressing) objects: (\d+),/i, (result, [action, count]) => {
        const key = action.toLowerCase();
        const enumeration = objectEnumerationResult(result.remoteMessages);
        Object.assign(enumeration, { [key]: asNumber(count) });
      }),
      new RemoteLineParser(/^remote:\s*(enumerating|counting|compressing) objects: \d+% \(\d+\/(\d+)\),/i, (result, [action, count]) => {
        const key = action.toLowerCase();
        const enumeration = objectEnumerationResult(result.remoteMessages);
        Object.assign(enumeration, { [key]: asNumber(count) });
      }),
      new RemoteLineParser(/total ([^,]+), reused ([^,]+), pack-reused (\d+)/i, (result, [total, reused, packReused]) => {
        const objects = objectEnumerationResult(result.remoteMessages);
        objects.total = asObjectCount(total);
        objects.reused = asObjectCount(reused);
        objects.packReused = asNumber(packReused);
      })
    ];
  }
});

// src/lib/parsers/parse-remote-messages.ts
function parseRemoteMessages(_stdOut, stdErr) {
  return parseStringResponse({ remoteMessages: new RemoteMessageSummary() }, parsers2, stdErr);
}
var parsers2, RemoteMessageSummary;
var init_parse_remote_messages = __esm({
  "src/lib/parsers/parse-remote-messages.ts"() {
    init_utils();
    init_parse_remote_objects();
    parsers2 = [
      new RemoteLineParser(/^remote:\s*(.+)$/, (result, [text]) => {
        result.remoteMessages.all.push(text.trim());
        return false;
      }),
      ...remoteMessagesObjectParsers,
      new RemoteLineParser([/create a (?:pull|merge) request/i, /\s(https?:\/\/\S+)$/], (result, [pullRequestUrl]) => {
        result.remoteMessages.pullRequestUrl = pullRequestUrl;
      }),
      new RemoteLineParser([/found (\d+) vulnerabilities.+\(([^)]+)\)/i, /\s(https?:\/\/\S+)$/], (result, [count, summary, url]) => {
        result.remoteMessages.vulnerabilities = {
          count: asNumber(count),
          summary,
          url
        };
      })
    ];
    RemoteMessageSummary = class {
      constructor() {
        this.all = [];
      }
    };
  }
});

// src/lib/parsers/parse-pull.ts
function parsePullErrorResult(stdOut, stdErr) {
  const pullError = parseStringResponse(new PullFailedSummary(), errorParsers, [stdOut, stdErr]);
  return pullError.message && pullError;
}
var FILE_UPDATE_REGEX, SUMMARY_REGEX, ACTION_REGEX, parsers3, errorParsers, parsePullDetail, parsePullResult;
var init_parse_pull = __esm({
  "src/lib/parsers/parse-pull.ts"() {
    init_PullSummary();
    init_utils();
    init_parse_remote_messages();
    FILE_UPDATE_REGEX = /^\s*(.+?)\s+\|\s+\d+\s*(\+*)(-*)/;
    SUMMARY_REGEX = /(\d+)\D+((\d+)\D+\(\+\))?(\D+(\d+)\D+\(-\))?/;
    ACTION_REGEX = /^(create|delete) mode \d+ (.+)/;
    parsers3 = [
      new LineParser(FILE_UPDATE_REGEX, (result, [file, insertions, deletions]) => {
        result.files.push(file);
        if (insertions) {
          result.insertions[file] = insertions.length;
        }
        if (deletions) {
          result.deletions[file] = deletions.length;
        }
      }),
      new LineParser(SUMMARY_REGEX, (result, [changes, , insertions, , deletions]) => {
        if (insertions !== void 0 || deletions !== void 0) {
          result.summary.changes = +changes || 0;
          result.summary.insertions = +insertions || 0;
          result.summary.deletions = +deletions || 0;
          return true;
        }
        return false;
      }),
      new LineParser(ACTION_REGEX, (result, [action, file]) => {
        append(result.files, file);
        append(action === "create" ? result.created : result.deleted, file);
      })
    ];
    errorParsers = [
      new LineParser(/^from\s(.+)$/i, (result, [remote]) => void (result.remote = remote)),
      new LineParser(/^fatal:\s(.+)$/, (result, [message]) => void (result.message = message)),
      new LineParser(/([a-z0-9]+)\.\.([a-z0-9]+)\s+(\S+)\s+->\s+(\S+)$/, (result, [hashLocal, hashRemote, branchLocal, branchRemote]) => {
        result.branch.local = branchLocal;
        result.hash.local = hashLocal;
        result.branch.remote = branchRemote;
        result.hash.remote = hashRemote;
      })
    ];
    parsePullDetail = (stdOut, stdErr) => {
      return parseStringResponse(new PullSummary(), parsers3, [stdOut, stdErr]);
    };
    parsePullResult = (stdOut, stdErr) => {
      return Object.assign(new PullSummary(), parsePullDetail(stdOut, stdErr), parseRemoteMessages(stdOut, stdErr));
    };
  }
});

// src/lib/parsers/parse-merge.ts
var parsers4, parseMergeResult, parseMergeDetail;
var init_parse_merge = __esm({
  "src/lib/parsers/parse-merge.ts"() {
    init_MergeSummary();
    init_utils();
    init_parse_pull();
    parsers4 = [
      new LineParser(/^Auto-merging\s+(.+)$/, (summary, [autoMerge]) => {
        summary.merges.push(autoMerge);
      }),
      new LineParser(/^CONFLICT\s+\((.+)\): Merge conflict in (.+)$/, (summary, [reason, file]) => {
        summary.conflicts.push(new MergeSummaryConflict(reason, file));
      }),
      new LineParser(/^CONFLICT\s+\((.+\/delete)\): (.+) deleted in (.+) and/, (summary, [reason, file, deleteRef]) => {
        summary.conflicts.push(new MergeSummaryConflict(reason, file, { deleteRef }));
      }),
      new LineParser(/^CONFLICT\s+\((.+)\):/, (summary, [reason]) => {
        summary.conflicts.push(new MergeSummaryConflict(reason, null));
      }),
      new LineParser(/^Automatic merge failed;\s+(.+)$/, (summary, [result]) => {
        summary.result = result;
      })
    ];
    parseMergeResult = (stdOut, stdErr) => {
      return Object.assign(parseMergeDetail(stdOut, stdErr), parsePullResult(stdOut, stdErr));
    };
    parseMergeDetail = (stdOut) => {
      return parseStringResponse(new MergeSummaryDetail(), parsers4, stdOut);
    };
  }
});

// src/lib/tasks/merge.ts
function mergeTask(customArgs) {
  if (!customArgs.length) {
    return configurationErrorTask("Git.merge requires at least one option");
  }
  return {
    commands: ["merge", ...customArgs],
    format: "utf-8",
    parser(stdOut, stdErr) {
      const merge = parseMergeResult(stdOut, stdErr);
      if (merge.failed) {
        throw new GitResponseError(merge);
      }
      return merge;
    }
  };
}
var init_merge = __esm({
  "src/lib/tasks/merge.ts"() {
    init_git_response_error();
    init_parse_merge();
    init_task();
  }
});

// src/lib/parsers/parse-push.ts
function pushResultPushedItem(local, remote, status) {
  const deleted = status.includes("deleted");
  const tag = status.includes("tag") || /^refs\/tags/.test(local);
  const alreadyUpdated = !status.includes("new");
  return {
    deleted,
    tag,
    branch: !tag,
    new: !alreadyUpdated,
    alreadyUpdated,
    local,
    remote
  };
}
var parsers5, parsePushResult, parsePushDetail;
var init_parse_push = __esm({
  "src/lib/parsers/parse-push.ts"() {
    init_utils();
    init_parse_remote_messages();
    parsers5 = [
      new LineParser(/^Pushing to (.+)$/, (result, [repo]) => {
        result.repo = repo;
      }),
      new LineParser(/^updating local tracking ref '(.+)'/, (result, [local]) => {
        result.ref = __spreadProps(__spreadValues({}, result.ref || {}), {
          local
        });
      }),
      new LineParser(/^[=*-]\s+([^:]+):(\S+)\s+\[(.+)]$/, (result, [local, remote, type]) => {
        result.pushed.push(pushResultPushedItem(local, remote, type));
      }),
      new LineParser(/^Branch '([^']+)' set up to track remote branch '([^']+)' from '([^']+)'/, (result, [local, remote, remoteName]) => {
        result.branch = __spreadProps(__spreadValues({}, result.branch || {}), {
          local,
          remote,
          remoteName
        });
      }),
      new LineParser(/^([^:]+):(\S+)\s+([a-z0-9]+)\.\.([a-z0-9]+)$/, (result, [local, remote, from, to]) => {
        result.update = {
          head: {
            local,
            remote
          },
          hash: {
            from,
            to
          }
        };
      })
    ];
    parsePushResult = (stdOut, stdErr) => {
      const pushDetail = parsePushDetail(stdOut, stdErr);
      const responseDetail = parseRemoteMessages(stdOut, stdErr);
      return __spreadValues(__spreadValues({}, pushDetail), responseDetail);
    };
    parsePushDetail = (stdOut, stdErr) => {
      return parseStringResponse({ pushed: [] }, parsers5, [stdOut, stdErr]);
    };
  }
});

// src/lib/tasks/push.ts
var push_exports = {};
__export(push_exports, {
  pushTagsTask: () => pushTagsTask,
  pushTask: () => pushTask
});
function pushTagsTask(ref = {}, customArgs) {
  append(customArgs, "--tags");
  return pushTask(ref, customArgs);
}
function pushTask(ref = {}, customArgs) {
  const commands = ["push", ...customArgs];
  if (ref.branch) {
    commands.splice(1, 0, ref.branch);
  }
  if (ref.remote) {
    commands.splice(1, 0, ref.remote);
  }
  remove(commands, "-v");
  append(commands, "--verbose");
  append(commands, "--porcelain");
  return {
    commands,
    format: "utf-8",
    parser: parsePushResult
  };
}
var init_push = __esm({
  "src/lib/tasks/push.ts"() {
    init_parse_push();
    init_utils();
  }
});

// src/lib/tasks/show.ts
function show_default() {
  return {
    showBuffer() {
      const commands = ["show", ...getTrailingOptions(arguments, 1)];
      if (!commands.includes("--binary")) {
        commands.splice(1, 0, "--binary");
      }
      return this._runTask(straightThroughBufferTask(commands), trailingFunctionArgument(arguments));
    },
    show() {
      const commands = ["show", ...getTrailingOptions(arguments, 1)];
      return this._runTask(straightThroughStringTask(commands), trailingFunctionArgument(arguments));
    }
  };
}
var init_show = __esm({
  "src/lib/tasks/show.ts"() {
    init_utils();
    init_task();
  }
});

// src/lib/responses/FileStatusSummary.ts
var fromPathRegex, FileStatusSummary;
var init_FileStatusSummary = __esm({
  "src/lib/responses/FileStatusSummary.ts"() {
    fromPathRegex = /^(.+) -> (.+)$/;
    FileStatusSummary = class {
      constructor(path, index, working_dir) {
        this.path = path;
        this.index = index;
        this.working_dir = working_dir;
        if (index + working_dir === "R") {
          const detail = fromPathRegex.exec(path) || [null, path, path];
          this.from = detail[1] || "";
          this.path = detail[2] || "";
        }
      }
    };
  }
});

// src/lib/responses/StatusSummary.ts
function renamedFile(line) {
  const [to, from] = line.split(NULL);
  return {
    from: from || to,
    to
  };
}
function parser2(indexX, indexY, handler) {
  return [`${indexX}${indexY}`, handler];
}
function conflicts(indexX, ...indexY) {
  return indexY.map((y) => parser2(indexX, y, (result, file) => append(result.conflicted, file)));
}
function splitLine(result, lineStr) {
  const trimmed2 = lineStr.trim();
  switch (" ") {
    case trimmed2.charAt(2):
      return data(trimmed2.charAt(0), trimmed2.charAt(1), trimmed2.substr(3));
    case trimmed2.charAt(1):
      return data(" " /* NONE */, trimmed2.charAt(0), trimmed2.substr(2));
    default:
      return;
  }
  function data(index, workingDir, path) {
    const raw = `${index}${workingDir}`;
    const handler = parsers6.get(raw);
    if (handler) {
      handler(result, path);
    }
    if (raw !== "##" && raw !== "!!") {
      result.files.push(new FileStatusSummary(path.replace(/\0.+$/, ""), index, workingDir));
    }
  }
}
var StatusSummary, parsers6, parseStatusSummary;
var init_StatusSummary = __esm({
  "src/lib/responses/StatusSummary.ts"() {
    init_utils();
    init_FileStatusSummary();
    StatusSummary = class {
      constructor() {
        this.not_added = [];
        this.conflicted = [];
        this.created = [];
        this.deleted = [];
        this.ignored = void 0;
        this.modified = [];
        this.renamed = [];
        this.files = [];
        this.staged = [];
        this.ahead = 0;
        this.behind = 0;
        this.current = null;
        this.tracking = null;
        this.detached = false;
        this.isClean = () => {
          return !this.files.length;
        };
      }
    };
    parsers6 = new Map([
      parser2(" " /* NONE */, "A" /* ADDED */, (result, file) => append(result.created, file)),
      parser2(" " /* NONE */, "D" /* DELETED */, (result, file) => append(result.deleted, file)),
      parser2(" " /* NONE */, "M" /* MODIFIED */, (result, file) => append(result.modified, file)),
      parser2("A" /* ADDED */, " " /* NONE */, (result, file) => append(result.created, file) && append(result.staged, file)),
      parser2("A" /* ADDED */, "M" /* MODIFIED */, (result, file) => append(result.created, file) && append(result.staged, file) && append(result.modified, file)),
      parser2("D" /* DELETED */, " " /* NONE */, (result, file) => append(result.deleted, file) && append(result.staged, file)),
      parser2("M" /* MODIFIED */, " " /* NONE */, (result, file) => append(result.modified, file) && append(result.staged, file)),
      parser2("M" /* MODIFIED */, "M" /* MODIFIED */, (result, file) => append(result.modified, file) && append(result.staged, file)),
      parser2("R" /* RENAMED */, " " /* NONE */, (result, file) => {
        append(result.renamed, renamedFile(file));
      }),
      parser2("R" /* RENAMED */, "M" /* MODIFIED */, (result, file) => {
        const renamed = renamedFile(file);
        append(result.renamed, renamed);
        append(result.modified, renamed.to);
      }),
      parser2("!" /* IGNORED */, "!" /* IGNORED */, (_result, _file) => {
        append(_result.ignored = _result.ignored || [], _file);
      }),
      parser2("?" /* UNTRACKED */, "?" /* UNTRACKED */, (result, file) => append(result.not_added, file)),
      ...conflicts("A" /* ADDED */, "A" /* ADDED */, "U" /* UNMERGED */),
      ...conflicts("D" /* DELETED */, "D" /* DELETED */, "U" /* UNMERGED */),
      ...conflicts("U" /* UNMERGED */, "A" /* ADDED */, "D" /* DELETED */, "U" /* UNMERGED */),
      [
        "##",
        (result, line) => {
          const aheadReg = /ahead (\d+)/;
          const behindReg = /behind (\d+)/;
          const currentReg = /^(.+?(?=(?:\.{3}|\s|$)))/;
          const trackingReg = /\.{3}(\S*)/;
          const onEmptyBranchReg = /\son\s([\S]+)$/;
          let regexResult;
          regexResult = aheadReg.exec(line);
          result.ahead = regexResult && +regexResult[1] || 0;
          regexResult = behindReg.exec(line);
          result.behind = regexResult && +regexResult[1] || 0;
          regexResult = currentReg.exec(line);
          result.current = regexResult && regexResult[1];
          regexResult = trackingReg.exec(line);
          result.tracking = regexResult && regexResult[1];
          regexResult = onEmptyBranchReg.exec(line);
          result.current = regexResult && regexResult[1] || result.current;
          result.detached = /\(no branch\)/.test(line);
        }
      ]
    ]);
    parseStatusSummary = function(text) {
      const lines = text.split(NULL);
      const status = new StatusSummary();
      for (let i = 0, l = lines.length; i < l; ) {
        let line = lines[i++].trim();
        if (!line) {
          continue;
        }
        if (line.charAt(0) === "R" /* RENAMED */) {
          line += NULL + (lines[i++] || "");
        }
        splitLine(status, line);
      }
      return status;
    };
  }
});

// src/lib/tasks/status.ts
function statusTask(customArgs) {
  const commands = [
    "status",
    "--porcelain",
    "-b",
    "-u",
    "--null",
    ...customArgs.filter((arg) => !ignoredOptions.includes(arg))
  ];
  return {
    format: "utf-8",
    commands,
    parser(text) {
      return parseStatusSummary(text);
    }
  };
}
var ignoredOptions;
var init_status = __esm({
  "src/lib/tasks/status.ts"() {
    init_StatusSummary();
    ignoredOptions = ["--null", "-z"];
  }
});

// src/lib/tasks/version.ts
function versionResponse(major = 0, minor = 0, patch = 0, agent = "", installed = true) {
  return Object.defineProperty({
    major,
    minor,
    patch,
    agent,
    installed
  }, "toString", {
    value() {
      return `${this.major}.${this.minor}.${this.patch}`;
    },
    configurable: false,
    enumerable: false
  });
}
function notInstalledResponse() {
  return versionResponse(0, 0, 0, "", false);
}
function version_default() {
  return {
    version() {
      return this._runTask({
        commands: ["--version"],
        format: "utf-8",
        parser: versionParser,
        onError(result, error, done, fail) {
          if (result.exitCode === -2 /* NOT_FOUND */) {
            return done(Buffer.from(NOT_INSTALLED));
          }
          fail(error);
        }
      });
    }
  };
}
function versionParser(stdOut) {
  if (stdOut === NOT_INSTALLED) {
    return notInstalledResponse();
  }
  return parseStringResponse(versionResponse(0, 0, 0, stdOut), parsers7, stdOut);
}
var NOT_INSTALLED, parsers7;
var init_version = __esm({
  "src/lib/tasks/version.ts"() {
    init_utils();
    NOT_INSTALLED = "installed=false";
    parsers7 = [
      new LineParser(/version (\d+)\.(\d+)\.(\d+)(?:\s*\((.+)\))?/, (result, [major, minor, patch, agent = ""]) => {
        Object.assign(result, versionResponse(asNumber(major), asNumber(minor), asNumber(patch), agent));
      }),
      new LineParser(/version (\d+)\.(\d+)\.(\D+)(.+)?$/, (result, [major, minor, patch, agent = ""]) => {
        Object.assign(result, versionResponse(asNumber(major), asNumber(minor), patch, agent));
      })
    ];
  }
});

// src/lib/simple-git-api.ts
var simple_git_api_exports = {};
__export(simple_git_api_exports, {
  SimpleGitApi: () => SimpleGitApi
});
var SimpleGitApi;
var init_simple_git_api = __esm({
  "src/lib/simple-git-api.ts"() {
    init_task_callback();
    init_change_working_directory();
    init_checkout();
    init_commit();
    init_config();
    init_grep();
    init_hash_object();
    init_init();
    init_log();
    init_merge();
    init_push();
    init_show();
    init_status();
    init_task();
    init_version();
    init_utils();
    SimpleGitApi = class {
      constructor(_executor) {
        this._executor = _executor;
      }
      _runTask(task, then) {
        const chain = this._executor.chain();
        const promise = chain.push(task);
        if (then) {
          taskCallback(task, promise, then);
        }
        return Object.create(this, {
          then: { value: promise.then.bind(promise) },
          catch: { value: promise.catch.bind(promise) },
          _executor: { value: chain }
        });
      }
      add(files) {
        return this._runTask(straightThroughStringTask(["add", ...asArray(files)]), trailingFunctionArgument(arguments));
      }
      cwd(directory) {
        const next = trailingFunctionArgument(arguments);
        if (typeof directory === "string") {
          return this._runTask(changeWorkingDirectoryTask(directory, this._executor), next);
        }
        if (typeof (directory == null ? void 0 : directory.path) === "string") {
          return this._runTask(changeWorkingDirectoryTask(directory.path, directory.root && this._executor || void 0), next);
        }
        return this._runTask(configurationErrorTask("Git.cwd: workingDirectory must be supplied as a string"), next);
      }
      hashObject(path, write) {
        return this._runTask(hashObjectTask(path, write === true), trailingFunctionArgument(arguments));
      }
      init(bare) {
        return this._runTask(initTask(bare === true, this._executor.cwd, getTrailingOptions(arguments)), trailingFunctionArgument(arguments));
      }
      merge() {
        return this._runTask(mergeTask(getTrailingOptions(arguments)), trailingFunctionArgument(arguments));
      }
      mergeFromTo(remote, branch) {
        if (!(filterString(remote) && filterString(branch))) {
          return this._runTask(configurationErrorTask(`Git.mergeFromTo requires that the 'remote' and 'branch' arguments are supplied as strings`));
        }
        return this._runTask(mergeTask([remote, branch, ...getTrailingOptions(arguments)]), trailingFunctionArgument(arguments, false));
      }
      outputHandler(handler) {
        this._executor.outputHandler = handler;
        return this;
      }
      push() {
        const task = pushTask({
          remote: filterType(arguments[0], filterString),
          branch: filterType(arguments[1], filterString)
        }, getTrailingOptions(arguments));
        return this._runTask(task, trailingFunctionArgument(arguments));
      }
      stash() {
        return this._runTask(straightThroughStringTask(["stash", ...getTrailingOptions(arguments)]), trailingFunctionArgument(arguments));
      }
      status() {
        return this._runTask(statusTask(getTrailingOptions(arguments)), trailingFunctionArgument(arguments));
      }
    };
    Object.assign(SimpleGitApi.prototype, checkout_default(), commit_default(), config_default(), grep_default(), log_default(), show_default(), version_default());
  }
});

// src/lib/runners/scheduler.ts
var scheduler_exports = {};
__export(scheduler_exports, {
  Scheduler: () => Scheduler
});
var import_promise_deferred2, createScheduledTask, Scheduler;
var init_scheduler = __esm({
  "src/lib/runners/scheduler.ts"() {
    init_utils();
    import_promise_deferred2 = __webpack_require__(9634);
    init_git_logger();
    createScheduledTask = (() => {
      let id = 0;
      return () => {
        id++;
        const { promise, done } = (0, import_promise_deferred2.createDeferred)();
        return {
          promise,
          done,
          id
        };
      };
    })();
    Scheduler = class {
      constructor(concurrency = 2) {
        this.concurrency = concurrency;
        this.logger = createLogger("", "scheduler");
        this.pending = [];
        this.running = [];
        this.logger(`Constructed, concurrency=%s`, concurrency);
      }
      schedule() {
        if (!this.pending.length || this.running.length >= this.concurrency) {
          this.logger(`Schedule attempt ignored, pending=%s running=%s concurrency=%s`, this.pending.length, this.running.length, this.concurrency);
          return;
        }
        const task = append(this.running, this.pending.shift());
        this.logger(`Attempting id=%s`, task.id);
        task.done(() => {
          this.logger(`Completing id=`, task.id);
          remove(this.running, task);
          this.schedule();
        });
      }
      next() {
        const { promise, id } = append(this.pending, createScheduledTask());
        this.logger(`Scheduling id=%s`, id);
        this.schedule();
        return promise;
      }
    };
  }
});

// src/lib/tasks/apply-patch.ts
var apply_patch_exports = {};
__export(apply_patch_exports, {
  applyPatchTask: () => applyPatchTask
});
function applyPatchTask(patches, customArgs) {
  return straightThroughStringTask(["apply", ...customArgs, ...patches]);
}
var init_apply_patch = __esm({
  "src/lib/tasks/apply-patch.ts"() {
    init_task();
  }
});

// src/lib/responses/BranchDeleteSummary.ts
function branchDeletionSuccess(branch, hash) {
  return {
    branch,
    hash,
    success: true
  };
}
function branchDeletionFailure(branch) {
  return {
    branch,
    hash: null,
    success: false
  };
}
var BranchDeletionBatch;
var init_BranchDeleteSummary = __esm({
  "src/lib/responses/BranchDeleteSummary.ts"() {
    BranchDeletionBatch = class {
      constructor() {
        this.all = [];
        this.branches = {};
        this.errors = [];
      }
      get success() {
        return !this.errors.length;
      }
    };
  }
});

// src/lib/parsers/parse-branch-delete.ts
function hasBranchDeletionError(data, processExitCode) {
  return processExitCode === 1 /* ERROR */ && deleteErrorRegex.test(data);
}
var deleteSuccessRegex, deleteErrorRegex, parsers8, parseBranchDeletions;
var init_parse_branch_delete = __esm({
  "src/lib/parsers/parse-branch-delete.ts"() {
    init_BranchDeleteSummary();
    init_utils();
    deleteSuccessRegex = /(\S+)\s+\(\S+\s([^)]+)\)/;
    deleteErrorRegex = /^error[^']+'([^']+)'/m;
    parsers8 = [
      new LineParser(deleteSuccessRegex, (result, [branch, hash]) => {
        const deletion = branchDeletionSuccess(branch, hash);
        result.all.push(deletion);
        result.branches[branch] = deletion;
      }),
      new LineParser(deleteErrorRegex, (result, [branch]) => {
        const deletion = branchDeletionFailure(branch);
        result.errors.push(deletion);
        result.all.push(deletion);
        result.branches[branch] = deletion;
      })
    ];
    parseBranchDeletions = (stdOut, stdErr) => {
      return parseStringResponse(new BranchDeletionBatch(), parsers8, [stdOut, stdErr]);
    };
  }
});

// src/lib/responses/BranchSummary.ts
var BranchSummaryResult;
var init_BranchSummary = __esm({
  "src/lib/responses/BranchSummary.ts"() {
    BranchSummaryResult = class {
      constructor() {
        this.all = [];
        this.branches = {};
        this.current = "";
        this.detached = false;
      }
      push(status, detached, name, commit, label) {
        if (status === "*" /* CURRENT */) {
          this.detached = detached;
          this.current = name;
        }
        this.all.push(name);
        this.branches[name] = {
          current: status === "*" /* CURRENT */,
          linkedWorkTree: status === "+" /* LINKED */,
          name,
          commit,
          label
        };
      }
    };
  }
});

// src/lib/parsers/parse-branch.ts
function branchStatus(input) {
  return input ? input.charAt(0) : "";
}
function parseBranchSummary(stdOut) {
  return parseStringResponse(new BranchSummaryResult(), parsers9, stdOut);
}
var parsers9;
var init_parse_branch = __esm({
  "src/lib/parsers/parse-branch.ts"() {
    init_BranchSummary();
    init_utils();
    parsers9 = [
      new LineParser(/^([*+]\s)?\((?:HEAD )?detached (?:from|at) (\S+)\)\s+([a-z0-9]+)\s(.*)$/, (result, [current, name, commit, label]) => {
        result.push(branchStatus(current), true, name, commit, label);
      }),
      new LineParser(/^([*+]\s)?(\S+)\s+([a-z0-9]+)\s?(.*)$/s, (result, [current, name, commit, label]) => {
        result.push(branchStatus(current), false, name, commit, label);
      })
    ];
  }
});

// src/lib/tasks/branch.ts
var branch_exports = {};
__export(branch_exports, {
  branchLocalTask: () => branchLocalTask,
  branchTask: () => branchTask,
  containsDeleteBranchCommand: () => containsDeleteBranchCommand,
  deleteBranchTask: () => deleteBranchTask,
  deleteBranchesTask: () => deleteBranchesTask
});
function containsDeleteBranchCommand(commands) {
  const deleteCommands = ["-d", "-D", "--delete"];
  return commands.some((command) => deleteCommands.includes(command));
}
function branchTask(customArgs) {
  const isDelete = containsDeleteBranchCommand(customArgs);
  const commands = ["branch", ...customArgs];
  if (commands.length === 1) {
    commands.push("-a");
  }
  if (!commands.includes("-v")) {
    commands.splice(1, 0, "-v");
  }
  return {
    format: "utf-8",
    commands,
    parser(stdOut, stdErr) {
      if (isDelete) {
        return parseBranchDeletions(stdOut, stdErr).all[0];
      }
      return parseBranchSummary(stdOut);
    }
  };
}
function branchLocalTask() {
  const parser3 = parseBranchSummary;
  return {
    format: "utf-8",
    commands: ["branch", "-v"],
    parser: parser3
  };
}
function deleteBranchesTask(branches, forceDelete = false) {
  return {
    format: "utf-8",
    commands: ["branch", "-v", forceDelete ? "-D" : "-d", ...branches],
    parser(stdOut, stdErr) {
      return parseBranchDeletions(stdOut, stdErr);
    },
    onError({ exitCode, stdOut }, error, done, fail) {
      if (!hasBranchDeletionError(String(error), exitCode)) {
        return fail(error);
      }
      done(stdOut);
    }
  };
}
function deleteBranchTask(branch, forceDelete = false) {
  const task = {
    format: "utf-8",
    commands: ["branch", "-v", forceDelete ? "-D" : "-d", branch],
    parser(stdOut, stdErr) {
      return parseBranchDeletions(stdOut, stdErr).branches[branch];
    },
    onError({ exitCode, stdErr, stdOut }, error, _, fail) {
      if (!hasBranchDeletionError(String(error), exitCode)) {
        return fail(error);
      }
      throw new GitResponseError(task.parser(bufferToString(stdOut), bufferToString(stdErr)), String(error));
    }
  };
  return task;
}
var init_branch = __esm({
  "src/lib/tasks/branch.ts"() {
    init_git_response_error();
    init_parse_branch_delete();
    init_parse_branch();
    init_utils();
  }
});

// src/lib/responses/CheckIgnore.ts
var parseCheckIgnore;
var init_CheckIgnore = __esm({
  "src/lib/responses/CheckIgnore.ts"() {
    parseCheckIgnore = (text) => {
      return text.split(/\n/g).map((line) => line.trim()).filter((file) => !!file);
    };
  }
});

// src/lib/tasks/check-ignore.ts
var check_ignore_exports = {};
__export(check_ignore_exports, {
  checkIgnoreTask: () => checkIgnoreTask
});
function checkIgnoreTask(paths) {
  return {
    commands: ["check-ignore", ...paths],
    format: "utf-8",
    parser: parseCheckIgnore
  };
}
var init_check_ignore = __esm({
  "src/lib/tasks/check-ignore.ts"() {
    init_CheckIgnore();
  }
});

// src/lib/tasks/clone.ts
var clone_exports = {};
__export(clone_exports, {
  cloneMirrorTask: () => cloneMirrorTask,
  cloneTask: () => cloneTask
});
function disallowedCommand(command) {
  return /^--upload-pack(=|$)/.test(command);
}
function cloneTask(repo, directory, customArgs) {
  const commands = ["clone", ...customArgs];
  filterString(repo) && commands.push(repo);
  filterString(directory) && commands.push(directory);
  const banned = commands.find(disallowedCommand);
  if (banned) {
    return configurationErrorTask(`git.fetch: potential exploit argument blocked.`);
  }
  return straightThroughStringTask(commands);
}
function cloneMirrorTask(repo, directory, customArgs) {
  append(customArgs, "--mirror");
  return cloneTask(repo, directory, customArgs);
}
var init_clone = __esm({
  "src/lib/tasks/clone.ts"() {
    init_task();
    init_utils();
  }
});

// src/lib/parsers/parse-fetch.ts
function parseFetchResult(stdOut, stdErr) {
  const result = {
    raw: stdOut,
    remote: null,
    branches: [],
    tags: [],
    updated: [],
    deleted: []
  };
  return parseStringResponse(result, parsers10, [stdOut, stdErr]);
}
var parsers10;
var init_parse_fetch = __esm({
  "src/lib/parsers/parse-fetch.ts"() {
    init_utils();
    parsers10 = [
      new LineParser(/From (.+)$/, (result, [remote]) => {
        result.remote = remote;
      }),
      new LineParser(/\* \[new branch]\s+(\S+)\s*-> (.+)$/, (result, [name, tracking]) => {
        result.branches.push({
          name,
          tracking
        });
      }),
      new LineParser(/\* \[new tag]\s+(\S+)\s*-> (.+)$/, (result, [name, tracking]) => {
        result.tags.push({
          name,
          tracking
        });
      }),
      new LineParser(/- \[deleted]\s+\S+\s*-> (.+)$/, (result, [tracking]) => {
        result.deleted.push({
          tracking
        });
      }),
      new LineParser(/\s*([^.]+)\.\.(\S+)\s+(\S+)\s*-> (.+)$/, (result, [from, to, name, tracking]) => {
        result.updated.push({
          name,
          tracking,
          to,
          from
        });
      })
    ];
  }
});

// src/lib/tasks/fetch.ts
var fetch_exports = {};
__export(fetch_exports, {
  fetchTask: () => fetchTask
});
function disallowedCommand2(command) {
  return /^--upload-pack(=|$)/.test(command);
}
function fetchTask(remote, branch, customArgs) {
  const commands = ["fetch", ...customArgs];
  if (remote && branch) {
    commands.push(remote, branch);
  }
  const banned = commands.find(disallowedCommand2);
  if (banned) {
    return configurationErrorTask(`git.fetch: potential exploit argument blocked.`);
  }
  return {
    commands,
    format: "utf-8",
    parser: parseFetchResult
  };
}
var init_fetch = __esm({
  "src/lib/tasks/fetch.ts"() {
    init_parse_fetch();
    init_task();
  }
});

// src/lib/parsers/parse-move.ts
function parseMoveResult(stdOut) {
  return parseStringResponse({ moves: [] }, parsers11, stdOut);
}
var parsers11;
var init_parse_move = __esm({
  "src/lib/parsers/parse-move.ts"() {
    init_utils();
    parsers11 = [
      new LineParser(/^Renaming (.+) to (.+)$/, (result, [from, to]) => {
        result.moves.push({ from, to });
      })
    ];
  }
});

// src/lib/tasks/move.ts
var move_exports = {};
__export(move_exports, {
  moveTask: () => moveTask
});
function moveTask(from, to) {
  return {
    commands: ["mv", "-v", ...asArray(from), to],
    format: "utf-8",
    parser: parseMoveResult
  };
}
var init_move = __esm({
  "src/lib/tasks/move.ts"() {
    init_parse_move();
    init_utils();
  }
});

// src/lib/tasks/pull.ts
var pull_exports = {};
__export(pull_exports, {
  pullTask: () => pullTask
});
function pullTask(remote, branch, customArgs) {
  const commands = ["pull", ...customArgs];
  if (remote && branch) {
    commands.splice(1, 0, remote, branch);
  }
  return {
    commands,
    format: "utf-8",
    parser(stdOut, stdErr) {
      return parsePullResult(stdOut, stdErr);
    },
    onError(result, _error, _done, fail) {
      const pullError = parsePullErrorResult(bufferToString(result.stdOut), bufferToString(result.stdErr));
      if (pullError) {
        return fail(new GitResponseError(pullError));
      }
      fail(_error);
    }
  };
}
var init_pull = __esm({
  "src/lib/tasks/pull.ts"() {
    init_git_response_error();
    init_parse_pull();
    init_utils();
  }
});

// src/lib/responses/GetRemoteSummary.ts
function parseGetRemotes(text) {
  const remotes = {};
  forEach(text, ([name]) => remotes[name] = { name });
  return Object.values(remotes);
}
function parseGetRemotesVerbose(text) {
  const remotes = {};
  forEach(text, ([name, url, purpose]) => {
    if (!remotes.hasOwnProperty(name)) {
      remotes[name] = {
        name,
        refs: { fetch: "", push: "" }
      };
    }
    if (purpose && url) {
      remotes[name].refs[purpose.replace(/[^a-z]/g, "")] = url;
    }
  });
  return Object.values(remotes);
}
function forEach(text, handler) {
  forEachLineWithContent(text, (line) => handler(line.split(/\s+/)));
}
var init_GetRemoteSummary = __esm({
  "src/lib/responses/GetRemoteSummary.ts"() {
    init_utils();
  }
});

// src/lib/tasks/remote.ts
var remote_exports = {};
__export(remote_exports, {
  addRemoteTask: () => addRemoteTask,
  getRemotesTask: () => getRemotesTask,
  listRemotesTask: () => listRemotesTask,
  remoteTask: () => remoteTask,
  removeRemoteTask: () => removeRemoteTask
});
function addRemoteTask(remoteName, remoteRepo, customArgs = []) {
  return straightThroughStringTask(["remote", "add", ...customArgs, remoteName, remoteRepo]);
}
function getRemotesTask(verbose) {
  const commands = ["remote"];
  if (verbose) {
    commands.push("-v");
  }
  return {
    commands,
    format: "utf-8",
    parser: verbose ? parseGetRemotesVerbose : parseGetRemotes
  };
}
function listRemotesTask(customArgs = []) {
  const commands = [...customArgs];
  if (commands[0] !== "ls-remote") {
    commands.unshift("ls-remote");
  }
  return straightThroughStringTask(commands);
}
function remoteTask(customArgs = []) {
  const commands = [...customArgs];
  if (commands[0] !== "remote") {
    commands.unshift("remote");
  }
  return straightThroughStringTask(commands);
}
function removeRemoteTask(remoteName) {
  return straightThroughStringTask(["remote", "remove", remoteName]);
}
var init_remote = __esm({
  "src/lib/tasks/remote.ts"() {
    init_GetRemoteSummary();
    init_task();
  }
});

// src/lib/tasks/stash-list.ts
var stash_list_exports = {};
__export(stash_list_exports, {
  stashListTask: () => stashListTask
});
function stashListTask(opt = {}, customArgs) {
  const options = parseLogOptions(opt);
  const commands = ["stash", "list", ...options.commands, ...customArgs];
  const parser3 = createListLogSummaryParser(options.splitter, options.fields, logFormatFromCommand(commands));
  return validateLogFormatConfig(commands) || {
    commands,
    format: "utf-8",
    parser: parser3
  };
}
var init_stash_list = __esm({
  "src/lib/tasks/stash-list.ts"() {
    init_log_format();
    init_parse_list_log_summary();
    init_diff();
    init_log();
  }
});

// src/lib/tasks/sub-module.ts
var sub_module_exports = {};
__export(sub_module_exports, {
  addSubModuleTask: () => addSubModuleTask,
  initSubModuleTask: () => initSubModuleTask,
  subModuleTask: () => subModuleTask,
  updateSubModuleTask: () => updateSubModuleTask
});
function addSubModuleTask(repo, path) {
  return subModuleTask(["add", repo, path]);
}
function initSubModuleTask(customArgs) {
  return subModuleTask(["init", ...customArgs]);
}
function subModuleTask(customArgs) {
  const commands = [...customArgs];
  if (commands[0] !== "submodule") {
    commands.unshift("submodule");
  }
  return straightThroughStringTask(commands);
}
function updateSubModuleTask(customArgs) {
  return subModuleTask(["update", ...customArgs]);
}
var init_sub_module = __esm({
  "src/lib/tasks/sub-module.ts"() {
    init_task();
  }
});

// src/lib/responses/TagList.ts
function singleSorted(a, b) {
  const aIsNum = isNaN(a);
  const bIsNum = isNaN(b);
  if (aIsNum !== bIsNum) {
    return aIsNum ? 1 : -1;
  }
  return aIsNum ? sorted(a, b) : 0;
}
function sorted(a, b) {
  return a === b ? 0 : a > b ? 1 : -1;
}
function trimmed(input) {
  return input.trim();
}
function toNumber(input) {
  if (typeof input === "string") {
    return parseInt(input.replace(/^\D+/g, ""), 10) || 0;
  }
  return 0;
}
var TagList, parseTagList;
var init_TagList = __esm({
  "src/lib/responses/TagList.ts"() {
    TagList = class {
      constructor(all, latest) {
        this.all = all;
        this.latest = latest;
      }
    };
    parseTagList = function(data, customSort = false) {
      const tags = data.split("\n").map(trimmed).filter(Boolean);
      if (!customSort) {
        tags.sort(function(tagA, tagB) {
          const partsA = tagA.split(".");
          const partsB = tagB.split(".");
          if (partsA.length === 1 || partsB.length === 1) {
            return singleSorted(toNumber(partsA[0]), toNumber(partsB[0]));
          }
          for (let i = 0, l = Math.max(partsA.length, partsB.length); i < l; i++) {
            const diff = sorted(toNumber(partsA[i]), toNumber(partsB[i]));
            if (diff) {
              return diff;
            }
          }
          return 0;
        });
      }
      const latest = customSort ? tags[0] : [...tags].reverse().find((tag) => tag.indexOf(".") >= 0);
      return new TagList(tags, latest);
    };
  }
});

// src/lib/tasks/tag.ts
var tag_exports = {};
__export(tag_exports, {
  addAnnotatedTagTask: () => addAnnotatedTagTask,
  addTagTask: () => addTagTask,
  tagListTask: () => tagListTask
});
function tagListTask(customArgs = []) {
  const hasCustomSort = customArgs.some((option) => /^--sort=/.test(option));
  return {
    format: "utf-8",
    commands: ["tag", "-l", ...customArgs],
    parser(text) {
      return parseTagList(text, hasCustomSort);
    }
  };
}
function addTagTask(name) {
  return {
    format: "utf-8",
    commands: ["tag", name],
    parser() {
      return { name };
    }
  };
}
function addAnnotatedTagTask(name, tagMessage) {
  return {
    format: "utf-8",
    commands: ["tag", "-a", "-m", tagMessage, name],
    parser() {
      return { name };
    }
  };
}
var init_tag = __esm({
  "src/lib/tasks/tag.ts"() {
    init_TagList();
  }
});

// src/git.js
var require_git = __commonJS({
  "src/git.js"(exports2, module2) {
    var { GitExecutor: GitExecutor2 } = (init_git_executor(), __toCommonJS(git_executor_exports));
    var { SimpleGitApi: SimpleGitApi2 } = (init_simple_git_api(), __toCommonJS(simple_git_api_exports));
    var { Scheduler: Scheduler2 } = (init_scheduler(), __toCommonJS(scheduler_exports));
    var { configurationErrorTask: configurationErrorTask2 } = (init_task(), __toCommonJS(task_exports));
    var {
      asArray: asArray2,
      filterArray: filterArray2,
      filterPrimitives: filterPrimitives2,
      filterString: filterString2,
      filterStringOrStringArray: filterStringOrStringArray2,
      filterType: filterType2,
      getTrailingOptions: getTrailingOptions2,
      trailingFunctionArgument: trailingFunctionArgument2,
      trailingOptionsArgument: trailingOptionsArgument2
    } = (init_utils(), __toCommonJS(utils_exports));
    var { applyPatchTask: applyPatchTask2 } = (init_apply_patch(), __toCommonJS(apply_patch_exports));
    var {
      branchTask: branchTask2,
      branchLocalTask: branchLocalTask2,
      deleteBranchesTask: deleteBranchesTask2,
      deleteBranchTask: deleteBranchTask2
    } = (init_branch(), __toCommonJS(branch_exports));
    var { checkIgnoreTask: checkIgnoreTask2 } = (init_check_ignore(), __toCommonJS(check_ignore_exports));
    var { checkIsRepoTask: checkIsRepoTask2 } = (init_check_is_repo(), __toCommonJS(check_is_repo_exports));
    var { cloneTask: cloneTask2, cloneMirrorTask: cloneMirrorTask2 } = (init_clone(), __toCommonJS(clone_exports));
    var { cleanWithOptionsTask: cleanWithOptionsTask2, isCleanOptionsArray: isCleanOptionsArray2 } = (init_clean(), __toCommonJS(clean_exports));
    var { diffSummaryTask: diffSummaryTask2 } = (init_diff(), __toCommonJS(diff_exports));
    var { fetchTask: fetchTask2 } = (init_fetch(), __toCommonJS(fetch_exports));
    var { moveTask: moveTask2 } = (init_move(), __toCommonJS(move_exports));
    var { pullTask: pullTask2 } = (init_pull(), __toCommonJS(pull_exports));
    var { pushTagsTask: pushTagsTask2 } = (init_push(), __toCommonJS(push_exports));
    var {
      addRemoteTask: addRemoteTask2,
      getRemotesTask: getRemotesTask2,
      listRemotesTask: listRemotesTask2,
      remoteTask: remoteTask2,
      removeRemoteTask: removeRemoteTask2
    } = (init_remote(), __toCommonJS(remote_exports));
    var { getResetMode: getResetMode2, resetTask: resetTask2 } = (init_reset(), __toCommonJS(reset_exports));
    var { stashListTask: stashListTask2 } = (init_stash_list(), __toCommonJS(stash_list_exports));
    var {
      addSubModuleTask: addSubModuleTask2,
      initSubModuleTask: initSubModuleTask2,
      subModuleTask: subModuleTask2,
      updateSubModuleTask: updateSubModuleTask2
    } = (init_sub_module(), __toCommonJS(sub_module_exports));
    var { addAnnotatedTagTask: addAnnotatedTagTask2, addTagTask: addTagTask2, tagListTask: tagListTask2 } = (init_tag(), __toCommonJS(tag_exports));
    var { straightThroughBufferTask: straightThroughBufferTask2, straightThroughStringTask: straightThroughStringTask2 } = (init_task(), __toCommonJS(task_exports));
    function Git2(options, plugins) {
      this._executor = new GitExecutor2(options.binary, options.baseDir, new Scheduler2(options.maxConcurrentProcesses), plugins);
      this._trimmed = options.trimmed;
    }
    (Git2.prototype = Object.create(SimpleGitApi2.prototype)).constructor = Git2;
    Git2.prototype.customBinary = function(command) {
      this._executor.binary = command;
      return this;
    };
    Git2.prototype.env = function(name, value) {
      if (arguments.length === 1 && typeof name === "object") {
        this._executor.env = name;
      } else {
        (this._executor.env = this._executor.env || {})[name] = value;
      }
      return this;
    };
    Git2.prototype.stashList = function(options) {
      return this._runTask(stashListTask2(trailingOptionsArgument2(arguments) || {}, filterArray2(options) && options || []), trailingFunctionArgument2(arguments));
    };
    function createCloneTask(api, task, repoPath, localPath) {
      if (typeof repoPath !== "string") {
        return configurationErrorTask2(`git.${api}() requires a string 'repoPath'`);
      }
      return task(repoPath, filterType2(localPath, filterString2), getTrailingOptions2(arguments));
    }
    Git2.prototype.clone = function() {
      return this._runTask(createCloneTask("clone", cloneTask2, ...arguments), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.mirror = function() {
      return this._runTask(createCloneTask("mirror", cloneMirrorTask2, ...arguments), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.mv = function(from, to) {
      return this._runTask(moveTask2(from, to), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.checkoutLatestTag = function(then) {
      var git = this;
      return this.pull(function() {
        git.tags(function(err, tags) {
          git.checkout(tags.latest, then);
        });
      });
    };
    Git2.prototype.pull = function(remote, branch, options, then) {
      return this._runTask(pullTask2(filterType2(remote, filterString2), filterType2(branch, filterString2), getTrailingOptions2(arguments)), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.fetch = function(remote, branch) {
      return this._runTask(fetchTask2(filterType2(remote, filterString2), filterType2(branch, filterString2), getTrailingOptions2(arguments)), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.silent = function(silence) {
      console.warn("simple-git deprecation notice: git.silent: logging should be configured using the `debug` library / `DEBUG` environment variable, this will be an error in version 3");
      return this;
    };
    Git2.prototype.tags = function(options, then) {
      return this._runTask(tagListTask2(getTrailingOptions2(arguments)), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.rebase = function() {
      return this._runTask(straightThroughStringTask2(["rebase", ...getTrailingOptions2(arguments)]), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.reset = function(mode) {
      return this._runTask(resetTask2(getResetMode2(mode), getTrailingOptions2(arguments)), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.revert = function(commit) {
      const next = trailingFunctionArgument2(arguments);
      if (typeof commit !== "string") {
        return this._runTask(configurationErrorTask2("Commit must be a string"), next);
      }
      return this._runTask(straightThroughStringTask2(["revert", ...getTrailingOptions2(arguments, 0, true), commit]), next);
    };
    Git2.prototype.addTag = function(name) {
      const task = typeof name === "string" ? addTagTask2(name) : configurationErrorTask2("Git.addTag requires a tag name");
      return this._runTask(task, trailingFunctionArgument2(arguments));
    };
    Git2.prototype.addAnnotatedTag = function(tagName, tagMessage) {
      return this._runTask(addAnnotatedTagTask2(tagName, tagMessage), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.deleteLocalBranch = function(branchName, forceDelete, then) {
      return this._runTask(deleteBranchTask2(branchName, typeof forceDelete === "boolean" ? forceDelete : false), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.deleteLocalBranches = function(branchNames, forceDelete, then) {
      return this._runTask(deleteBranchesTask2(branchNames, typeof forceDelete === "boolean" ? forceDelete : false), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.branch = function(options, then) {
      return this._runTask(branchTask2(getTrailingOptions2(arguments)), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.branchLocal = function(then) {
      return this._runTask(branchLocalTask2(), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.raw = function(commands) {
      const createRestCommands = !Array.isArray(commands);
      const command = [].slice.call(createRestCommands ? arguments : commands, 0);
      for (let i = 0; i < command.length && createRestCommands; i++) {
        if (!filterPrimitives2(command[i])) {
          command.splice(i, command.length - i);
          break;
        }
      }
      command.push(...getTrailingOptions2(arguments, 0, true));
      var next = trailingFunctionArgument2(arguments);
      if (!command.length) {
        return this._runTask(configurationErrorTask2("Raw: must supply one or more command to execute"), next);
      }
      return this._runTask(straightThroughStringTask2(command, this._trimmed), next);
    };
    Git2.prototype.submoduleAdd = function(repo, path, then) {
      return this._runTask(addSubModuleTask2(repo, path), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.submoduleUpdate = function(args, then) {
      return this._runTask(updateSubModuleTask2(getTrailingOptions2(arguments, true)), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.submoduleInit = function(args, then) {
      return this._runTask(initSubModuleTask2(getTrailingOptions2(arguments, true)), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.subModule = function(options, then) {
      return this._runTask(subModuleTask2(getTrailingOptions2(arguments)), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.listRemote = function() {
      return this._runTask(listRemotesTask2(getTrailingOptions2(arguments)), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.addRemote = function(remoteName, remoteRepo, then) {
      return this._runTask(addRemoteTask2(remoteName, remoteRepo, getTrailingOptions2(arguments)), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.removeRemote = function(remoteName, then) {
      return this._runTask(removeRemoteTask2(remoteName), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.getRemotes = function(verbose, then) {
      return this._runTask(getRemotesTask2(verbose === true), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.remote = function(options, then) {
      return this._runTask(remoteTask2(getTrailingOptions2(arguments)), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.tag = function(options, then) {
      const command = getTrailingOptions2(arguments);
      if (command[0] !== "tag") {
        command.unshift("tag");
      }
      return this._runTask(straightThroughStringTask2(command), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.updateServerInfo = function(then) {
      return this._runTask(straightThroughStringTask2(["update-server-info"]), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.pushTags = function(remote, then) {
      const task = pushTagsTask2({ remote: filterType2(remote, filterString2) }, getTrailingOptions2(arguments));
      return this._runTask(task, trailingFunctionArgument2(arguments));
    };
    Git2.prototype.rm = function(files) {
      return this._runTask(straightThroughStringTask2(["rm", "-f", ...asArray2(files)]), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.rmKeepLocal = function(files) {
      return this._runTask(straightThroughStringTask2(["rm", "--cached", ...asArray2(files)]), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.catFile = function(options, then) {
      return this._catFile("utf-8", arguments);
    };
    Git2.prototype.binaryCatFile = function() {
      return this._catFile("buffer", arguments);
    };
    Git2.prototype._catFile = function(format, args) {
      var handler = trailingFunctionArgument2(args);
      var command = ["cat-file"];
      var options = args[0];
      if (typeof options === "string") {
        return this._runTask(configurationErrorTask2("Git.catFile: options must be supplied as an array of strings"), handler);
      }
      if (Array.isArray(options)) {
        command.push.apply(command, options);
      }
      const task = format === "buffer" ? straightThroughBufferTask2(command) : straightThroughStringTask2(command);
      return this._runTask(task, handler);
    };
    Git2.prototype.diff = function(options, then) {
      const task = filterString2(options) ? configurationErrorTask2("git.diff: supplying options as a single string is no longer supported, switch to an array of strings") : straightThroughStringTask2(["diff", ...getTrailingOptions2(arguments)]);
      return this._runTask(task, trailingFunctionArgument2(arguments));
    };
    Git2.prototype.diffSummary = function() {
      return this._runTask(diffSummaryTask2(getTrailingOptions2(arguments, 1)), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.applyPatch = function(patches) {
      const task = !filterStringOrStringArray2(patches) ? configurationErrorTask2(`git.applyPatch requires one or more string patches as the first argument`) : applyPatchTask2(asArray2(patches), getTrailingOptions2([].slice.call(arguments, 1)));
      return this._runTask(task, trailingFunctionArgument2(arguments));
    };
    Git2.prototype.revparse = function() {
      const commands = ["rev-parse", ...getTrailingOptions2(arguments, true)];
      return this._runTask(straightThroughStringTask2(commands, true), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.clean = function(mode, options, then) {
      const usingCleanOptionsArray = isCleanOptionsArray2(mode);
      const cleanMode = usingCleanOptionsArray && mode.join("") || filterType2(mode, filterString2) || "";
      const customArgs = getTrailingOptions2([].slice.call(arguments, usingCleanOptionsArray ? 1 : 0));
      return this._runTask(cleanWithOptionsTask2(cleanMode, customArgs), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.exec = function(then) {
      const task = {
        commands: [],
        format: "utf-8",
        parser() {
          if (typeof then === "function") {
            then();
          }
        }
      };
      return this._runTask(task);
    };
    Git2.prototype.clearQueue = function() {
      return this;
    };
    Git2.prototype.checkIgnore = function(pathnames, then) {
      return this._runTask(checkIgnoreTask2(asArray2(filterType2(pathnames, filterStringOrStringArray2, []))), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.checkIsRepo = function(checkType, then) {
      return this._runTask(checkIsRepoTask2(filterType2(checkType, filterString2)), trailingFunctionArgument2(arguments));
    };
    module2.exports = Git2;
  }
});

// src/lib/git-factory.ts
var git_factory_exports = {};
__export(git_factory_exports, {
  esModuleFactory: () => esModuleFactory,
  gitExportFactory: () => gitExportFactory,
  gitInstanceFactory: () => gitInstanceFactory
});
function esModuleFactory(defaultExport) {
  return Object.defineProperties(defaultExport, {
    __esModule: { value: true },
    default: { value: defaultExport }
  });
}
function gitExportFactory(factory) {
  return Object.assign(factory.bind(null), api_exports);
}
function gitInstanceFactory(baseDir, options) {
  const plugins = new PluginStore();
  const config = createInstanceConfig(baseDir && (typeof baseDir === "string" ? { baseDir } : baseDir) || {}, options);
  if (!folderExists(config.baseDir)) {
    throw new GitConstructError(config, `Cannot use simple-git on a directory that does not exist`);
  }
  if (Array.isArray(config.config)) {
    plugins.add(commandConfigPrefixingPlugin(config.config));
  }
  plugins.add(blockUnsafeOperationsPlugin(config.unsafe));
  plugins.add(suffixPathsPlugin());
  plugins.add(completionDetectionPlugin(config.completion));
  config.abort && plugins.add(abortPlugin(config.abort));
  config.progress && plugins.add(progressMonitorPlugin(config.progress));
  config.timeout && plugins.add(timeoutPlugin(config.timeout));
  config.spawnOptions && plugins.add(spawnOptionsPlugin(config.spawnOptions));
  plugins.add(errorDetectionPlugin(errorDetectionHandler(true)));
  config.errors && plugins.add(errorDetectionPlugin(config.errors));
  return new Git(config, plugins);
}
var Git;
var init_git_factory = __esm({
  "src/lib/git-factory.ts"() {
    init_api();
    init_plugins();
    init_suffix_paths_plugin();
    init_utils();
    Git = require_git();
  }
});

// src/lib/runners/promise-wrapped.ts
var promise_wrapped_exports = {};
__export(promise_wrapped_exports, {
  gitP: () => gitP
});
function gitP(...args) {
  let git;
  let chain = Promise.resolve();
  try {
    git = gitInstanceFactory(...args);
  } catch (e) {
    chain = Promise.reject(e);
  }
  function builderReturn() {
    return promiseApi;
  }
  function chainReturn() {
    return chain;
  }
  const promiseApi = [...functionNamesBuilderApi, ...functionNamesPromiseApi].reduce((api, name) => {
    const isAsync = functionNamesPromiseApi.includes(name);
    const valid = isAsync ? asyncWrapper(name, git) : syncWrapper(name, git, api);
    const alternative = isAsync ? chainReturn : builderReturn;
    Object.defineProperty(api, name, {
      enumerable: false,
      configurable: false,
      value: git ? valid : alternative
    });
    return api;
  }, {});
  return promiseApi;
  function asyncWrapper(fn, git2) {
    return function(...args2) {
      if (typeof args2[args2.length] === "function") {
        throw new TypeError("Promise interface requires that handlers are not supplied inline, trailing function not allowed in call to " + fn);
      }
      return chain.then(function() {
        return new Promise(function(resolve, reject) {
          const callback = (err, result) => {
            if (err) {
              return reject(toError(err));
            }
            resolve(result);
          };
          args2.push(callback);
          git2[fn].apply(git2, args2);
        });
      });
    };
  }
  function syncWrapper(fn, git2, api) {
    return (...args2) => {
      git2[fn](...args2);
      return api;
    };
  }
}
function toError(error) {
  if (error instanceof Error) {
    return error;
  }
  if (typeof error === "string") {
    return new Error(error);
  }
  return new GitResponseError(error);
}
var functionNamesBuilderApi, functionNamesPromiseApi;
var init_promise_wrapped = __esm({
  "src/lib/runners/promise-wrapped.ts"() {
    init_git_response_error();
    init_git_factory();
    functionNamesBuilderApi = ["customBinary", "env", "outputHandler", "silent"];
    functionNamesPromiseApi = [
      "add",
      "addAnnotatedTag",
      "addConfig",
      "addRemote",
      "addTag",
      "applyPatch",
      "binaryCatFile",
      "branch",
      "branchLocal",
      "catFile",
      "checkIgnore",
      "checkIsRepo",
      "checkout",
      "checkoutBranch",
      "checkoutLatestTag",
      "checkoutLocalBranch",
      "clean",
      "clone",
      "commit",
      "cwd",
      "deleteLocalBranch",
      "deleteLocalBranches",
      "diff",
      "diffSummary",
      "exec",
      "fetch",
      "getRemotes",
      "init",
      "listConfig",
      "listRemote",
      "log",
      "merge",
      "mergeFromTo",
      "mirror",
      "mv",
      "pull",
      "push",
      "pushTags",
      "raw",
      "rebase",
      "remote",
      "removeRemote",
      "reset",
      "revert",
      "revparse",
      "rm",
      "rmKeepLocal",
      "show",
      "stash",
      "stashList",
      "status",
      "subModule",
      "submoduleAdd",
      "submoduleInit",
      "submoduleUpdate",
      "tag",
      "tags",
      "updateServerInfo"
    ];
  }
});

// src/index.js
var { gitP: gitP2 } = (init_promise_wrapped(), __toCommonJS(promise_wrapped_exports));
var { esModuleFactory: esModuleFactory2, gitInstanceFactory: gitInstanceFactory2, gitExportFactory: gitExportFactory2 } = (init_git_factory(), __toCommonJS(git_factory_exports));
var simpleGit = esModuleFactory2(gitExportFactory2(gitInstanceFactory2));
module.exports = Object.assign(simpleGit, { gitP: gitP2, simpleGit });
//# sourceMappingURL=index.js.map


/***/ }),

/***/ 95427:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

const os = __webpack_require__(22037);
const hasFlag = __webpack_require__(61802);

const env = process.env;

let forceColor;
if (hasFlag('no-color') ||
	hasFlag('no-colors') ||
	hasFlag('color=false')) {
	forceColor = false;
} else if (hasFlag('color') ||
	hasFlag('colors') ||
	hasFlag('color=true') ||
	hasFlag('color=always')) {
	forceColor = true;
}
if ('FORCE_COLOR' in env) {
	forceColor = env.FORCE_COLOR.length === 0 || parseInt(env.FORCE_COLOR, 10) !== 0;
}

function translateLevel(level) {
	if (level === 0) {
		return false;
	}

	return {
		level,
		hasBasic: true,
		has256: level >= 2,
		has16m: level >= 3
	};
}

function supportsColor(stream) {
	if (forceColor === false) {
		return 0;
	}

	if (hasFlag('color=16m') ||
		hasFlag('color=full') ||
		hasFlag('color=truecolor')) {
		return 3;
	}

	if (hasFlag('color=256')) {
		return 2;
	}

	if (stream && !stream.isTTY && forceColor !== true) {
		return 0;
	}

	const min = forceColor ? 1 : 0;

	if (process.platform === 'win32') {
		// Node.js 7.5.0 is the first version of Node.js to include a patch to
		// libuv that enables 256 color output on Windows. Anything earlier and it
		// won't work. However, here we target Node.js 8 at minimum as it is an LTS
		// release, and Node.js 7 is not. Windows 10 build 10586 is the first Windows
		// release that supports 256 colors. Windows 10 build 14931 is the first release
		// that supports 16m/TrueColor.
		const osRelease = os.release().split('.');
		if (
			Number(process.versions.node.split('.')[0]) >= 8 &&
			Number(osRelease[0]) >= 10 &&
			Number(osRelease[2]) >= 10586
		) {
			return Number(osRelease[2]) >= 14931 ? 3 : 2;
		}

		return 1;
	}

	if ('CI' in env) {
		if (['TRAVIS', 'CIRCLECI', 'APPVEYOR', 'GITLAB_CI'].some(sign => sign in env) || env.CI_NAME === 'codeship') {
			return 1;
		}

		return min;
	}

	if ('TEAMCITY_VERSION' in env) {
		return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
	}

	if (env.COLORTERM === 'truecolor') {
		return 3;
	}

	if ('TERM_PROGRAM' in env) {
		const version = parseInt((env.TERM_PROGRAM_VERSION || '').split('.')[0], 10);

		switch (env.TERM_PROGRAM) {
			case 'iTerm.app':
				return version >= 3 ? 3 : 2;
			case 'Apple_Terminal':
				return 2;
			// No default
		}
	}

	if (/-256(color)?$/i.test(env.TERM)) {
		return 2;
	}

	if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
		return 1;
	}

	if ('COLORTERM' in env) {
		return 1;
	}

	if (env.TERM === 'dumb') {
		return min;
	}

	return min;
}

function getSupportLevel(stream) {
	const level = supportsColor(stream);
	return translateLevel(level);
}

module.exports = {
	supportsColor: getSupportLevel,
	stdout: getSupportLevel(process.stdout),
	stderr: getSupportLevel(process.stderr)
};


/***/ }),

/***/ 50930:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var punycode = __webpack_require__(85477);
var mappingTable = __webpack_require__(31229);

var PROCESSING_OPTIONS = {
  TRANSITIONAL: 0,
  NONTRANSITIONAL: 1
};

function normalize(str) { // fix bug in v8
  return str.split('\u0000').map(function (s) { return s.normalize('NFC'); }).join('\u0000');
}

function findStatus(val) {
  var start = 0;
  var end = mappingTable.length - 1;

  while (start <= end) {
    var mid = Math.floor((start + end) / 2);

    var target = mappingTable[mid];
    if (target[0][0] <= val && target[0][1] >= val) {
      return target;
    } else if (target[0][0] > val) {
      end = mid - 1;
    } else {
      start = mid + 1;
    }
  }

  return null;
}

var regexAstralSymbols = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;

function countSymbols(string) {
  return string
    // replace every surrogate pair with a BMP symbol
    .replace(regexAstralSymbols, '_')
    // then get the length
    .length;
}

function mapChars(domain_name, useSTD3, processing_option) {
  var hasError = false;
  var processed = "";

  var len = countSymbols(domain_name);
  for (var i = 0; i < len; ++i) {
    var codePoint = domain_name.codePointAt(i);
    var status = findStatus(codePoint);

    switch (status[1]) {
      case "disallowed":
        hasError = true;
        processed += String.fromCodePoint(codePoint);
        break;
      case "ignored":
        break;
      case "mapped":
        processed += String.fromCodePoint.apply(String, status[2]);
        break;
      case "deviation":
        if (processing_option === PROCESSING_OPTIONS.TRANSITIONAL) {
          processed += String.fromCodePoint.apply(String, status[2]);
        } else {
          processed += String.fromCodePoint(codePoint);
        }
        break;
      case "valid":
        processed += String.fromCodePoint(codePoint);
        break;
      case "disallowed_STD3_mapped":
        if (useSTD3) {
          hasError = true;
          processed += String.fromCodePoint(codePoint);
        } else {
          processed += String.fromCodePoint.apply(String, status[2]);
        }
        break;
      case "disallowed_STD3_valid":
        if (useSTD3) {
          hasError = true;
        }

        processed += String.fromCodePoint(codePoint);
        break;
    }
  }

  return {
    string: processed,
    error: hasError
  };
}

var combiningMarksRegex = /[\u0300-\u036F\u0483-\u0489\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08E4-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962\u0963\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09E2\u09E3\u0A01-\u0A03\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE2\u0AE3\u0B01-\u0B03\u0B3C\u0B3E-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B62\u0B63\u0B82\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0C00-\u0C03\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C81-\u0C83\u0CBC\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CE2\u0CE3\u0D01-\u0D03\u0D3E-\u0D44\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D62\u0D63\u0D82\u0D83\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DF2\u0DF3\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB\u0EBC\u0EC8-\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F3E\u0F3F\u0F71-\u0F84\u0F86\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102B-\u103E\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F\u109A-\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4-\u17D3\u17DD\u180B-\u180D\u18A9\u1920-\u192B\u1930-\u193B\u19B0-\u19C0\u19C8\u19C9\u1A17-\u1A1B\u1A55-\u1A5E\u1A60-\u1A7C\u1A7F\u1AB0-\u1ABE\u1B00-\u1B04\u1B34-\u1B44\u1B6B-\u1B73\u1B80-\u1B82\u1BA1-\u1BAD\u1BE6-\u1BF3\u1C24-\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE8\u1CED\u1CF2-\u1CF4\u1CF8\u1CF9\u1DC0-\u1DF5\u1DFC-\u1DFF\u20D0-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302F\u3099\u309A\uA66F-\uA672\uA674-\uA67D\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA823-\uA827\uA880\uA881\uA8B4-\uA8C4\uA8E0-\uA8F1\uA926-\uA92D\uA947-\uA953\uA980-\uA983\uA9B3-\uA9C0\uA9E5\uAA29-\uAA36\uAA43\uAA4C\uAA4D\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEB-\uAAEF\uAAF5\uAAF6\uABE3-\uABEA\uABEC\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE2D]|\uD800[\uDDFD\uDEE0\uDF76-\uDF7A]|\uD802[\uDE01-\uDE03\uDE05\uDE06\uDE0C-\uDE0F\uDE38-\uDE3A\uDE3F\uDEE5\uDEE6]|\uD804[\uDC00-\uDC02\uDC38-\uDC46\uDC7F-\uDC82\uDCB0-\uDCBA\uDD00-\uDD02\uDD27-\uDD34\uDD73\uDD80-\uDD82\uDDB3-\uDDC0\uDE2C-\uDE37\uDEDF-\uDEEA\uDF01-\uDF03\uDF3C\uDF3E-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF57\uDF62\uDF63\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDCB0-\uDCC3\uDDAF-\uDDB5\uDDB8-\uDDC0\uDE30-\uDE40\uDEAB-\uDEB7]|\uD81A[\uDEF0-\uDEF4\uDF30-\uDF36]|\uD81B[\uDF51-\uDF7E\uDF8F-\uDF92]|\uD82F[\uDC9D\uDC9E]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD83A[\uDCD0-\uDCD6]|\uDB40[\uDD00-\uDDEF]/;

function validateLabel(label, processing_option) {
  if (label.substr(0, 4) === "xn--") {
    label = punycode.toUnicode(label);
    processing_option = PROCESSING_OPTIONS.NONTRANSITIONAL;
  }

  var error = false;

  if (normalize(label) !== label ||
      (label[3] === "-" && label[4] === "-") ||
      label[0] === "-" || label[label.length - 1] === "-" ||
      label.indexOf(".") !== -1 ||
      label.search(combiningMarksRegex) === 0) {
    error = true;
  }

  var len = countSymbols(label);
  for (var i = 0; i < len; ++i) {
    var status = findStatus(label.codePointAt(i));
    if ((processing === PROCESSING_OPTIONS.TRANSITIONAL && status[1] !== "valid") ||
        (processing === PROCESSING_OPTIONS.NONTRANSITIONAL &&
         status[1] !== "valid" && status[1] !== "deviation")) {
      error = true;
      break;
    }
  }

  return {
    label: label,
    error: error
  };
}

function processing(domain_name, useSTD3, processing_option) {
  var result = mapChars(domain_name, useSTD3, processing_option);
  result.string = normalize(result.string);

  var labels = result.string.split(".");
  for (var i = 0; i < labels.length; ++i) {
    try {
      var validation = validateLabel(labels[i]);
      labels[i] = validation.label;
      result.error = result.error || validation.error;
    } catch(e) {
      result.error = true;
    }
  }

  return {
    string: labels.join("."),
    error: result.error
  };
}

module.exports.toASCII = function(domain_name, useSTD3, processing_option, verifyDnsLength) {
  var result = processing(domain_name, useSTD3, processing_option);
  var labels = result.string.split(".");
  labels = labels.map(function(l) {
    try {
      return punycode.toASCII(l);
    } catch(e) {
      result.error = true;
      return l;
    }
  });

  if (verifyDnsLength) {
    var total = labels.slice(0, labels.length - 1).join(".").length;
    if (total.length > 253 || total.length === 0) {
      result.error = true;
    }

    for (var i=0; i < labels.length; ++i) {
      if (labels.length > 63 || labels.length === 0) {
        result.error = true;
        break;
      }
    }
  }

  if (result.error) return null;
  return labels.join(".");
};

module.exports.toUnicode = function(domain_name, useSTD3) {
  var result = processing(domain_name, useSTD3, PROCESSING_OPTIONS.NONTRANSITIONAL);

  return {
    domain: result.string,
    error: result.error
  };
};

module.exports.PROCESSING_OPTIONS = PROCESSING_OPTIONS;


/***/ }),

/***/ 16462:
/***/ (function(__unused_webpack_module, exports) {

/** @license URI.js v4.4.1 (c) 2011 Gary Court. License: http://github.com/garycourt/uri-js */
(function (global, factory) {
	 true ? factory(exports) :
	0;
}(this, (function (exports) { 'use strict';

function merge() {
    for (var _len = arguments.length, sets = Array(_len), _key = 0; _key < _len; _key++) {
        sets[_key] = arguments[_key];
    }

    if (sets.length > 1) {
        sets[0] = sets[0].slice(0, -1);
        var xl = sets.length - 1;
        for (var x = 1; x < xl; ++x) {
            sets[x] = sets[x].slice(1, -1);
        }
        sets[xl] = sets[xl].slice(1);
        return sets.join('');
    } else {
        return sets[0];
    }
}
function subexp(str) {
    return "(?:" + str + ")";
}
function typeOf(o) {
    return o === undefined ? "undefined" : o === null ? "null" : Object.prototype.toString.call(o).split(" ").pop().split("]").shift().toLowerCase();
}
function toUpperCase(str) {
    return str.toUpperCase();
}
function toArray(obj) {
    return obj !== undefined && obj !== null ? obj instanceof Array ? obj : typeof obj.length !== "number" || obj.split || obj.setInterval || obj.call ? [obj] : Array.prototype.slice.call(obj) : [];
}
function assign(target, source) {
    var obj = target;
    if (source) {
        for (var key in source) {
            obj[key] = source[key];
        }
    }
    return obj;
}

function buildExps(isIRI) {
    var ALPHA$$ = "[A-Za-z]",
        CR$ = "[\\x0D]",
        DIGIT$$ = "[0-9]",
        DQUOTE$$ = "[\\x22]",
        HEXDIG$$ = merge(DIGIT$$, "[A-Fa-f]"),
        //case-insensitive
    LF$$ = "[\\x0A]",
        SP$$ = "[\\x20]",
        PCT_ENCODED$ = subexp(subexp("%[EFef]" + HEXDIG$$ + "%" + HEXDIG$$ + HEXDIG$$ + "%" + HEXDIG$$ + HEXDIG$$) + "|" + subexp("%[89A-Fa-f]" + HEXDIG$$ + "%" + HEXDIG$$ + HEXDIG$$) + "|" + subexp("%" + HEXDIG$$ + HEXDIG$$)),
        //expanded
    GEN_DELIMS$$ = "[\\:\\/\\?\\#\\[\\]\\@]",
        SUB_DELIMS$$ = "[\\!\\$\\&\\'\\(\\)\\*\\+\\,\\;\\=]",
        RESERVED$$ = merge(GEN_DELIMS$$, SUB_DELIMS$$),
        UCSCHAR$$ = isIRI ? "[\\xA0-\\u200D\\u2010-\\u2029\\u202F-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF]" : "[]",
        //subset, excludes bidi control characters
    IPRIVATE$$ = isIRI ? "[\\uE000-\\uF8FF]" : "[]",
        //subset
    UNRESERVED$$ = merge(ALPHA$$, DIGIT$$, "[\\-\\.\\_\\~]", UCSCHAR$$),
        SCHEME$ = subexp(ALPHA$$ + merge(ALPHA$$, DIGIT$$, "[\\+\\-\\.]") + "*"),
        USERINFO$ = subexp(subexp(PCT_ENCODED$ + "|" + merge(UNRESERVED$$, SUB_DELIMS$$, "[\\:]")) + "*"),
        DEC_OCTET$ = subexp(subexp("25[0-5]") + "|" + subexp("2[0-4]" + DIGIT$$) + "|" + subexp("1" + DIGIT$$ + DIGIT$$) + "|" + subexp("[1-9]" + DIGIT$$) + "|" + DIGIT$$),
        DEC_OCTET_RELAXED$ = subexp(subexp("25[0-5]") + "|" + subexp("2[0-4]" + DIGIT$$) + "|" + subexp("1" + DIGIT$$ + DIGIT$$) + "|" + subexp("0?[1-9]" + DIGIT$$) + "|0?0?" + DIGIT$$),
        //relaxed parsing rules
    IPV4ADDRESS$ = subexp(DEC_OCTET_RELAXED$ + "\\." + DEC_OCTET_RELAXED$ + "\\." + DEC_OCTET_RELAXED$ + "\\." + DEC_OCTET_RELAXED$),
        H16$ = subexp(HEXDIG$$ + "{1,4}"),
        LS32$ = subexp(subexp(H16$ + "\\:" + H16$) + "|" + IPV4ADDRESS$),
        IPV6ADDRESS1$ = subexp(subexp(H16$ + "\\:") + "{6}" + LS32$),
        //                           6( h16 ":" ) ls32
    IPV6ADDRESS2$ = subexp("\\:\\:" + subexp(H16$ + "\\:") + "{5}" + LS32$),
        //                      "::" 5( h16 ":" ) ls32
    IPV6ADDRESS3$ = subexp(subexp(H16$) + "?\\:\\:" + subexp(H16$ + "\\:") + "{4}" + LS32$),
        //[               h16 ] "::" 4( h16 ":" ) ls32
    IPV6ADDRESS4$ = subexp(subexp(subexp(H16$ + "\\:") + "{0,1}" + H16$) + "?\\:\\:" + subexp(H16$ + "\\:") + "{3}" + LS32$),
        //[ *1( h16 ":" ) h16 ] "::" 3( h16 ":" ) ls32
    IPV6ADDRESS5$ = subexp(subexp(subexp(H16$ + "\\:") + "{0,2}" + H16$) + "?\\:\\:" + subexp(H16$ + "\\:") + "{2}" + LS32$),
        //[ *2( h16 ":" ) h16 ] "::" 2( h16 ":" ) ls32
    IPV6ADDRESS6$ = subexp(subexp(subexp(H16$ + "\\:") + "{0,3}" + H16$) + "?\\:\\:" + H16$ + "\\:" + LS32$),
        //[ *3( h16 ":" ) h16 ] "::"    h16 ":"   ls32
    IPV6ADDRESS7$ = subexp(subexp(subexp(H16$ + "\\:") + "{0,4}" + H16$) + "?\\:\\:" + LS32$),
        //[ *4( h16 ":" ) h16 ] "::"              ls32
    IPV6ADDRESS8$ = subexp(subexp(subexp(H16$ + "\\:") + "{0,5}" + H16$) + "?\\:\\:" + H16$),
        //[ *5( h16 ":" ) h16 ] "::"              h16
    IPV6ADDRESS9$ = subexp(subexp(subexp(H16$ + "\\:") + "{0,6}" + H16$) + "?\\:\\:"),
        //[ *6( h16 ":" ) h16 ] "::"
    IPV6ADDRESS$ = subexp([IPV6ADDRESS1$, IPV6ADDRESS2$, IPV6ADDRESS3$, IPV6ADDRESS4$, IPV6ADDRESS5$, IPV6ADDRESS6$, IPV6ADDRESS7$, IPV6ADDRESS8$, IPV6ADDRESS9$].join("|")),
        ZONEID$ = subexp(subexp(UNRESERVED$$ + "|" + PCT_ENCODED$) + "+"),
        //RFC 6874
    IPV6ADDRZ$ = subexp(IPV6ADDRESS$ + "\\%25" + ZONEID$),
        //RFC 6874
    IPV6ADDRZ_RELAXED$ = subexp(IPV6ADDRESS$ + subexp("\\%25|\\%(?!" + HEXDIG$$ + "{2})") + ZONEID$),
        //RFC 6874, with relaxed parsing rules
    IPVFUTURE$ = subexp("[vV]" + HEXDIG$$ + "+\\." + merge(UNRESERVED$$, SUB_DELIMS$$, "[\\:]") + "+"),
        IP_LITERAL$ = subexp("\\[" + subexp(IPV6ADDRZ_RELAXED$ + "|" + IPV6ADDRESS$ + "|" + IPVFUTURE$) + "\\]"),
        //RFC 6874
    REG_NAME$ = subexp(subexp(PCT_ENCODED$ + "|" + merge(UNRESERVED$$, SUB_DELIMS$$)) + "*"),
        HOST$ = subexp(IP_LITERAL$ + "|" + IPV4ADDRESS$ + "(?!" + REG_NAME$ + ")" + "|" + REG_NAME$),
        PORT$ = subexp(DIGIT$$ + "*"),
        AUTHORITY$ = subexp(subexp(USERINFO$ + "@") + "?" + HOST$ + subexp("\\:" + PORT$) + "?"),
        PCHAR$ = subexp(PCT_ENCODED$ + "|" + merge(UNRESERVED$$, SUB_DELIMS$$, "[\\:\\@]")),
        SEGMENT$ = subexp(PCHAR$ + "*"),
        SEGMENT_NZ$ = subexp(PCHAR$ + "+"),
        SEGMENT_NZ_NC$ = subexp(subexp(PCT_ENCODED$ + "|" + merge(UNRESERVED$$, SUB_DELIMS$$, "[\\@]")) + "+"),
        PATH_ABEMPTY$ = subexp(subexp("\\/" + SEGMENT$) + "*"),
        PATH_ABSOLUTE$ = subexp("\\/" + subexp(SEGMENT_NZ$ + PATH_ABEMPTY$) + "?"),
        //simplified
    PATH_NOSCHEME$ = subexp(SEGMENT_NZ_NC$ + PATH_ABEMPTY$),
        //simplified
    PATH_ROOTLESS$ = subexp(SEGMENT_NZ$ + PATH_ABEMPTY$),
        //simplified
    PATH_EMPTY$ = "(?!" + PCHAR$ + ")",
        PATH$ = subexp(PATH_ABEMPTY$ + "|" + PATH_ABSOLUTE$ + "|" + PATH_NOSCHEME$ + "|" + PATH_ROOTLESS$ + "|" + PATH_EMPTY$),
        QUERY$ = subexp(subexp(PCHAR$ + "|" + merge("[\\/\\?]", IPRIVATE$$)) + "*"),
        FRAGMENT$ = subexp(subexp(PCHAR$ + "|[\\/\\?]") + "*"),
        HIER_PART$ = subexp(subexp("\\/\\/" + AUTHORITY$ + PATH_ABEMPTY$) + "|" + PATH_ABSOLUTE$ + "|" + PATH_ROOTLESS$ + "|" + PATH_EMPTY$),
        URI$ = subexp(SCHEME$ + "\\:" + HIER_PART$ + subexp("\\?" + QUERY$) + "?" + subexp("\\#" + FRAGMENT$) + "?"),
        RELATIVE_PART$ = subexp(subexp("\\/\\/" + AUTHORITY$ + PATH_ABEMPTY$) + "|" + PATH_ABSOLUTE$ + "|" + PATH_NOSCHEME$ + "|" + PATH_EMPTY$),
        RELATIVE$ = subexp(RELATIVE_PART$ + subexp("\\?" + QUERY$) + "?" + subexp("\\#" + FRAGMENT$) + "?"),
        URI_REFERENCE$ = subexp(URI$ + "|" + RELATIVE$),
        ABSOLUTE_URI$ = subexp(SCHEME$ + "\\:" + HIER_PART$ + subexp("\\?" + QUERY$) + "?"),
        GENERIC_REF$ = "^(" + SCHEME$ + ")\\:" + subexp(subexp("\\/\\/(" + subexp("(" + USERINFO$ + ")@") + "?(" + HOST$ + ")" + subexp("\\:(" + PORT$ + ")") + "?)") + "?(" + PATH_ABEMPTY$ + "|" + PATH_ABSOLUTE$ + "|" + PATH_ROOTLESS$ + "|" + PATH_EMPTY$ + ")") + subexp("\\?(" + QUERY$ + ")") + "?" + subexp("\\#(" + FRAGMENT$ + ")") + "?$",
        RELATIVE_REF$ = "^(){0}" + subexp(subexp("\\/\\/(" + subexp("(" + USERINFO$ + ")@") + "?(" + HOST$ + ")" + subexp("\\:(" + PORT$ + ")") + "?)") + "?(" + PATH_ABEMPTY$ + "|" + PATH_ABSOLUTE$ + "|" + PATH_NOSCHEME$ + "|" + PATH_EMPTY$ + ")") + subexp("\\?(" + QUERY$ + ")") + "?" + subexp("\\#(" + FRAGMENT$ + ")") + "?$",
        ABSOLUTE_REF$ = "^(" + SCHEME$ + ")\\:" + subexp(subexp("\\/\\/(" + subexp("(" + USERINFO$ + ")@") + "?(" + HOST$ + ")" + subexp("\\:(" + PORT$ + ")") + "?)") + "?(" + PATH_ABEMPTY$ + "|" + PATH_ABSOLUTE$ + "|" + PATH_ROOTLESS$ + "|" + PATH_EMPTY$ + ")") + subexp("\\?(" + QUERY$ + ")") + "?$",
        SAMEDOC_REF$ = "^" + subexp("\\#(" + FRAGMENT$ + ")") + "?$",
        AUTHORITY_REF$ = "^" + subexp("(" + USERINFO$ + ")@") + "?(" + HOST$ + ")" + subexp("\\:(" + PORT$ + ")") + "?$";
    return {
        NOT_SCHEME: new RegExp(merge("[^]", ALPHA$$, DIGIT$$, "[\\+\\-\\.]"), "g"),
        NOT_USERINFO: new RegExp(merge("[^\\%\\:]", UNRESERVED$$, SUB_DELIMS$$), "g"),
        NOT_HOST: new RegExp(merge("[^\\%\\[\\]\\:]", UNRESERVED$$, SUB_DELIMS$$), "g"),
        NOT_PATH: new RegExp(merge("[^\\%\\/\\:\\@]", UNRESERVED$$, SUB_DELIMS$$), "g"),
        NOT_PATH_NOSCHEME: new RegExp(merge("[^\\%\\/\\@]", UNRESERVED$$, SUB_DELIMS$$), "g"),
        NOT_QUERY: new RegExp(merge("[^\\%]", UNRESERVED$$, SUB_DELIMS$$, "[\\:\\@\\/\\?]", IPRIVATE$$), "g"),
        NOT_FRAGMENT: new RegExp(merge("[^\\%]", UNRESERVED$$, SUB_DELIMS$$, "[\\:\\@\\/\\?]"), "g"),
        ESCAPE: new RegExp(merge("[^]", UNRESERVED$$, SUB_DELIMS$$), "g"),
        UNRESERVED: new RegExp(UNRESERVED$$, "g"),
        OTHER_CHARS: new RegExp(merge("[^\\%]", UNRESERVED$$, RESERVED$$), "g"),
        PCT_ENCODED: new RegExp(PCT_ENCODED$, "g"),
        IPV4ADDRESS: new RegExp("^(" + IPV4ADDRESS$ + ")$"),
        IPV6ADDRESS: new RegExp("^\\[?(" + IPV6ADDRESS$ + ")" + subexp(subexp("\\%25|\\%(?!" + HEXDIG$$ + "{2})") + "(" + ZONEID$ + ")") + "?\\]?$") //RFC 6874, with relaxed parsing rules
    };
}
var URI_PROTOCOL = buildExps(false);

var IRI_PROTOCOL = buildExps(true);

var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();













var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

/** Highest positive signed 32-bit float value */

var maxInt = 2147483647; // aka. 0x7FFFFFFF or 2^31-1

/** Bootstring parameters */
var base = 36;
var tMin = 1;
var tMax = 26;
var skew = 38;
var damp = 700;
var initialBias = 72;
var initialN = 128; // 0x80
var delimiter = '-'; // '\x2D'

/** Regular expressions */
var regexPunycode = /^xn--/;
var regexNonASCII = /[^\0-\x7E]/; // non-ASCII chars
var regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g; // RFC 3490 separators

/** Error messages */
var errors = {
	'overflow': 'Overflow: input needs wider integers to process',
	'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
	'invalid-input': 'Invalid input'
};

/** Convenience shortcuts */
var baseMinusTMin = base - tMin;
var floor = Math.floor;
var stringFromCharCode = String.fromCharCode;

/*--------------------------------------------------------------------------*/

/**
 * A generic error utility function.
 * @private
 * @param {String} type The error type.
 * @returns {Error} Throws a `RangeError` with the applicable error message.
 */
function error$1(type) {
	throw new RangeError(errors[type]);
}

/**
 * A generic `Array#map` utility function.
 * @private
 * @param {Array} array The array to iterate over.
 * @param {Function} callback The function that gets called for every array
 * item.
 * @returns {Array} A new array of values returned by the callback function.
 */
function map(array, fn) {
	var result = [];
	var length = array.length;
	while (length--) {
		result[length] = fn(array[length]);
	}
	return result;
}

/**
 * A simple `Array#map`-like wrapper to work with domain name strings or email
 * addresses.
 * @private
 * @param {String} domain The domain name or email address.
 * @param {Function} callback The function that gets called for every
 * character.
 * @returns {Array} A new string of characters returned by the callback
 * function.
 */
function mapDomain(string, fn) {
	var parts = string.split('@');
	var result = '';
	if (parts.length > 1) {
		// In email addresses, only the domain name should be punycoded. Leave
		// the local part (i.e. everything up to `@`) intact.
		result = parts[0] + '@';
		string = parts[1];
	}
	// Avoid `split(regex)` for IE8 compatibility. See #17.
	string = string.replace(regexSeparators, '\x2E');
	var labels = string.split('.');
	var encoded = map(labels, fn).join('.');
	return result + encoded;
}

/**
 * Creates an array containing the numeric code points of each Unicode
 * character in the string. While JavaScript uses UCS-2 internally,
 * this function will convert a pair of surrogate halves (each of which
 * UCS-2 exposes as separate characters) into a single code point,
 * matching UTF-16.
 * @see `punycode.ucs2.encode`
 * @see <https://mathiasbynens.be/notes/javascript-encoding>
 * @memberOf punycode.ucs2
 * @name decode
 * @param {String} string The Unicode input string (UCS-2).
 * @returns {Array} The new array of code points.
 */
function ucs2decode(string) {
	var output = [];
	var counter = 0;
	var length = string.length;
	while (counter < length) {
		var value = string.charCodeAt(counter++);
		if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
			// It's a high surrogate, and there is a next character.
			var extra = string.charCodeAt(counter++);
			if ((extra & 0xFC00) == 0xDC00) {
				// Low surrogate.
				output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
			} else {
				// It's an unmatched surrogate; only append this code unit, in case the
				// next code unit is the high surrogate of a surrogate pair.
				output.push(value);
				counter--;
			}
		} else {
			output.push(value);
		}
	}
	return output;
}

/**
 * Creates a string based on an array of numeric code points.
 * @see `punycode.ucs2.decode`
 * @memberOf punycode.ucs2
 * @name encode
 * @param {Array} codePoints The array of numeric code points.
 * @returns {String} The new Unicode string (UCS-2).
 */
var ucs2encode = function ucs2encode(array) {
	return String.fromCodePoint.apply(String, toConsumableArray(array));
};

/**
 * Converts a basic code point into a digit/integer.
 * @see `digitToBasic()`
 * @private
 * @param {Number} codePoint The basic numeric code point value.
 * @returns {Number} The numeric value of a basic code point (for use in
 * representing integers) in the range `0` to `base - 1`, or `base` if
 * the code point does not represent a value.
 */
var basicToDigit = function basicToDigit(codePoint) {
	if (codePoint - 0x30 < 0x0A) {
		return codePoint - 0x16;
	}
	if (codePoint - 0x41 < 0x1A) {
		return codePoint - 0x41;
	}
	if (codePoint - 0x61 < 0x1A) {
		return codePoint - 0x61;
	}
	return base;
};

/**
 * Converts a digit/integer into a basic code point.
 * @see `basicToDigit()`
 * @private
 * @param {Number} digit The numeric value of a basic code point.
 * @returns {Number} The basic code point whose value (when used for
 * representing integers) is `digit`, which needs to be in the range
 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
 * used; else, the lowercase form is used. The behavior is undefined
 * if `flag` is non-zero and `digit` has no uppercase form.
 */
var digitToBasic = function digitToBasic(digit, flag) {
	//  0..25 map to ASCII a..z or A..Z
	// 26..35 map to ASCII 0..9
	return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
};

/**
 * Bias adaptation function as per section 3.4 of RFC 3492.
 * https://tools.ietf.org/html/rfc3492#section-3.4
 * @private
 */
var adapt = function adapt(delta, numPoints, firstTime) {
	var k = 0;
	delta = firstTime ? floor(delta / damp) : delta >> 1;
	delta += floor(delta / numPoints);
	for (; /* no initialization */delta > baseMinusTMin * tMax >> 1; k += base) {
		delta = floor(delta / baseMinusTMin);
	}
	return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
};

/**
 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
 * symbols.
 * @memberOf punycode
 * @param {String} input The Punycode string of ASCII-only symbols.
 * @returns {String} The resulting string of Unicode symbols.
 */
var decode = function decode(input) {
	// Don't use UCS-2.
	var output = [];
	var inputLength = input.length;
	var i = 0;
	var n = initialN;
	var bias = initialBias;

	// Handle the basic code points: let `basic` be the number of input code
	// points before the last delimiter, or `0` if there is none, then copy
	// the first basic code points to the output.

	var basic = input.lastIndexOf(delimiter);
	if (basic < 0) {
		basic = 0;
	}

	for (var j = 0; j < basic; ++j) {
		// if it's not a basic code point
		if (input.charCodeAt(j) >= 0x80) {
			error$1('not-basic');
		}
		output.push(input.charCodeAt(j));
	}

	// Main decoding loop: start just after the last delimiter if any basic code
	// points were copied; start at the beginning otherwise.

	for (var index = basic > 0 ? basic + 1 : 0; index < inputLength;) /* no final expression */{

		// `index` is the index of the next character to be consumed.
		// Decode a generalized variable-length integer into `delta`,
		// which gets added to `i`. The overflow checking is easier
		// if we increase `i` as we go, then subtract off its starting
		// value at the end to obtain `delta`.
		var oldi = i;
		for (var w = 1, k = base;; /* no condition */k += base) {

			if (index >= inputLength) {
				error$1('invalid-input');
			}

			var digit = basicToDigit(input.charCodeAt(index++));

			if (digit >= base || digit > floor((maxInt - i) / w)) {
				error$1('overflow');
			}

			i += digit * w;
			var t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;

			if (digit < t) {
				break;
			}

			var baseMinusT = base - t;
			if (w > floor(maxInt / baseMinusT)) {
				error$1('overflow');
			}

			w *= baseMinusT;
		}

		var out = output.length + 1;
		bias = adapt(i - oldi, out, oldi == 0);

		// `i` was supposed to wrap around from `out` to `0`,
		// incrementing `n` each time, so we'll fix that now:
		if (floor(i / out) > maxInt - n) {
			error$1('overflow');
		}

		n += floor(i / out);
		i %= out;

		// Insert `n` at position `i` of the output.
		output.splice(i++, 0, n);
	}

	return String.fromCodePoint.apply(String, output);
};

/**
 * Converts a string of Unicode symbols (e.g. a domain name label) to a
 * Punycode string of ASCII-only symbols.
 * @memberOf punycode
 * @param {String} input The string of Unicode symbols.
 * @returns {String} The resulting Punycode string of ASCII-only symbols.
 */
var encode = function encode(input) {
	var output = [];

	// Convert the input in UCS-2 to an array of Unicode code points.
	input = ucs2decode(input);

	// Cache the length.
	var inputLength = input.length;

	// Initialize the state.
	var n = initialN;
	var delta = 0;
	var bias = initialBias;

	// Handle the basic code points.
	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = input[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var _currentValue2 = _step.value;

			if (_currentValue2 < 0x80) {
				output.push(stringFromCharCode(_currentValue2));
			}
		}
	} catch (err) {
		_didIteratorError = true;
		_iteratorError = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion && _iterator.return) {
				_iterator.return();
			}
		} finally {
			if (_didIteratorError) {
				throw _iteratorError;
			}
		}
	}

	var basicLength = output.length;
	var handledCPCount = basicLength;

	// `handledCPCount` is the number of code points that have been handled;
	// `basicLength` is the number of basic code points.

	// Finish the basic string with a delimiter unless it's empty.
	if (basicLength) {
		output.push(delimiter);
	}

	// Main encoding loop:
	while (handledCPCount < inputLength) {

		// All non-basic code points < n have been handled already. Find the next
		// larger one:
		var m = maxInt;
		var _iteratorNormalCompletion2 = true;
		var _didIteratorError2 = false;
		var _iteratorError2 = undefined;

		try {
			for (var _iterator2 = input[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
				var currentValue = _step2.value;

				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow.
		} catch (err) {
			_didIteratorError2 = true;
			_iteratorError2 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion2 && _iterator2.return) {
					_iterator2.return();
				}
			} finally {
				if (_didIteratorError2) {
					throw _iteratorError2;
				}
			}
		}

		var handledCPCountPlusOne = handledCPCount + 1;
		if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
			error$1('overflow');
		}

		delta += (m - n) * handledCPCountPlusOne;
		n = m;

		var _iteratorNormalCompletion3 = true;
		var _didIteratorError3 = false;
		var _iteratorError3 = undefined;

		try {
			for (var _iterator3 = input[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
				var _currentValue = _step3.value;

				if (_currentValue < n && ++delta > maxInt) {
					error$1('overflow');
				}
				if (_currentValue == n) {
					// Represent delta as a generalized variable-length integer.
					var q = delta;
					for (var k = base;; /* no condition */k += base) {
						var t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
						if (q < t) {
							break;
						}
						var qMinusT = q - t;
						var baseMinusT = base - t;
						output.push(stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0)));
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}
		} catch (err) {
			_didIteratorError3 = true;
			_iteratorError3 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion3 && _iterator3.return) {
					_iterator3.return();
				}
			} finally {
				if (_didIteratorError3) {
					throw _iteratorError3;
				}
			}
		}

		++delta;
		++n;
	}
	return output.join('');
};

/**
 * Converts a Punycode string representing a domain name or an email address
 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
 * it doesn't matter if you call it on a string that has already been
 * converted to Unicode.
 * @memberOf punycode
 * @param {String} input The Punycoded domain name or email address to
 * convert to Unicode.
 * @returns {String} The Unicode representation of the given Punycode
 * string.
 */
var toUnicode = function toUnicode(input) {
	return mapDomain(input, function (string) {
		return regexPunycode.test(string) ? decode(string.slice(4).toLowerCase()) : string;
	});
};

/**
 * Converts a Unicode string representing a domain name or an email address to
 * Punycode. Only the non-ASCII parts of the domain name will be converted,
 * i.e. it doesn't matter if you call it with a domain that's already in
 * ASCII.
 * @memberOf punycode
 * @param {String} input The domain name or email address to convert, as a
 * Unicode string.
 * @returns {String} The Punycode representation of the given domain name or
 * email address.
 */
var toASCII = function toASCII(input) {
	return mapDomain(input, function (string) {
		return regexNonASCII.test(string) ? 'xn--' + encode(string) : string;
	});
};

/*--------------------------------------------------------------------------*/

/** Define the public API */
var punycode = {
	/**
  * A string representing the current Punycode.js version number.
  * @memberOf punycode
  * @type String
  */
	'version': '2.1.0',
	/**
  * An object of methods to convert from JavaScript's internal character
  * representation (UCS-2) to Unicode code points, and back.
  * @see <https://mathiasbynens.be/notes/javascript-encoding>
  * @memberOf punycode
  * @type Object
  */
	'ucs2': {
		'decode': ucs2decode,
		'encode': ucs2encode
	},
	'decode': decode,
	'encode': encode,
	'toASCII': toASCII,
	'toUnicode': toUnicode
};

/**
 * URI.js
 *
 * @fileoverview An RFC 3986 compliant, scheme extendable URI parsing/validating/resolving library for JavaScript.
 * @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
 * @see http://github.com/garycourt/uri-js
 */
/**
 * Copyright 2011 Gary Court. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are
 * permitted provided that the following conditions are met:
 *
 *    1. Redistributions of source code must retain the above copyright notice, this list of
 *       conditions and the following disclaimer.
 *
 *    2. Redistributions in binary form must reproduce the above copyright notice, this list
 *       of conditions and the following disclaimer in the documentation and/or other materials
 *       provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY GARY COURT ``AS IS'' AND ANY EXPRESS OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL GARY COURT OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
 * ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * The views and conclusions contained in the software and documentation are those of the
 * authors and should not be interpreted as representing official policies, either expressed
 * or implied, of Gary Court.
 */
var SCHEMES = {};
function pctEncChar(chr) {
    var c = chr.charCodeAt(0);
    var e = void 0;
    if (c < 16) e = "%0" + c.toString(16).toUpperCase();else if (c < 128) e = "%" + c.toString(16).toUpperCase();else if (c < 2048) e = "%" + (c >> 6 | 192).toString(16).toUpperCase() + "%" + (c & 63 | 128).toString(16).toUpperCase();else e = "%" + (c >> 12 | 224).toString(16).toUpperCase() + "%" + (c >> 6 & 63 | 128).toString(16).toUpperCase() + "%" + (c & 63 | 128).toString(16).toUpperCase();
    return e;
}
function pctDecChars(str) {
    var newStr = "";
    var i = 0;
    var il = str.length;
    while (i < il) {
        var c = parseInt(str.substr(i + 1, 2), 16);
        if (c < 128) {
            newStr += String.fromCharCode(c);
            i += 3;
        } else if (c >= 194 && c < 224) {
            if (il - i >= 6) {
                var c2 = parseInt(str.substr(i + 4, 2), 16);
                newStr += String.fromCharCode((c & 31) << 6 | c2 & 63);
            } else {
                newStr += str.substr(i, 6);
            }
            i += 6;
        } else if (c >= 224) {
            if (il - i >= 9) {
                var _c = parseInt(str.substr(i + 4, 2), 16);
                var c3 = parseInt(str.substr(i + 7, 2), 16);
                newStr += String.fromCharCode((c & 15) << 12 | (_c & 63) << 6 | c3 & 63);
            } else {
                newStr += str.substr(i, 9);
            }
            i += 9;
        } else {
            newStr += str.substr(i, 3);
            i += 3;
        }
    }
    return newStr;
}
function _normalizeComponentEncoding(components, protocol) {
    function decodeUnreserved(str) {
        var decStr = pctDecChars(str);
        return !decStr.match(protocol.UNRESERVED) ? str : decStr;
    }
    if (components.scheme) components.scheme = String(components.scheme).replace(protocol.PCT_ENCODED, decodeUnreserved).toLowerCase().replace(protocol.NOT_SCHEME, "");
    if (components.userinfo !== undefined) components.userinfo = String(components.userinfo).replace(protocol.PCT_ENCODED, decodeUnreserved).replace(protocol.NOT_USERINFO, pctEncChar).replace(protocol.PCT_ENCODED, toUpperCase);
    if (components.host !== undefined) components.host = String(components.host).replace(protocol.PCT_ENCODED, decodeUnreserved).toLowerCase().replace(protocol.NOT_HOST, pctEncChar).replace(protocol.PCT_ENCODED, toUpperCase);
    if (components.path !== undefined) components.path = String(components.path).replace(protocol.PCT_ENCODED, decodeUnreserved).replace(components.scheme ? protocol.NOT_PATH : protocol.NOT_PATH_NOSCHEME, pctEncChar).replace(protocol.PCT_ENCODED, toUpperCase);
    if (components.query !== undefined) components.query = String(components.query).replace(protocol.PCT_ENCODED, decodeUnreserved).replace(protocol.NOT_QUERY, pctEncChar).replace(protocol.PCT_ENCODED, toUpperCase);
    if (components.fragment !== undefined) components.fragment = String(components.fragment).replace(protocol.PCT_ENCODED, decodeUnreserved).replace(protocol.NOT_FRAGMENT, pctEncChar).replace(protocol.PCT_ENCODED, toUpperCase);
    return components;
}

function _stripLeadingZeros(str) {
    return str.replace(/^0*(.*)/, "$1") || "0";
}
function _normalizeIPv4(host, protocol) {
    var matches = host.match(protocol.IPV4ADDRESS) || [];

    var _matches = slicedToArray(matches, 2),
        address = _matches[1];

    if (address) {
        return address.split(".").map(_stripLeadingZeros).join(".");
    } else {
        return host;
    }
}
function _normalizeIPv6(host, protocol) {
    var matches = host.match(protocol.IPV6ADDRESS) || [];

    var _matches2 = slicedToArray(matches, 3),
        address = _matches2[1],
        zone = _matches2[2];

    if (address) {
        var _address$toLowerCase$ = address.toLowerCase().split('::').reverse(),
            _address$toLowerCase$2 = slicedToArray(_address$toLowerCase$, 2),
            last = _address$toLowerCase$2[0],
            first = _address$toLowerCase$2[1];

        var firstFields = first ? first.split(":").map(_stripLeadingZeros) : [];
        var lastFields = last.split(":").map(_stripLeadingZeros);
        var isLastFieldIPv4Address = protocol.IPV4ADDRESS.test(lastFields[lastFields.length - 1]);
        var fieldCount = isLastFieldIPv4Address ? 7 : 8;
        var lastFieldsStart = lastFields.length - fieldCount;
        var fields = Array(fieldCount);
        for (var x = 0; x < fieldCount; ++x) {
            fields[x] = firstFields[x] || lastFields[lastFieldsStart + x] || '';
        }
        if (isLastFieldIPv4Address) {
            fields[fieldCount - 1] = _normalizeIPv4(fields[fieldCount - 1], protocol);
        }
        var allZeroFields = fields.reduce(function (acc, field, index) {
            if (!field || field === "0") {
                var lastLongest = acc[acc.length - 1];
                if (lastLongest && lastLongest.index + lastLongest.length === index) {
                    lastLongest.length++;
                } else {
                    acc.push({ index: index, length: 1 });
                }
            }
            return acc;
        }, []);
        var longestZeroFields = allZeroFields.sort(function (a, b) {
            return b.length - a.length;
        })[0];
        var newHost = void 0;
        if (longestZeroFields && longestZeroFields.length > 1) {
            var newFirst = fields.slice(0, longestZeroFields.index);
            var newLast = fields.slice(longestZeroFields.index + longestZeroFields.length);
            newHost = newFirst.join(":") + "::" + newLast.join(":");
        } else {
            newHost = fields.join(":");
        }
        if (zone) {
            newHost += "%" + zone;
        }
        return newHost;
    } else {
        return host;
    }
}
var URI_PARSE = /^(?:([^:\/?#]+):)?(?:\/\/((?:([^\/?#@]*)@)?(\[[^\/?#\]]+\]|[^\/?#:]*)(?:\:(\d*))?))?([^?#]*)(?:\?([^#]*))?(?:#((?:.|\n|\r)*))?/i;
var NO_MATCH_IS_UNDEFINED = "".match(/(){0}/)[1] === undefined;
function parse(uriString) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var components = {};
    var protocol = options.iri !== false ? IRI_PROTOCOL : URI_PROTOCOL;
    if (options.reference === "suffix") uriString = (options.scheme ? options.scheme + ":" : "") + "//" + uriString;
    var matches = uriString.match(URI_PARSE);
    if (matches) {
        if (NO_MATCH_IS_UNDEFINED) {
            //store each component
            components.scheme = matches[1];
            components.userinfo = matches[3];
            components.host = matches[4];
            components.port = parseInt(matches[5], 10);
            components.path = matches[6] || "";
            components.query = matches[7];
            components.fragment = matches[8];
            //fix port number
            if (isNaN(components.port)) {
                components.port = matches[5];
            }
        } else {
            //IE FIX for improper RegExp matching
            //store each component
            components.scheme = matches[1] || undefined;
            components.userinfo = uriString.indexOf("@") !== -1 ? matches[3] : undefined;
            components.host = uriString.indexOf("//") !== -1 ? matches[4] : undefined;
            components.port = parseInt(matches[5], 10);
            components.path = matches[6] || "";
            components.query = uriString.indexOf("?") !== -1 ? matches[7] : undefined;
            components.fragment = uriString.indexOf("#") !== -1 ? matches[8] : undefined;
            //fix port number
            if (isNaN(components.port)) {
                components.port = uriString.match(/\/\/(?:.|\n)*\:(?:\/|\?|\#|$)/) ? matches[4] : undefined;
            }
        }
        if (components.host) {
            //normalize IP hosts
            components.host = _normalizeIPv6(_normalizeIPv4(components.host, protocol), protocol);
        }
        //determine reference type
        if (components.scheme === undefined && components.userinfo === undefined && components.host === undefined && components.port === undefined && !components.path && components.query === undefined) {
            components.reference = "same-document";
        } else if (components.scheme === undefined) {
            components.reference = "relative";
        } else if (components.fragment === undefined) {
            components.reference = "absolute";
        } else {
            components.reference = "uri";
        }
        //check for reference errors
        if (options.reference && options.reference !== "suffix" && options.reference !== components.reference) {
            components.error = components.error || "URI is not a " + options.reference + " reference.";
        }
        //find scheme handler
        var schemeHandler = SCHEMES[(options.scheme || components.scheme || "").toLowerCase()];
        //check if scheme can't handle IRIs
        if (!options.unicodeSupport && (!schemeHandler || !schemeHandler.unicodeSupport)) {
            //if host component is a domain name
            if (components.host && (options.domainHost || schemeHandler && schemeHandler.domainHost)) {
                //convert Unicode IDN -> ASCII IDN
                try {
                    components.host = punycode.toASCII(components.host.replace(protocol.PCT_ENCODED, pctDecChars).toLowerCase());
                } catch (e) {
                    components.error = components.error || "Host's domain name can not be converted to ASCII via punycode: " + e;
                }
            }
            //convert IRI -> URI
            _normalizeComponentEncoding(components, URI_PROTOCOL);
        } else {
            //normalize encodings
            _normalizeComponentEncoding(components, protocol);
        }
        //perform scheme specific parsing
        if (schemeHandler && schemeHandler.parse) {
            schemeHandler.parse(components, options);
        }
    } else {
        components.error = components.error || "URI can not be parsed.";
    }
    return components;
}

function _recomposeAuthority(components, options) {
    var protocol = options.iri !== false ? IRI_PROTOCOL : URI_PROTOCOL;
    var uriTokens = [];
    if (components.userinfo !== undefined) {
        uriTokens.push(components.userinfo);
        uriTokens.push("@");
    }
    if (components.host !== undefined) {
        //normalize IP hosts, add brackets and escape zone separator for IPv6
        uriTokens.push(_normalizeIPv6(_normalizeIPv4(String(components.host), protocol), protocol).replace(protocol.IPV6ADDRESS, function (_, $1, $2) {
            return "[" + $1 + ($2 ? "%25" + $2 : "") + "]";
        }));
    }
    if (typeof components.port === "number" || typeof components.port === "string") {
        uriTokens.push(":");
        uriTokens.push(String(components.port));
    }
    return uriTokens.length ? uriTokens.join("") : undefined;
}

var RDS1 = /^\.\.?\//;
var RDS2 = /^\/\.(\/|$)/;
var RDS3 = /^\/\.\.(\/|$)/;
var RDS5 = /^\/?(?:.|\n)*?(?=\/|$)/;
function removeDotSegments(input) {
    var output = [];
    while (input.length) {
        if (input.match(RDS1)) {
            input = input.replace(RDS1, "");
        } else if (input.match(RDS2)) {
            input = input.replace(RDS2, "/");
        } else if (input.match(RDS3)) {
            input = input.replace(RDS3, "/");
            output.pop();
        } else if (input === "." || input === "..") {
            input = "";
        } else {
            var im = input.match(RDS5);
            if (im) {
                var s = im[0];
                input = input.slice(s.length);
                output.push(s);
            } else {
                throw new Error("Unexpected dot segment condition");
            }
        }
    }
    return output.join("");
}

function serialize(components) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var protocol = options.iri ? IRI_PROTOCOL : URI_PROTOCOL;
    var uriTokens = [];
    //find scheme handler
    var schemeHandler = SCHEMES[(options.scheme || components.scheme || "").toLowerCase()];
    //perform scheme specific serialization
    if (schemeHandler && schemeHandler.serialize) schemeHandler.serialize(components, options);
    if (components.host) {
        //if host component is an IPv6 address
        if (protocol.IPV6ADDRESS.test(components.host)) {}
        //TODO: normalize IPv6 address as per RFC 5952

        //if host component is a domain name
        else if (options.domainHost || schemeHandler && schemeHandler.domainHost) {
                //convert IDN via punycode
                try {
                    components.host = !options.iri ? punycode.toASCII(components.host.replace(protocol.PCT_ENCODED, pctDecChars).toLowerCase()) : punycode.toUnicode(components.host);
                } catch (e) {
                    components.error = components.error || "Host's domain name can not be converted to " + (!options.iri ? "ASCII" : "Unicode") + " via punycode: " + e;
                }
            }
    }
    //normalize encoding
    _normalizeComponentEncoding(components, protocol);
    if (options.reference !== "suffix" && components.scheme) {
        uriTokens.push(components.scheme);
        uriTokens.push(":");
    }
    var authority = _recomposeAuthority(components, options);
    if (authority !== undefined) {
        if (options.reference !== "suffix") {
            uriTokens.push("//");
        }
        uriTokens.push(authority);
        if (components.path && components.path.charAt(0) !== "/") {
            uriTokens.push("/");
        }
    }
    if (components.path !== undefined) {
        var s = components.path;
        if (!options.absolutePath && (!schemeHandler || !schemeHandler.absolutePath)) {
            s = removeDotSegments(s);
        }
        if (authority === undefined) {
            s = s.replace(/^\/\//, "/%2F"); //don't allow the path to start with "//"
        }
        uriTokens.push(s);
    }
    if (components.query !== undefined) {
        uriTokens.push("?");
        uriTokens.push(components.query);
    }
    if (components.fragment !== undefined) {
        uriTokens.push("#");
        uriTokens.push(components.fragment);
    }
    return uriTokens.join(""); //merge tokens into a string
}

function resolveComponents(base, relative) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var skipNormalization = arguments[3];

    var target = {};
    if (!skipNormalization) {
        base = parse(serialize(base, options), options); //normalize base components
        relative = parse(serialize(relative, options), options); //normalize relative components
    }
    options = options || {};
    if (!options.tolerant && relative.scheme) {
        target.scheme = relative.scheme;
        //target.authority = relative.authority;
        target.userinfo = relative.userinfo;
        target.host = relative.host;
        target.port = relative.port;
        target.path = removeDotSegments(relative.path || "");
        target.query = relative.query;
    } else {
        if (relative.userinfo !== undefined || relative.host !== undefined || relative.port !== undefined) {
            //target.authority = relative.authority;
            target.userinfo = relative.userinfo;
            target.host = relative.host;
            target.port = relative.port;
            target.path = removeDotSegments(relative.path || "");
            target.query = relative.query;
        } else {
            if (!relative.path) {
                target.path = base.path;
                if (relative.query !== undefined) {
                    target.query = relative.query;
                } else {
                    target.query = base.query;
                }
            } else {
                if (relative.path.charAt(0) === "/") {
                    target.path = removeDotSegments(relative.path);
                } else {
                    if ((base.userinfo !== undefined || base.host !== undefined || base.port !== undefined) && !base.path) {
                        target.path = "/" + relative.path;
                    } else if (!base.path) {
                        target.path = relative.path;
                    } else {
                        target.path = base.path.slice(0, base.path.lastIndexOf("/") + 1) + relative.path;
                    }
                    target.path = removeDotSegments(target.path);
                }
                target.query = relative.query;
            }
            //target.authority = base.authority;
            target.userinfo = base.userinfo;
            target.host = base.host;
            target.port = base.port;
        }
        target.scheme = base.scheme;
    }
    target.fragment = relative.fragment;
    return target;
}

function resolve(baseURI, relativeURI, options) {
    var schemelessOptions = assign({ scheme: 'null' }, options);
    return serialize(resolveComponents(parse(baseURI, schemelessOptions), parse(relativeURI, schemelessOptions), schemelessOptions, true), schemelessOptions);
}

function normalize(uri, options) {
    if (typeof uri === "string") {
        uri = serialize(parse(uri, options), options);
    } else if (typeOf(uri) === "object") {
        uri = parse(serialize(uri, options), options);
    }
    return uri;
}

function equal(uriA, uriB, options) {
    if (typeof uriA === "string") {
        uriA = serialize(parse(uriA, options), options);
    } else if (typeOf(uriA) === "object") {
        uriA = serialize(uriA, options);
    }
    if (typeof uriB === "string") {
        uriB = serialize(parse(uriB, options), options);
    } else if (typeOf(uriB) === "object") {
        uriB = serialize(uriB, options);
    }
    return uriA === uriB;
}

function escapeComponent(str, options) {
    return str && str.toString().replace(!options || !options.iri ? URI_PROTOCOL.ESCAPE : IRI_PROTOCOL.ESCAPE, pctEncChar);
}

function unescapeComponent(str, options) {
    return str && str.toString().replace(!options || !options.iri ? URI_PROTOCOL.PCT_ENCODED : IRI_PROTOCOL.PCT_ENCODED, pctDecChars);
}

var handler = {
    scheme: "http",
    domainHost: true,
    parse: function parse(components, options) {
        //report missing host
        if (!components.host) {
            components.error = components.error || "HTTP URIs must have a host.";
        }
        return components;
    },
    serialize: function serialize(components, options) {
        var secure = String(components.scheme).toLowerCase() === "https";
        //normalize the default port
        if (components.port === (secure ? 443 : 80) || components.port === "") {
            components.port = undefined;
        }
        //normalize the empty path
        if (!components.path) {
            components.path = "/";
        }
        //NOTE: We do not parse query strings for HTTP URIs
        //as WWW Form Url Encoded query strings are part of the HTML4+ spec,
        //and not the HTTP spec.
        return components;
    }
};

var handler$1 = {
    scheme: "https",
    domainHost: handler.domainHost,
    parse: handler.parse,
    serialize: handler.serialize
};

function isSecure(wsComponents) {
    return typeof wsComponents.secure === 'boolean' ? wsComponents.secure : String(wsComponents.scheme).toLowerCase() === "wss";
}
//RFC 6455
var handler$2 = {
    scheme: "ws",
    domainHost: true,
    parse: function parse(components, options) {
        var wsComponents = components;
        //indicate if the secure flag is set
        wsComponents.secure = isSecure(wsComponents);
        //construct resouce name
        wsComponents.resourceName = (wsComponents.path || '/') + (wsComponents.query ? '?' + wsComponents.query : '');
        wsComponents.path = undefined;
        wsComponents.query = undefined;
        return wsComponents;
    },
    serialize: function serialize(wsComponents, options) {
        //normalize the default port
        if (wsComponents.port === (isSecure(wsComponents) ? 443 : 80) || wsComponents.port === "") {
            wsComponents.port = undefined;
        }
        //ensure scheme matches secure flag
        if (typeof wsComponents.secure === 'boolean') {
            wsComponents.scheme = wsComponents.secure ? 'wss' : 'ws';
            wsComponents.secure = undefined;
        }
        //reconstruct path from resource name
        if (wsComponents.resourceName) {
            var _wsComponents$resourc = wsComponents.resourceName.split('?'),
                _wsComponents$resourc2 = slicedToArray(_wsComponents$resourc, 2),
                path = _wsComponents$resourc2[0],
                query = _wsComponents$resourc2[1];

            wsComponents.path = path && path !== '/' ? path : undefined;
            wsComponents.query = query;
            wsComponents.resourceName = undefined;
        }
        //forbid fragment component
        wsComponents.fragment = undefined;
        return wsComponents;
    }
};

var handler$3 = {
    scheme: "wss",
    domainHost: handler$2.domainHost,
    parse: handler$2.parse,
    serialize: handler$2.serialize
};

var O = {};
var isIRI = true;
//RFC 3986
var UNRESERVED$$ = "[A-Za-z0-9\\-\\.\\_\\~" + (isIRI ? "\\xA0-\\u200D\\u2010-\\u2029\\u202F-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF" : "") + "]";
var HEXDIG$$ = "[0-9A-Fa-f]"; //case-insensitive
var PCT_ENCODED$ = subexp(subexp("%[EFef]" + HEXDIG$$ + "%" + HEXDIG$$ + HEXDIG$$ + "%" + HEXDIG$$ + HEXDIG$$) + "|" + subexp("%[89A-Fa-f]" + HEXDIG$$ + "%" + HEXDIG$$ + HEXDIG$$) + "|" + subexp("%" + HEXDIG$$ + HEXDIG$$)); //expanded
//RFC 5322, except these symbols as per RFC 6068: @ : / ? # [ ] & ; =
//const ATEXT$$ = "[A-Za-z0-9\\!\\#\\$\\%\\&\\'\\*\\+\\-\\/\\=\\?\\^\\_\\`\\{\\|\\}\\~]";
//const WSP$$ = "[\\x20\\x09]";
//const OBS_QTEXT$$ = "[\\x01-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]";  //(%d1-8 / %d11-12 / %d14-31 / %d127)
//const QTEXT$$ = merge("[\\x21\\x23-\\x5B\\x5D-\\x7E]", OBS_QTEXT$$);  //%d33 / %d35-91 / %d93-126 / obs-qtext
//const VCHAR$$ = "[\\x21-\\x7E]";
//const WSP$$ = "[\\x20\\x09]";
//const OBS_QP$ = subexp("\\\\" + merge("[\\x00\\x0D\\x0A]", OBS_QTEXT$$));  //%d0 / CR / LF / obs-qtext
//const FWS$ = subexp(subexp(WSP$$ + "*" + "\\x0D\\x0A") + "?" + WSP$$ + "+");
//const QUOTED_PAIR$ = subexp(subexp("\\\\" + subexp(VCHAR$$ + "|" + WSP$$)) + "|" + OBS_QP$);
//const QUOTED_STRING$ = subexp('\\"' + subexp(FWS$ + "?" + QCONTENT$) + "*" + FWS$ + "?" + '\\"');
var ATEXT$$ = "[A-Za-z0-9\\!\\$\\%\\'\\*\\+\\-\\^\\_\\`\\{\\|\\}\\~]";
var QTEXT$$ = "[\\!\\$\\%\\'\\(\\)\\*\\+\\,\\-\\.0-9\\<\\>A-Z\\x5E-\\x7E]";
var VCHAR$$ = merge(QTEXT$$, "[\\\"\\\\]");
var SOME_DELIMS$$ = "[\\!\\$\\'\\(\\)\\*\\+\\,\\;\\:\\@]";
var UNRESERVED = new RegExp(UNRESERVED$$, "g");
var PCT_ENCODED = new RegExp(PCT_ENCODED$, "g");
var NOT_LOCAL_PART = new RegExp(merge("[^]", ATEXT$$, "[\\.]", '[\\"]', VCHAR$$), "g");
var NOT_HFNAME = new RegExp(merge("[^]", UNRESERVED$$, SOME_DELIMS$$), "g");
var NOT_HFVALUE = NOT_HFNAME;
function decodeUnreserved(str) {
    var decStr = pctDecChars(str);
    return !decStr.match(UNRESERVED) ? str : decStr;
}
var handler$4 = {
    scheme: "mailto",
    parse: function parse$$1(components, options) {
        var mailtoComponents = components;
        var to = mailtoComponents.to = mailtoComponents.path ? mailtoComponents.path.split(",") : [];
        mailtoComponents.path = undefined;
        if (mailtoComponents.query) {
            var unknownHeaders = false;
            var headers = {};
            var hfields = mailtoComponents.query.split("&");
            for (var x = 0, xl = hfields.length; x < xl; ++x) {
                var hfield = hfields[x].split("=");
                switch (hfield[0]) {
                    case "to":
                        var toAddrs = hfield[1].split(",");
                        for (var _x = 0, _xl = toAddrs.length; _x < _xl; ++_x) {
                            to.push(toAddrs[_x]);
                        }
                        break;
                    case "subject":
                        mailtoComponents.subject = unescapeComponent(hfield[1], options);
                        break;
                    case "body":
                        mailtoComponents.body = unescapeComponent(hfield[1], options);
                        break;
                    default:
                        unknownHeaders = true;
                        headers[unescapeComponent(hfield[0], options)] = unescapeComponent(hfield[1], options);
                        break;
                }
            }
            if (unknownHeaders) mailtoComponents.headers = headers;
        }
        mailtoComponents.query = undefined;
        for (var _x2 = 0, _xl2 = to.length; _x2 < _xl2; ++_x2) {
            var addr = to[_x2].split("@");
            addr[0] = unescapeComponent(addr[0]);
            if (!options.unicodeSupport) {
                //convert Unicode IDN -> ASCII IDN
                try {
                    addr[1] = punycode.toASCII(unescapeComponent(addr[1], options).toLowerCase());
                } catch (e) {
                    mailtoComponents.error = mailtoComponents.error || "Email address's domain name can not be converted to ASCII via punycode: " + e;
                }
            } else {
                addr[1] = unescapeComponent(addr[1], options).toLowerCase();
            }
            to[_x2] = addr.join("@");
        }
        return mailtoComponents;
    },
    serialize: function serialize$$1(mailtoComponents, options) {
        var components = mailtoComponents;
        var to = toArray(mailtoComponents.to);
        if (to) {
            for (var x = 0, xl = to.length; x < xl; ++x) {
                var toAddr = String(to[x]);
                var atIdx = toAddr.lastIndexOf("@");
                var localPart = toAddr.slice(0, atIdx).replace(PCT_ENCODED, decodeUnreserved).replace(PCT_ENCODED, toUpperCase).replace(NOT_LOCAL_PART, pctEncChar);
                var domain = toAddr.slice(atIdx + 1);
                //convert IDN via punycode
                try {
                    domain = !options.iri ? punycode.toASCII(unescapeComponent(domain, options).toLowerCase()) : punycode.toUnicode(domain);
                } catch (e) {
                    components.error = components.error || "Email address's domain name can not be converted to " + (!options.iri ? "ASCII" : "Unicode") + " via punycode: " + e;
                }
                to[x] = localPart + "@" + domain;
            }
            components.path = to.join(",");
        }
        var headers = mailtoComponents.headers = mailtoComponents.headers || {};
        if (mailtoComponents.subject) headers["subject"] = mailtoComponents.subject;
        if (mailtoComponents.body) headers["body"] = mailtoComponents.body;
        var fields = [];
        for (var name in headers) {
            if (headers[name] !== O[name]) {
                fields.push(name.replace(PCT_ENCODED, decodeUnreserved).replace(PCT_ENCODED, toUpperCase).replace(NOT_HFNAME, pctEncChar) + "=" + headers[name].replace(PCT_ENCODED, decodeUnreserved).replace(PCT_ENCODED, toUpperCase).replace(NOT_HFVALUE, pctEncChar));
            }
        }
        if (fields.length) {
            components.query = fields.join("&");
        }
        return components;
    }
};

var URN_PARSE = /^([^\:]+)\:(.*)/;
//RFC 2141
var handler$5 = {
    scheme: "urn",
    parse: function parse$$1(components, options) {
        var matches = components.path && components.path.match(URN_PARSE);
        var urnComponents = components;
        if (matches) {
            var scheme = options.scheme || urnComponents.scheme || "urn";
            var nid = matches[1].toLowerCase();
            var nss = matches[2];
            var urnScheme = scheme + ":" + (options.nid || nid);
            var schemeHandler = SCHEMES[urnScheme];
            urnComponents.nid = nid;
            urnComponents.nss = nss;
            urnComponents.path = undefined;
            if (schemeHandler) {
                urnComponents = schemeHandler.parse(urnComponents, options);
            }
        } else {
            urnComponents.error = urnComponents.error || "URN can not be parsed.";
        }
        return urnComponents;
    },
    serialize: function serialize$$1(urnComponents, options) {
        var scheme = options.scheme || urnComponents.scheme || "urn";
        var nid = urnComponents.nid;
        var urnScheme = scheme + ":" + (options.nid || nid);
        var schemeHandler = SCHEMES[urnScheme];
        if (schemeHandler) {
            urnComponents = schemeHandler.serialize(urnComponents, options);
        }
        var uriComponents = urnComponents;
        var nss = urnComponents.nss;
        uriComponents.path = (nid || options.nid) + ":" + nss;
        return uriComponents;
    }
};

var UUID = /^[0-9A-Fa-f]{8}(?:\-[0-9A-Fa-f]{4}){3}\-[0-9A-Fa-f]{12}$/;
//RFC 4122
var handler$6 = {
    scheme: "urn:uuid",
    parse: function parse(urnComponents, options) {
        var uuidComponents = urnComponents;
        uuidComponents.uuid = uuidComponents.nss;
        uuidComponents.nss = undefined;
        if (!options.tolerant && (!uuidComponents.uuid || !uuidComponents.uuid.match(UUID))) {
            uuidComponents.error = uuidComponents.error || "UUID is not valid.";
        }
        return uuidComponents;
    },
    serialize: function serialize(uuidComponents, options) {
        var urnComponents = uuidComponents;
        //normalize UUID
        urnComponents.nss = (uuidComponents.uuid || "").toLowerCase();
        return urnComponents;
    }
};

SCHEMES[handler.scheme] = handler;
SCHEMES[handler$1.scheme] = handler$1;
SCHEMES[handler$2.scheme] = handler$2;
SCHEMES[handler$3.scheme] = handler$3;
SCHEMES[handler$4.scheme] = handler$4;
SCHEMES[handler$5.scheme] = handler$5;
SCHEMES[handler$6.scheme] = handler$6;

exports.SCHEMES = SCHEMES;
exports.pctEncChar = pctEncChar;
exports.pctDecChars = pctDecChars;
exports.parse = parse;
exports.removeDotSegments = removeDotSegments;
exports.serialize = serialize;
exports.resolveComponents = resolveComponents;
exports.resolve = resolve;
exports.normalize = normalize;
exports.equal = equal;
exports.escapeComponent = escapeComponent;
exports.unescapeComponent = unescapeComponent;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=uri.all.js.map


/***/ }),

/***/ 69588:
/***/ ((module) => {

"use strict";


var conversions = {};
module.exports = conversions;

function sign(x) {
    return x < 0 ? -1 : 1;
}

function evenRound(x) {
    // Round x to the nearest integer, choosing the even integer if it lies halfway between two.
    if ((x % 1) === 0.5 && (x & 1) === 0) { // [even number].5; round down (i.e. floor)
        return Math.floor(x);
    } else {
        return Math.round(x);
    }
}

function createNumberConversion(bitLength, typeOpts) {
    if (!typeOpts.unsigned) {
        --bitLength;
    }
    const lowerBound = typeOpts.unsigned ? 0 : -Math.pow(2, bitLength);
    const upperBound = Math.pow(2, bitLength) - 1;

    const moduloVal = typeOpts.moduloBitLength ? Math.pow(2, typeOpts.moduloBitLength) : Math.pow(2, bitLength);
    const moduloBound = typeOpts.moduloBitLength ? Math.pow(2, typeOpts.moduloBitLength - 1) : Math.pow(2, bitLength - 1);

    return function(V, opts) {
        if (!opts) opts = {};

        let x = +V;

        if (opts.enforceRange) {
            if (!Number.isFinite(x)) {
                throw new TypeError("Argument is not a finite number");
            }

            x = sign(x) * Math.floor(Math.abs(x));
            if (x < lowerBound || x > upperBound) {
                throw new TypeError("Argument is not in byte range");
            }

            return x;
        }

        if (!isNaN(x) && opts.clamp) {
            x = evenRound(x);

            if (x < lowerBound) x = lowerBound;
            if (x > upperBound) x = upperBound;
            return x;
        }

        if (!Number.isFinite(x) || x === 0) {
            return 0;
        }

        x = sign(x) * Math.floor(Math.abs(x));
        x = x % moduloVal;

        if (!typeOpts.unsigned && x >= moduloBound) {
            return x - moduloVal;
        } else if (typeOpts.unsigned) {
            if (x < 0) {
              x += moduloVal;
            } else if (x === -0) { // don't return negative zero
              return 0;
            }
        }

        return x;
    }
}

conversions["void"] = function () {
    return undefined;
};

conversions["boolean"] = function (val) {
    return !!val;
};

conversions["byte"] = createNumberConversion(8, { unsigned: false });
conversions["octet"] = createNumberConversion(8, { unsigned: true });

conversions["short"] = createNumberConversion(16, { unsigned: false });
conversions["unsigned short"] = createNumberConversion(16, { unsigned: true });

conversions["long"] = createNumberConversion(32, { unsigned: false });
conversions["unsigned long"] = createNumberConversion(32, { unsigned: true });

conversions["long long"] = createNumberConversion(32, { unsigned: false, moduloBitLength: 64 });
conversions["unsigned long long"] = createNumberConversion(32, { unsigned: true, moduloBitLength: 64 });

conversions["double"] = function (V) {
    const x = +V;

    if (!Number.isFinite(x)) {
        throw new TypeError("Argument is not a finite floating-point value");
    }

    return x;
};

conversions["unrestricted double"] = function (V) {
    const x = +V;

    if (isNaN(x)) {
        throw new TypeError("Argument is NaN");
    }

    return x;
};

// not quite valid, but good enough for JS
conversions["float"] = conversions["double"];
conversions["unrestricted float"] = conversions["unrestricted double"];

conversions["DOMString"] = function (V, opts) {
    if (!opts) opts = {};

    if (opts.treatNullAsEmptyString && V === null) {
        return "";
    }

    return String(V);
};

conversions["ByteString"] = function (V, opts) {
    const x = String(V);
    let c = undefined;
    for (let i = 0; (c = x.codePointAt(i)) !== undefined; ++i) {
        if (c > 255) {
            throw new TypeError("Argument is not a valid bytestring");
        }
    }

    return x;
};

conversions["USVString"] = function (V) {
    const S = String(V);
    const n = S.length;
    const U = [];
    for (let i = 0; i < n; ++i) {
        const c = S.charCodeAt(i);
        if (c < 0xD800 || c > 0xDFFF) {
            U.push(String.fromCodePoint(c));
        } else if (0xDC00 <= c && c <= 0xDFFF) {
            U.push(String.fromCodePoint(0xFFFD));
        } else {
            if (i === n - 1) {
                U.push(String.fromCodePoint(0xFFFD));
            } else {
                const d = S.charCodeAt(i + 1);
                if (0xDC00 <= d && d <= 0xDFFF) {
                    const a = c & 0x3FF;
                    const b = d & 0x3FF;
                    U.push(String.fromCodePoint((2 << 15) + (2 << 9) * a + b));
                    ++i;
                } else {
                    U.push(String.fromCodePoint(0xFFFD));
                }
            }
        }
    }

    return U.join('');
};

conversions["Date"] = function (V, opts) {
    if (!(V instanceof Date)) {
        throw new TypeError("Argument is not a Date object");
    }
    if (isNaN(V)) {
        return undefined;
    }

    return V;
};

conversions["RegExp"] = function (V, opts) {
    if (!(V instanceof RegExp)) {
        V = new RegExp(V);
    }

    return V;
};


/***/ }),

/***/ 46088:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

const usm = __webpack_require__(7122);

exports.implementation = class URLImpl {
  constructor(constructorArgs) {
    const url = constructorArgs[0];
    const base = constructorArgs[1];

    let parsedBase = null;
    if (base !== undefined) {
      parsedBase = usm.basicURLParse(base);
      if (parsedBase === "failure") {
        throw new TypeError("Invalid base URL");
      }
    }

    const parsedURL = usm.basicURLParse(url, { baseURL: parsedBase });
    if (parsedURL === "failure") {
      throw new TypeError("Invalid URL");
    }

    this._url = parsedURL;

    // TODO: query stuff
  }

  get href() {
    return usm.serializeURL(this._url);
  }

  set href(v) {
    const parsedURL = usm.basicURLParse(v);
    if (parsedURL === "failure") {
      throw new TypeError("Invalid URL");
    }

    this._url = parsedURL;
  }

  get origin() {
    return usm.serializeURLOrigin(this._url);
  }

  get protocol() {
    return this._url.scheme + ":";
  }

  set protocol(v) {
    usm.basicURLParse(v + ":", { url: this._url, stateOverride: "scheme start" });
  }

  get username() {
    return this._url.username;
  }

  set username(v) {
    if (usm.cannotHaveAUsernamePasswordPort(this._url)) {
      return;
    }

    usm.setTheUsername(this._url, v);
  }

  get password() {
    return this._url.password;
  }

  set password(v) {
    if (usm.cannotHaveAUsernamePasswordPort(this._url)) {
      return;
    }

    usm.setThePassword(this._url, v);
  }

  get host() {
    const url = this._url;

    if (url.host === null) {
      return "";
    }

    if (url.port === null) {
      return usm.serializeHost(url.host);
    }

    return usm.serializeHost(url.host) + ":" + usm.serializeInteger(url.port);
  }

  set host(v) {
    if (this._url.cannotBeABaseURL) {
      return;
    }

    usm.basicURLParse(v, { url: this._url, stateOverride: "host" });
  }

  get hostname() {
    if (this._url.host === null) {
      return "";
    }

    return usm.serializeHost(this._url.host);
  }

  set hostname(v) {
    if (this._url.cannotBeABaseURL) {
      return;
    }

    usm.basicURLParse(v, { url: this._url, stateOverride: "hostname" });
  }

  get port() {
    if (this._url.port === null) {
      return "";
    }

    return usm.serializeInteger(this._url.port);
  }

  set port(v) {
    if (usm.cannotHaveAUsernamePasswordPort(this._url)) {
      return;
    }

    if (v === "") {
      this._url.port = null;
    } else {
      usm.basicURLParse(v, { url: this._url, stateOverride: "port" });
    }
  }

  get pathname() {
    if (this._url.cannotBeABaseURL) {
      return this._url.path[0];
    }

    if (this._url.path.length === 0) {
      return "";
    }

    return "/" + this._url.path.join("/");
  }

  set pathname(v) {
    if (this._url.cannotBeABaseURL) {
      return;
    }

    this._url.path = [];
    usm.basicURLParse(v, { url: this._url, stateOverride: "path start" });
  }

  get search() {
    if (this._url.query === null || this._url.query === "") {
      return "";
    }

    return "?" + this._url.query;
  }

  set search(v) {
    // TODO: query stuff

    const url = this._url;

    if (v === "") {
      url.query = null;
      return;
    }

    const input = v[0] === "?" ? v.substring(1) : v;
    url.query = "";
    usm.basicURLParse(input, { url, stateOverride: "query" });
  }

  get hash() {
    if (this._url.fragment === null || this._url.fragment === "") {
      return "";
    }

    return "#" + this._url.fragment;
  }

  set hash(v) {
    if (v === "") {
      this._url.fragment = null;
      return;
    }

    const input = v[0] === "#" ? v.substring(1) : v;
    this._url.fragment = "";
    usm.basicURLParse(input, { url: this._url, stateOverride: "fragment" });
  }

  toJSON() {
    return this.href;
  }
};


/***/ }),

/***/ 49786:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const conversions = __webpack_require__(69588);
const utils = __webpack_require__(79978);
const Impl = __webpack_require__(46088);

const impl = utils.implSymbol;

function URL(url) {
  if (!this || this[impl] || !(this instanceof URL)) {
    throw new TypeError("Failed to construct 'URL': Please use the 'new' operator, this DOM object constructor cannot be called as a function.");
  }
  if (arguments.length < 1) {
    throw new TypeError("Failed to construct 'URL': 1 argument required, but only " + arguments.length + " present.");
  }
  const args = [];
  for (let i = 0; i < arguments.length && i < 2; ++i) {
    args[i] = arguments[i];
  }
  args[0] = conversions["USVString"](args[0]);
  if (args[1] !== undefined) {
  args[1] = conversions["USVString"](args[1]);
  }

  module.exports.setup(this, args);
}

URL.prototype.toJSON = function toJSON() {
  if (!this || !module.exports.is(this)) {
    throw new TypeError("Illegal invocation");
  }
  const args = [];
  for (let i = 0; i < arguments.length && i < 0; ++i) {
    args[i] = arguments[i];
  }
  return this[impl].toJSON.apply(this[impl], args);
};
Object.defineProperty(URL.prototype, "href", {
  get() {
    return this[impl].href;
  },
  set(V) {
    V = conversions["USVString"](V);
    this[impl].href = V;
  },
  enumerable: true,
  configurable: true
});

URL.prototype.toString = function () {
  if (!this || !module.exports.is(this)) {
    throw new TypeError("Illegal invocation");
  }
  return this.href;
};

Object.defineProperty(URL.prototype, "origin", {
  get() {
    return this[impl].origin;
  },
  enumerable: true,
  configurable: true
});

Object.defineProperty(URL.prototype, "protocol", {
  get() {
    return this[impl].protocol;
  },
  set(V) {
    V = conversions["USVString"](V);
    this[impl].protocol = V;
  },
  enumerable: true,
  configurable: true
});

Object.defineProperty(URL.prototype, "username", {
  get() {
    return this[impl].username;
  },
  set(V) {
    V = conversions["USVString"](V);
    this[impl].username = V;
  },
  enumerable: true,
  configurable: true
});

Object.defineProperty(URL.prototype, "password", {
  get() {
    return this[impl].password;
  },
  set(V) {
    V = conversions["USVString"](V);
    this[impl].password = V;
  },
  enumerable: true,
  configurable: true
});

Object.defineProperty(URL.prototype, "host", {
  get() {
    return this[impl].host;
  },
  set(V) {
    V = conversions["USVString"](V);
    this[impl].host = V;
  },
  enumerable: true,
  configurable: true
});

Object.defineProperty(URL.prototype, "hostname", {
  get() {
    return this[impl].hostname;
  },
  set(V) {
    V = conversions["USVString"](V);
    this[impl].hostname = V;
  },
  enumerable: true,
  configurable: true
});

Object.defineProperty(URL.prototype, "port", {
  get() {
    return this[impl].port;
  },
  set(V) {
    V = conversions["USVString"](V);
    this[impl].port = V;
  },
  enumerable: true,
  configurable: true
});

Object.defineProperty(URL.prototype, "pathname", {
  get() {
    return this[impl].pathname;
  },
  set(V) {
    V = conversions["USVString"](V);
    this[impl].pathname = V;
  },
  enumerable: true,
  configurable: true
});

Object.defineProperty(URL.prototype, "search", {
  get() {
    return this[impl].search;
  },
  set(V) {
    V = conversions["USVString"](V);
    this[impl].search = V;
  },
  enumerable: true,
  configurable: true
});

Object.defineProperty(URL.prototype, "hash", {
  get() {
    return this[impl].hash;
  },
  set(V) {
    V = conversions["USVString"](V);
    this[impl].hash = V;
  },
  enumerable: true,
  configurable: true
});


module.exports = {
  is(obj) {
    return !!obj && obj[impl] instanceof Impl.implementation;
  },
  create(constructorArgs, privateData) {
    let obj = Object.create(URL.prototype);
    this.setup(obj, constructorArgs, privateData);
    return obj;
  },
  setup(obj, constructorArgs, privateData) {
    if (!privateData) privateData = {};
    privateData.wrapper = obj;

    obj[impl] = new Impl.implementation(constructorArgs, privateData);
    obj[impl][utils.wrapperSymbol] = obj;
  },
  interface: URL,
  expose: {
    Window: { URL: URL },
    Worker: { URL: URL }
  }
};



/***/ }),

/***/ 88533:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


exports.URL = __webpack_require__(49786)["interface"];
exports.serializeURL = __webpack_require__(7122).serializeURL;
exports.serializeURLOrigin = __webpack_require__(7122).serializeURLOrigin;
exports.basicURLParse = __webpack_require__(7122).basicURLParse;
exports.setTheUsername = __webpack_require__(7122).setTheUsername;
exports.setThePassword = __webpack_require__(7122).setThePassword;
exports.serializeHost = __webpack_require__(7122).serializeHost;
exports.serializeInteger = __webpack_require__(7122).serializeInteger;
exports.parseURL = __webpack_require__(7122).parseURL;


/***/ }),

/***/ 7122:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

const punycode = __webpack_require__(85477);
const tr46 = __webpack_require__(50930);

const specialSchemes = {
  ftp: 21,
  file: null,
  gopher: 70,
  http: 80,
  https: 443,
  ws: 80,
  wss: 443
};

const failure = Symbol("failure");

function countSymbols(str) {
  return punycode.ucs2.decode(str).length;
}

function at(input, idx) {
  const c = input[idx];
  return isNaN(c) ? undefined : String.fromCodePoint(c);
}

function isASCIIDigit(c) {
  return c >= 0x30 && c <= 0x39;
}

function isASCIIAlpha(c) {
  return (c >= 0x41 && c <= 0x5A) || (c >= 0x61 && c <= 0x7A);
}

function isASCIIAlphanumeric(c) {
  return isASCIIAlpha(c) || isASCIIDigit(c);
}

function isASCIIHex(c) {
  return isASCIIDigit(c) || (c >= 0x41 && c <= 0x46) || (c >= 0x61 && c <= 0x66);
}

function isSingleDot(buffer) {
  return buffer === "." || buffer.toLowerCase() === "%2e";
}

function isDoubleDot(buffer) {
  buffer = buffer.toLowerCase();
  return buffer === ".." || buffer === "%2e." || buffer === ".%2e" || buffer === "%2e%2e";
}

function isWindowsDriveLetterCodePoints(cp1, cp2) {
  return isASCIIAlpha(cp1) && (cp2 === 58 || cp2 === 124);
}

function isWindowsDriveLetterString(string) {
  return string.length === 2 && isASCIIAlpha(string.codePointAt(0)) && (string[1] === ":" || string[1] === "|");
}

function isNormalizedWindowsDriveLetterString(string) {
  return string.length === 2 && isASCIIAlpha(string.codePointAt(0)) && string[1] === ":";
}

function containsForbiddenHostCodePoint(string) {
  return string.search(/\u0000|\u0009|\u000A|\u000D|\u0020|#|%|\/|:|\?|@|\[|\\|\]/) !== -1;
}

function containsForbiddenHostCodePointExcludingPercent(string) {
  return string.search(/\u0000|\u0009|\u000A|\u000D|\u0020|#|\/|:|\?|@|\[|\\|\]/) !== -1;
}

function isSpecialScheme(scheme) {
  return specialSchemes[scheme] !== undefined;
}

function isSpecial(url) {
  return isSpecialScheme(url.scheme);
}

function defaultPort(scheme) {
  return specialSchemes[scheme];
}

function percentEncode(c) {
  let hex = c.toString(16).toUpperCase();
  if (hex.length === 1) {
    hex = "0" + hex;
  }

  return "%" + hex;
}

function utf8PercentEncode(c) {
  const buf = new Buffer(c);

  let str = "";

  for (let i = 0; i < buf.length; ++i) {
    str += percentEncode(buf[i]);
  }

  return str;
}

function utf8PercentDecode(str) {
  const input = new Buffer(str);
  const output = [];
  for (let i = 0; i < input.length; ++i) {
    if (input[i] !== 37) {
      output.push(input[i]);
    } else if (input[i] === 37 && isASCIIHex(input[i + 1]) && isASCIIHex(input[i + 2])) {
      output.push(parseInt(input.slice(i + 1, i + 3).toString(), 16));
      i += 2;
    } else {
      output.push(input[i]);
    }
  }
  return new Buffer(output).toString();
}

function isC0ControlPercentEncode(c) {
  return c <= 0x1F || c > 0x7E;
}

const extraPathPercentEncodeSet = new Set([32, 34, 35, 60, 62, 63, 96, 123, 125]);
function isPathPercentEncode(c) {
  return isC0ControlPercentEncode(c) || extraPathPercentEncodeSet.has(c);
}

const extraUserinfoPercentEncodeSet =
  new Set([47, 58, 59, 61, 64, 91, 92, 93, 94, 124]);
function isUserinfoPercentEncode(c) {
  return isPathPercentEncode(c) || extraUserinfoPercentEncodeSet.has(c);
}

function percentEncodeChar(c, encodeSetPredicate) {
  const cStr = String.fromCodePoint(c);

  if (encodeSetPredicate(c)) {
    return utf8PercentEncode(cStr);
  }

  return cStr;
}

function parseIPv4Number(input) {
  let R = 10;

  if (input.length >= 2 && input.charAt(0) === "0" && input.charAt(1).toLowerCase() === "x") {
    input = input.substring(2);
    R = 16;
  } else if (input.length >= 2 && input.charAt(0) === "0") {
    input = input.substring(1);
    R = 8;
  }

  if (input === "") {
    return 0;
  }

  const regex = R === 10 ? /[^0-9]/ : (R === 16 ? /[^0-9A-Fa-f]/ : /[^0-7]/);
  if (regex.test(input)) {
    return failure;
  }

  return parseInt(input, R);
}

function parseIPv4(input) {
  const parts = input.split(".");
  if (parts[parts.length - 1] === "") {
    if (parts.length > 1) {
      parts.pop();
    }
  }

  if (parts.length > 4) {
    return input;
  }

  const numbers = [];
  for (const part of parts) {
    if (part === "") {
      return input;
    }
    const n = parseIPv4Number(part);
    if (n === failure) {
      return input;
    }

    numbers.push(n);
  }

  for (let i = 0; i < numbers.length - 1; ++i) {
    if (numbers[i] > 255) {
      return failure;
    }
  }
  if (numbers[numbers.length - 1] >= Math.pow(256, 5 - numbers.length)) {
    return failure;
  }

  let ipv4 = numbers.pop();
  let counter = 0;

  for (const n of numbers) {
    ipv4 += n * Math.pow(256, 3 - counter);
    ++counter;
  }

  return ipv4;
}

function serializeIPv4(address) {
  let output = "";
  let n = address;

  for (let i = 1; i <= 4; ++i) {
    output = String(n % 256) + output;
    if (i !== 4) {
      output = "." + output;
    }
    n = Math.floor(n / 256);
  }

  return output;
}

function parseIPv6(input) {
  const address = [0, 0, 0, 0, 0, 0, 0, 0];
  let pieceIndex = 0;
  let compress = null;
  let pointer = 0;

  input = punycode.ucs2.decode(input);

  if (input[pointer] === 58) {
    if (input[pointer + 1] !== 58) {
      return failure;
    }

    pointer += 2;
    ++pieceIndex;
    compress = pieceIndex;
  }

  while (pointer < input.length) {
    if (pieceIndex === 8) {
      return failure;
    }

    if (input[pointer] === 58) {
      if (compress !== null) {
        return failure;
      }
      ++pointer;
      ++pieceIndex;
      compress = pieceIndex;
      continue;
    }

    let value = 0;
    let length = 0;

    while (length < 4 && isASCIIHex(input[pointer])) {
      value = value * 0x10 + parseInt(at(input, pointer), 16);
      ++pointer;
      ++length;
    }

    if (input[pointer] === 46) {
      if (length === 0) {
        return failure;
      }

      pointer -= length;

      if (pieceIndex > 6) {
        return failure;
      }

      let numbersSeen = 0;

      while (input[pointer] !== undefined) {
        let ipv4Piece = null;

        if (numbersSeen > 0) {
          if (input[pointer] === 46 && numbersSeen < 4) {
            ++pointer;
          } else {
            return failure;
          }
        }

        if (!isASCIIDigit(input[pointer])) {
          return failure;
        }

        while (isASCIIDigit(input[pointer])) {
          const number = parseInt(at(input, pointer));
          if (ipv4Piece === null) {
            ipv4Piece = number;
          } else if (ipv4Piece === 0) {
            return failure;
          } else {
            ipv4Piece = ipv4Piece * 10 + number;
          }
          if (ipv4Piece > 255) {
            return failure;
          }
          ++pointer;
        }

        address[pieceIndex] = address[pieceIndex] * 0x100 + ipv4Piece;

        ++numbersSeen;

        if (numbersSeen === 2 || numbersSeen === 4) {
          ++pieceIndex;
        }
      }

      if (numbersSeen !== 4) {
        return failure;
      }

      break;
    } else if (input[pointer] === 58) {
      ++pointer;
      if (input[pointer] === undefined) {
        return failure;
      }
    } else if (input[pointer] !== undefined) {
      return failure;
    }

    address[pieceIndex] = value;
    ++pieceIndex;
  }

  if (compress !== null) {
    let swaps = pieceIndex - compress;
    pieceIndex = 7;
    while (pieceIndex !== 0 && swaps > 0) {
      const temp = address[compress + swaps - 1];
      address[compress + swaps - 1] = address[pieceIndex];
      address[pieceIndex] = temp;
      --pieceIndex;
      --swaps;
    }
  } else if (compress === null && pieceIndex !== 8) {
    return failure;
  }

  return address;
}

function serializeIPv6(address) {
  let output = "";
  const seqResult = findLongestZeroSequence(address);
  const compress = seqResult.idx;
  let ignore0 = false;

  for (let pieceIndex = 0; pieceIndex <= 7; ++pieceIndex) {
    if (ignore0 && address[pieceIndex] === 0) {
      continue;
    } else if (ignore0) {
      ignore0 = false;
    }

    if (compress === pieceIndex) {
      const separator = pieceIndex === 0 ? "::" : ":";
      output += separator;
      ignore0 = true;
      continue;
    }

    output += address[pieceIndex].toString(16);

    if (pieceIndex !== 7) {
      output += ":";
    }
  }

  return output;
}

function parseHost(input, isSpecialArg) {
  if (input[0] === "[") {
    if (input[input.length - 1] !== "]") {
      return failure;
    }

    return parseIPv6(input.substring(1, input.length - 1));
  }

  if (!isSpecialArg) {
    return parseOpaqueHost(input);
  }

  const domain = utf8PercentDecode(input);
  const asciiDomain = tr46.toASCII(domain, false, tr46.PROCESSING_OPTIONS.NONTRANSITIONAL, false);
  if (asciiDomain === null) {
    return failure;
  }

  if (containsForbiddenHostCodePoint(asciiDomain)) {
    return failure;
  }

  const ipv4Host = parseIPv4(asciiDomain);
  if (typeof ipv4Host === "number" || ipv4Host === failure) {
    return ipv4Host;
  }

  return asciiDomain;
}

function parseOpaqueHost(input) {
  if (containsForbiddenHostCodePointExcludingPercent(input)) {
    return failure;
  }

  let output = "";
  const decoded = punycode.ucs2.decode(input);
  for (let i = 0; i < decoded.length; ++i) {
    output += percentEncodeChar(decoded[i], isC0ControlPercentEncode);
  }
  return output;
}

function findLongestZeroSequence(arr) {
  let maxIdx = null;
  let maxLen = 1; // only find elements > 1
  let currStart = null;
  let currLen = 0;

  for (let i = 0; i < arr.length; ++i) {
    if (arr[i] !== 0) {
      if (currLen > maxLen) {
        maxIdx = currStart;
        maxLen = currLen;
      }

      currStart = null;
      currLen = 0;
    } else {
      if (currStart === null) {
        currStart = i;
      }
      ++currLen;
    }
  }

  // if trailing zeros
  if (currLen > maxLen) {
    maxIdx = currStart;
    maxLen = currLen;
  }

  return {
    idx: maxIdx,
    len: maxLen
  };
}

function serializeHost(host) {
  if (typeof host === "number") {
    return serializeIPv4(host);
  }

  // IPv6 serializer
  if (host instanceof Array) {
    return "[" + serializeIPv6(host) + "]";
  }

  return host;
}

function trimControlChars(url) {
  return url.replace(/^[\u0000-\u001F\u0020]+|[\u0000-\u001F\u0020]+$/g, "");
}

function trimTabAndNewline(url) {
  return url.replace(/\u0009|\u000A|\u000D/g, "");
}

function shortenPath(url) {
  const path = url.path;
  if (path.length === 0) {
    return;
  }
  if (url.scheme === "file" && path.length === 1 && isNormalizedWindowsDriveLetter(path[0])) {
    return;
  }

  path.pop();
}

function includesCredentials(url) {
  return url.username !== "" || url.password !== "";
}

function cannotHaveAUsernamePasswordPort(url) {
  return url.host === null || url.host === "" || url.cannotBeABaseURL || url.scheme === "file";
}

function isNormalizedWindowsDriveLetter(string) {
  return /^[A-Za-z]:$/.test(string);
}

function URLStateMachine(input, base, encodingOverride, url, stateOverride) {
  this.pointer = 0;
  this.input = input;
  this.base = base || null;
  this.encodingOverride = encodingOverride || "utf-8";
  this.stateOverride = stateOverride;
  this.url = url;
  this.failure = false;
  this.parseError = false;

  if (!this.url) {
    this.url = {
      scheme: "",
      username: "",
      password: "",
      host: null,
      port: null,
      path: [],
      query: null,
      fragment: null,

      cannotBeABaseURL: false
    };

    const res = trimControlChars(this.input);
    if (res !== this.input) {
      this.parseError = true;
    }
    this.input = res;
  }

  const res = trimTabAndNewline(this.input);
  if (res !== this.input) {
    this.parseError = true;
  }
  this.input = res;

  this.state = stateOverride || "scheme start";

  this.buffer = "";
  this.atFlag = false;
  this.arrFlag = false;
  this.passwordTokenSeenFlag = false;

  this.input = punycode.ucs2.decode(this.input);

  for (; this.pointer <= this.input.length; ++this.pointer) {
    const c = this.input[this.pointer];
    const cStr = isNaN(c) ? undefined : String.fromCodePoint(c);

    // exec state machine
    const ret = this["parse " + this.state](c, cStr);
    if (!ret) {
      break; // terminate algorithm
    } else if (ret === failure) {
      this.failure = true;
      break;
    }
  }
}

URLStateMachine.prototype["parse scheme start"] = function parseSchemeStart(c, cStr) {
  if (isASCIIAlpha(c)) {
    this.buffer += cStr.toLowerCase();
    this.state = "scheme";
  } else if (!this.stateOverride) {
    this.state = "no scheme";
    --this.pointer;
  } else {
    this.parseError = true;
    return failure;
  }

  return true;
};

URLStateMachine.prototype["parse scheme"] = function parseScheme(c, cStr) {
  if (isASCIIAlphanumeric(c) || c === 43 || c === 45 || c === 46) {
    this.buffer += cStr.toLowerCase();
  } else if (c === 58) {
    if (this.stateOverride) {
      if (isSpecial(this.url) && !isSpecialScheme(this.buffer)) {
        return false;
      }

      if (!isSpecial(this.url) && isSpecialScheme(this.buffer)) {
        return false;
      }

      if ((includesCredentials(this.url) || this.url.port !== null) && this.buffer === "file") {
        return false;
      }

      if (this.url.scheme === "file" && (this.url.host === "" || this.url.host === null)) {
        return false;
      }
    }
    this.url.scheme = this.buffer;
    this.buffer = "";
    if (this.stateOverride) {
      return false;
    }
    if (this.url.scheme === "file") {
      if (this.input[this.pointer + 1] !== 47 || this.input[this.pointer + 2] !== 47) {
        this.parseError = true;
      }
      this.state = "file";
    } else if (isSpecial(this.url) && this.base !== null && this.base.scheme === this.url.scheme) {
      this.state = "special relative or authority";
    } else if (isSpecial(this.url)) {
      this.state = "special authority slashes";
    } else if (this.input[this.pointer + 1] === 47) {
      this.state = "path or authority";
      ++this.pointer;
    } else {
      this.url.cannotBeABaseURL = true;
      this.url.path.push("");
      this.state = "cannot-be-a-base-URL path";
    }
  } else if (!this.stateOverride) {
    this.buffer = "";
    this.state = "no scheme";
    this.pointer = -1;
  } else {
    this.parseError = true;
    return failure;
  }

  return true;
};

URLStateMachine.prototype["parse no scheme"] = function parseNoScheme(c) {
  if (this.base === null || (this.base.cannotBeABaseURL && c !== 35)) {
    return failure;
  } else if (this.base.cannotBeABaseURL && c === 35) {
    this.url.scheme = this.base.scheme;
    this.url.path = this.base.path.slice();
    this.url.query = this.base.query;
    this.url.fragment = "";
    this.url.cannotBeABaseURL = true;
    this.state = "fragment";
  } else if (this.base.scheme === "file") {
    this.state = "file";
    --this.pointer;
  } else {
    this.state = "relative";
    --this.pointer;
  }

  return true;
};

URLStateMachine.prototype["parse special relative or authority"] = function parseSpecialRelativeOrAuthority(c) {
  if (c === 47 && this.input[this.pointer + 1] === 47) {
    this.state = "special authority ignore slashes";
    ++this.pointer;
  } else {
    this.parseError = true;
    this.state = "relative";
    --this.pointer;
  }

  return true;
};

URLStateMachine.prototype["parse path or authority"] = function parsePathOrAuthority(c) {
  if (c === 47) {
    this.state = "authority";
  } else {
    this.state = "path";
    --this.pointer;
  }

  return true;
};

URLStateMachine.prototype["parse relative"] = function parseRelative(c) {
  this.url.scheme = this.base.scheme;
  if (isNaN(c)) {
    this.url.username = this.base.username;
    this.url.password = this.base.password;
    this.url.host = this.base.host;
    this.url.port = this.base.port;
    this.url.path = this.base.path.slice();
    this.url.query = this.base.query;
  } else if (c === 47) {
    this.state = "relative slash";
  } else if (c === 63) {
    this.url.username = this.base.username;
    this.url.password = this.base.password;
    this.url.host = this.base.host;
    this.url.port = this.base.port;
    this.url.path = this.base.path.slice();
    this.url.query = "";
    this.state = "query";
  } else if (c === 35) {
    this.url.username = this.base.username;
    this.url.password = this.base.password;
    this.url.host = this.base.host;
    this.url.port = this.base.port;
    this.url.path = this.base.path.slice();
    this.url.query = this.base.query;
    this.url.fragment = "";
    this.state = "fragment";
  } else if (isSpecial(this.url) && c === 92) {
    this.parseError = true;
    this.state = "relative slash";
  } else {
    this.url.username = this.base.username;
    this.url.password = this.base.password;
    this.url.host = this.base.host;
    this.url.port = this.base.port;
    this.url.path = this.base.path.slice(0, this.base.path.length - 1);

    this.state = "path";
    --this.pointer;
  }

  return true;
};

URLStateMachine.prototype["parse relative slash"] = function parseRelativeSlash(c) {
  if (isSpecial(this.url) && (c === 47 || c === 92)) {
    if (c === 92) {
      this.parseError = true;
    }
    this.state = "special authority ignore slashes";
  } else if (c === 47) {
    this.state = "authority";
  } else {
    this.url.username = this.base.username;
    this.url.password = this.base.password;
    this.url.host = this.base.host;
    this.url.port = this.base.port;
    this.state = "path";
    --this.pointer;
  }

  return true;
};

URLStateMachine.prototype["parse special authority slashes"] = function parseSpecialAuthoritySlashes(c) {
  if (c === 47 && this.input[this.pointer + 1] === 47) {
    this.state = "special authority ignore slashes";
    ++this.pointer;
  } else {
    this.parseError = true;
    this.state = "special authority ignore slashes";
    --this.pointer;
  }

  return true;
};

URLStateMachine.prototype["parse special authority ignore slashes"] = function parseSpecialAuthorityIgnoreSlashes(c) {
  if (c !== 47 && c !== 92) {
    this.state = "authority";
    --this.pointer;
  } else {
    this.parseError = true;
  }

  return true;
};

URLStateMachine.prototype["parse authority"] = function parseAuthority(c, cStr) {
  if (c === 64) {
    this.parseError = true;
    if (this.atFlag) {
      this.buffer = "%40" + this.buffer;
    }
    this.atFlag = true;

    // careful, this is based on buffer and has its own pointer (this.pointer != pointer) and inner chars
    const len = countSymbols(this.buffer);
    for (let pointer = 0; pointer < len; ++pointer) {
      const codePoint = this.buffer.codePointAt(pointer);

      if (codePoint === 58 && !this.passwordTokenSeenFlag) {
        this.passwordTokenSeenFlag = true;
        continue;
      }
      const encodedCodePoints = percentEncodeChar(codePoint, isUserinfoPercentEncode);
      if (this.passwordTokenSeenFlag) {
        this.url.password += encodedCodePoints;
      } else {
        this.url.username += encodedCodePoints;
      }
    }
    this.buffer = "";
  } else if (isNaN(c) || c === 47 || c === 63 || c === 35 ||
             (isSpecial(this.url) && c === 92)) {
    if (this.atFlag && this.buffer === "") {
      this.parseError = true;
      return failure;
    }
    this.pointer -= countSymbols(this.buffer) + 1;
    this.buffer = "";
    this.state = "host";
  } else {
    this.buffer += cStr;
  }

  return true;
};

URLStateMachine.prototype["parse hostname"] =
URLStateMachine.prototype["parse host"] = function parseHostName(c, cStr) {
  if (this.stateOverride && this.url.scheme === "file") {
    --this.pointer;
    this.state = "file host";
  } else if (c === 58 && !this.arrFlag) {
    if (this.buffer === "") {
      this.parseError = true;
      return failure;
    }

    const host = parseHost(this.buffer, isSpecial(this.url));
    if (host === failure) {
      return failure;
    }

    this.url.host = host;
    this.buffer = "";
    this.state = "port";
    if (this.stateOverride === "hostname") {
      return false;
    }
  } else if (isNaN(c) || c === 47 || c === 63 || c === 35 ||
             (isSpecial(this.url) && c === 92)) {
    --this.pointer;
    if (isSpecial(this.url) && this.buffer === "") {
      this.parseError = true;
      return failure;
    } else if (this.stateOverride && this.buffer === "" &&
               (includesCredentials(this.url) || this.url.port !== null)) {
      this.parseError = true;
      return false;
    }

    const host = parseHost(this.buffer, isSpecial(this.url));
    if (host === failure) {
      return failure;
    }

    this.url.host = host;
    this.buffer = "";
    this.state = "path start";
    if (this.stateOverride) {
      return false;
    }
  } else {
    if (c === 91) {
      this.arrFlag = true;
    } else if (c === 93) {
      this.arrFlag = false;
    }
    this.buffer += cStr;
  }

  return true;
};

URLStateMachine.prototype["parse port"] = function parsePort(c, cStr) {
  if (isASCIIDigit(c)) {
    this.buffer += cStr;
  } else if (isNaN(c) || c === 47 || c === 63 || c === 35 ||
             (isSpecial(this.url) && c === 92) ||
             this.stateOverride) {
    if (this.buffer !== "") {
      const port = parseInt(this.buffer);
      if (port > Math.pow(2, 16) - 1) {
        this.parseError = true;
        return failure;
      }
      this.url.port = port === defaultPort(this.url.scheme) ? null : port;
      this.buffer = "";
    }
    if (this.stateOverride) {
      return false;
    }
    this.state = "path start";
    --this.pointer;
  } else {
    this.parseError = true;
    return failure;
  }

  return true;
};

const fileOtherwiseCodePoints = new Set([47, 92, 63, 35]);

URLStateMachine.prototype["parse file"] = function parseFile(c) {
  this.url.scheme = "file";

  if (c === 47 || c === 92) {
    if (c === 92) {
      this.parseError = true;
    }
    this.state = "file slash";
  } else if (this.base !== null && this.base.scheme === "file") {
    if (isNaN(c)) {
      this.url.host = this.base.host;
      this.url.path = this.base.path.slice();
      this.url.query = this.base.query;
    } else if (c === 63) {
      this.url.host = this.base.host;
      this.url.path = this.base.path.slice();
      this.url.query = "";
      this.state = "query";
    } else if (c === 35) {
      this.url.host = this.base.host;
      this.url.path = this.base.path.slice();
      this.url.query = this.base.query;
      this.url.fragment = "";
      this.state = "fragment";
    } else {
      if (this.input.length - this.pointer - 1 === 0 || // remaining consists of 0 code points
          !isWindowsDriveLetterCodePoints(c, this.input[this.pointer + 1]) ||
          (this.input.length - this.pointer - 1 >= 2 && // remaining has at least 2 code points
           !fileOtherwiseCodePoints.has(this.input[this.pointer + 2]))) {
        this.url.host = this.base.host;
        this.url.path = this.base.path.slice();
        shortenPath(this.url);
      } else {
        this.parseError = true;
      }

      this.state = "path";
      --this.pointer;
    }
  } else {
    this.state = "path";
    --this.pointer;
  }

  return true;
};

URLStateMachine.prototype["parse file slash"] = function parseFileSlash(c) {
  if (c === 47 || c === 92) {
    if (c === 92) {
      this.parseError = true;
    }
    this.state = "file host";
  } else {
    if (this.base !== null && this.base.scheme === "file") {
      if (isNormalizedWindowsDriveLetterString(this.base.path[0])) {
        this.url.path.push(this.base.path[0]);
      } else {
        this.url.host = this.base.host;
      }
    }
    this.state = "path";
    --this.pointer;
  }

  return true;
};

URLStateMachine.prototype["parse file host"] = function parseFileHost(c, cStr) {
  if (isNaN(c) || c === 47 || c === 92 || c === 63 || c === 35) {
    --this.pointer;
    if (!this.stateOverride && isWindowsDriveLetterString(this.buffer)) {
      this.parseError = true;
      this.state = "path";
    } else if (this.buffer === "") {
      this.url.host = "";
      if (this.stateOverride) {
        return false;
      }
      this.state = "path start";
    } else {
      let host = parseHost(this.buffer, isSpecial(this.url));
      if (host === failure) {
        return failure;
      }
      if (host === "localhost") {
        host = "";
      }
      this.url.host = host;

      if (this.stateOverride) {
        return false;
      }

      this.buffer = "";
      this.state = "path start";
    }
  } else {
    this.buffer += cStr;
  }

  return true;
};

URLStateMachine.prototype["parse path start"] = function parsePathStart(c) {
  if (isSpecial(this.url)) {
    if (c === 92) {
      this.parseError = true;
    }
    this.state = "path";

    if (c !== 47 && c !== 92) {
      --this.pointer;
    }
  } else if (!this.stateOverride && c === 63) {
    this.url.query = "";
    this.state = "query";
  } else if (!this.stateOverride && c === 35) {
    this.url.fragment = "";
    this.state = "fragment";
  } else if (c !== undefined) {
    this.state = "path";
    if (c !== 47) {
      --this.pointer;
    }
  }

  return true;
};

URLStateMachine.prototype["parse path"] = function parsePath(c) {
  if (isNaN(c) || c === 47 || (isSpecial(this.url) && c === 92) ||
      (!this.stateOverride && (c === 63 || c === 35))) {
    if (isSpecial(this.url) && c === 92) {
      this.parseError = true;
    }

    if (isDoubleDot(this.buffer)) {
      shortenPath(this.url);
      if (c !== 47 && !(isSpecial(this.url) && c === 92)) {
        this.url.path.push("");
      }
    } else if (isSingleDot(this.buffer) && c !== 47 &&
               !(isSpecial(this.url) && c === 92)) {
      this.url.path.push("");
    } else if (!isSingleDot(this.buffer)) {
      if (this.url.scheme === "file" && this.url.path.length === 0 && isWindowsDriveLetterString(this.buffer)) {
        if (this.url.host !== "" && this.url.host !== null) {
          this.parseError = true;
          this.url.host = "";
        }
        this.buffer = this.buffer[0] + ":";
      }
      this.url.path.push(this.buffer);
    }
    this.buffer = "";
    if (this.url.scheme === "file" && (c === undefined || c === 63 || c === 35)) {
      while (this.url.path.length > 1 && this.url.path[0] === "") {
        this.parseError = true;
        this.url.path.shift();
      }
    }
    if (c === 63) {
      this.url.query = "";
      this.state = "query";
    }
    if (c === 35) {
      this.url.fragment = "";
      this.state = "fragment";
    }
  } else {
    // TODO: If c is not a URL code point and not "%", parse error.

    if (c === 37 &&
      (!isASCIIHex(this.input[this.pointer + 1]) ||
        !isASCIIHex(this.input[this.pointer + 2]))) {
      this.parseError = true;
    }

    this.buffer += percentEncodeChar(c, isPathPercentEncode);
  }

  return true;
};

URLStateMachine.prototype["parse cannot-be-a-base-URL path"] = function parseCannotBeABaseURLPath(c) {
  if (c === 63) {
    this.url.query = "";
    this.state = "query";
  } else if (c === 35) {
    this.url.fragment = "";
    this.state = "fragment";
  } else {
    // TODO: Add: not a URL code point
    if (!isNaN(c) && c !== 37) {
      this.parseError = true;
    }

    if (c === 37 &&
        (!isASCIIHex(this.input[this.pointer + 1]) ||
         !isASCIIHex(this.input[this.pointer + 2]))) {
      this.parseError = true;
    }

    if (!isNaN(c)) {
      this.url.path[0] = this.url.path[0] + percentEncodeChar(c, isC0ControlPercentEncode);
    }
  }

  return true;
};

URLStateMachine.prototype["parse query"] = function parseQuery(c, cStr) {
  if (isNaN(c) || (!this.stateOverride && c === 35)) {
    if (!isSpecial(this.url) || this.url.scheme === "ws" || this.url.scheme === "wss") {
      this.encodingOverride = "utf-8";
    }

    const buffer = new Buffer(this.buffer); // TODO: Use encoding override instead
    for (let i = 0; i < buffer.length; ++i) {
      if (buffer[i] < 0x21 || buffer[i] > 0x7E || buffer[i] === 0x22 || buffer[i] === 0x23 ||
          buffer[i] === 0x3C || buffer[i] === 0x3E) {
        this.url.query += percentEncode(buffer[i]);
      } else {
        this.url.query += String.fromCodePoint(buffer[i]);
      }
    }

    this.buffer = "";
    if (c === 35) {
      this.url.fragment = "";
      this.state = "fragment";
    }
  } else {
    // TODO: If c is not a URL code point and not "%", parse error.
    if (c === 37 &&
      (!isASCIIHex(this.input[this.pointer + 1]) ||
        !isASCIIHex(this.input[this.pointer + 2]))) {
      this.parseError = true;
    }

    this.buffer += cStr;
  }

  return true;
};

URLStateMachine.prototype["parse fragment"] = function parseFragment(c) {
  if (isNaN(c)) { // do nothing
  } else if (c === 0x0) {
    this.parseError = true;
  } else {
    // TODO: If c is not a URL code point and not "%", parse error.
    if (c === 37 &&
      (!isASCIIHex(this.input[this.pointer + 1]) ||
        !isASCIIHex(this.input[this.pointer + 2]))) {
      this.parseError = true;
    }

    this.url.fragment += percentEncodeChar(c, isC0ControlPercentEncode);
  }

  return true;
};

function serializeURL(url, excludeFragment) {
  let output = url.scheme + ":";
  if (url.host !== null) {
    output += "//";

    if (url.username !== "" || url.password !== "") {
      output += url.username;
      if (url.password !== "") {
        output += ":" + url.password;
      }
      output += "@";
    }

    output += serializeHost(url.host);

    if (url.port !== null) {
      output += ":" + url.port;
    }
  } else if (url.host === null && url.scheme === "file") {
    output += "//";
  }

  if (url.cannotBeABaseURL) {
    output += url.path[0];
  } else {
    for (const string of url.path) {
      output += "/" + string;
    }
  }

  if (url.query !== null) {
    output += "?" + url.query;
  }

  if (!excludeFragment && url.fragment !== null) {
    output += "#" + url.fragment;
  }

  return output;
}

function serializeOrigin(tuple) {
  let result = tuple.scheme + "://";
  result += serializeHost(tuple.host);

  if (tuple.port !== null) {
    result += ":" + tuple.port;
  }

  return result;
}

module.exports.serializeURL = serializeURL;

module.exports.serializeURLOrigin = function (url) {
  // https://url.spec.whatwg.org/#concept-url-origin
  switch (url.scheme) {
    case "blob":
      try {
        return module.exports.serializeURLOrigin(module.exports.parseURL(url.path[0]));
      } catch (e) {
        // serializing an opaque origin returns "null"
        return "null";
      }
    case "ftp":
    case "gopher":
    case "http":
    case "https":
    case "ws":
    case "wss":
      return serializeOrigin({
        scheme: url.scheme,
        host: url.host,
        port: url.port
      });
    case "file":
      // spec says "exercise to the reader", chrome says "file://"
      return "file://";
    default:
      // serializing an opaque origin returns "null"
      return "null";
  }
};

module.exports.basicURLParse = function (input, options) {
  if (options === undefined) {
    options = {};
  }

  const usm = new URLStateMachine(input, options.baseURL, options.encodingOverride, options.url, options.stateOverride);
  if (usm.failure) {
    return "failure";
  }

  return usm.url;
};

module.exports.setTheUsername = function (url, username) {
  url.username = "";
  const decoded = punycode.ucs2.decode(username);
  for (let i = 0; i < decoded.length; ++i) {
    url.username += percentEncodeChar(decoded[i], isUserinfoPercentEncode);
  }
};

module.exports.setThePassword = function (url, password) {
  url.password = "";
  const decoded = punycode.ucs2.decode(password);
  for (let i = 0; i < decoded.length; ++i) {
    url.password += percentEncodeChar(decoded[i], isUserinfoPercentEncode);
  }
};

module.exports.serializeHost = serializeHost;

module.exports.cannotHaveAUsernamePasswordPort = cannotHaveAUsernamePasswordPort;

module.exports.serializeInteger = function (integer) {
  return String(integer);
};

module.exports.parseURL = function (input, options) {
  if (options === undefined) {
    options = {};
  }

  // We don't handle blobs, so this just delegates:
  return module.exports.basicURLParse(input, { baseURL: options.baseURL, encodingOverride: options.encodingOverride });
};


/***/ }),

/***/ 79978:
/***/ ((module) => {

"use strict";


module.exports.mixin = function mixin(target, source) {
  const keys = Object.getOwnPropertyNames(source);
  for (let i = 0; i < keys.length; ++i) {
    Object.defineProperty(target, keys[i], Object.getOwnPropertyDescriptor(source, keys[i]));
  }
};

module.exports.wrapperSymbol = Symbol("wrapper");
module.exports.implSymbol = Symbol("impl");

module.exports.wrapperForImpl = function (impl) {
  return impl[module.exports.wrapperSymbol];
};

module.exports.implForWrapper = function (wrapper) {
  return wrapper[module.exports.implSymbol];
};



/***/ }),

/***/ 35543:
/***/ ((module) => {

module.exports = eval("require")("encoding");


/***/ }),

/***/ 50199:
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"$id":"https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#","description":"Meta-schema for $data reference (JSON AnySchema extension proposal)","type":"object","required":["$data"],"properties":{"$data":{"type":"string","anyOf":[{"format":"relative-json-pointer"},{"format":"json-pointer"}]}},"additionalProperties":false}');

/***/ }),

/***/ 64746:
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"$schema":"http://json-schema.org/draft-07/schema#","$id":"http://json-schema.org/draft-07/schema#","title":"Core schema meta-schema","definitions":{"schemaArray":{"type":"array","minItems":1,"items":{"$ref":"#"}},"nonNegativeInteger":{"type":"integer","minimum":0},"nonNegativeIntegerDefault0":{"allOf":[{"$ref":"#/definitions/nonNegativeInteger"},{"default":0}]},"simpleTypes":{"enum":["array","boolean","integer","null","number","object","string"]},"stringArray":{"type":"array","items":{"type":"string"},"uniqueItems":true,"default":[]}},"type":["object","boolean"],"properties":{"$id":{"type":"string","format":"uri-reference"},"$schema":{"type":"string","format":"uri"},"$ref":{"type":"string","format":"uri-reference"},"$comment":{"type":"string"},"title":{"type":"string"},"description":{"type":"string"},"default":true,"readOnly":{"type":"boolean","default":false},"examples":{"type":"array","items":true},"multipleOf":{"type":"number","exclusiveMinimum":0},"maximum":{"type":"number"},"exclusiveMaximum":{"type":"number"},"minimum":{"type":"number"},"exclusiveMinimum":{"type":"number"},"maxLength":{"$ref":"#/definitions/nonNegativeInteger"},"minLength":{"$ref":"#/definitions/nonNegativeIntegerDefault0"},"pattern":{"type":"string","format":"regex"},"additionalItems":{"$ref":"#"},"items":{"anyOf":[{"$ref":"#"},{"$ref":"#/definitions/schemaArray"}],"default":true},"maxItems":{"$ref":"#/definitions/nonNegativeInteger"},"minItems":{"$ref":"#/definitions/nonNegativeIntegerDefault0"},"uniqueItems":{"type":"boolean","default":false},"contains":{"$ref":"#"},"maxProperties":{"$ref":"#/definitions/nonNegativeInteger"},"minProperties":{"$ref":"#/definitions/nonNegativeIntegerDefault0"},"required":{"$ref":"#/definitions/stringArray"},"additionalProperties":{"$ref":"#"},"definitions":{"type":"object","additionalProperties":{"$ref":"#"},"default":{}},"properties":{"type":"object","additionalProperties":{"$ref":"#"},"default":{}},"patternProperties":{"type":"object","additionalProperties":{"$ref":"#"},"propertyNames":{"format":"regex"},"default":{}},"dependencies":{"type":"object","additionalProperties":{"anyOf":[{"$ref":"#"},{"$ref":"#/definitions/stringArray"}]}},"propertyNames":{"$ref":"#"},"const":true,"enum":{"type":"array","items":true,"minItems":1,"uniqueItems":true},"type":{"anyOf":[{"$ref":"#/definitions/simpleTypes"},{"type":"array","items":{"$ref":"#/definitions/simpleTypes"},"minItems":1,"uniqueItems":true}]},"format":{"type":"string"},"contentMediaType":{"type":"string"},"contentEncoding":{"type":"string"},"if":{"$ref":"#"},"then":{"$ref":"#"},"else":{"$ref":"#"},"allOf":{"$ref":"#/definitions/schemaArray"},"anyOf":{"$ref":"#/definitions/schemaArray"},"oneOf":{"$ref":"#/definitions/schemaArray"},"not":{"$ref":"#"}},"default":true}');

/***/ }),

/***/ 31229:
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('[[[0,44],"disallowed_STD3_valid"],[[45,46],"valid"],[[47,47],"disallowed_STD3_valid"],[[48,57],"valid"],[[58,64],"disallowed_STD3_valid"],[[65,65],"mapped",[97]],[[66,66],"mapped",[98]],[[67,67],"mapped",[99]],[[68,68],"mapped",[100]],[[69,69],"mapped",[101]],[[70,70],"mapped",[102]],[[71,71],"mapped",[103]],[[72,72],"mapped",[104]],[[73,73],"mapped",[105]],[[74,74],"mapped",[106]],[[75,75],"mapped",[107]],[[76,76],"mapped",[108]],[[77,77],"mapped",[109]],[[78,78],"mapped",[110]],[[79,79],"mapped",[111]],[[80,80],"mapped",[112]],[[81,81],"mapped",[113]],[[82,82],"mapped",[114]],[[83,83],"mapped",[115]],[[84,84],"mapped",[116]],[[85,85],"mapped",[117]],[[86,86],"mapped",[118]],[[87,87],"mapped",[119]],[[88,88],"mapped",[120]],[[89,89],"mapped",[121]],[[90,90],"mapped",[122]],[[91,96],"disallowed_STD3_valid"],[[97,122],"valid"],[[123,127],"disallowed_STD3_valid"],[[128,159],"disallowed"],[[160,160],"disallowed_STD3_mapped",[32]],[[161,167],"valid",[],"NV8"],[[168,168],"disallowed_STD3_mapped",[32,776]],[[169,169],"valid",[],"NV8"],[[170,170],"mapped",[97]],[[171,172],"valid",[],"NV8"],[[173,173],"ignored"],[[174,174],"valid",[],"NV8"],[[175,175],"disallowed_STD3_mapped",[32,772]],[[176,177],"valid",[],"NV8"],[[178,178],"mapped",[50]],[[179,179],"mapped",[51]],[[180,180],"disallowed_STD3_mapped",[32,769]],[[181,181],"mapped",[956]],[[182,182],"valid",[],"NV8"],[[183,183],"valid"],[[184,184],"disallowed_STD3_mapped",[32,807]],[[185,185],"mapped",[49]],[[186,186],"mapped",[111]],[[187,187],"valid",[],"NV8"],[[188,188],"mapped",[49,8260,52]],[[189,189],"mapped",[49,8260,50]],[[190,190],"mapped",[51,8260,52]],[[191,191],"valid",[],"NV8"],[[192,192],"mapped",[224]],[[193,193],"mapped",[225]],[[194,194],"mapped",[226]],[[195,195],"mapped",[227]],[[196,196],"mapped",[228]],[[197,197],"mapped",[229]],[[198,198],"mapped",[230]],[[199,199],"mapped",[231]],[[200,200],"mapped",[232]],[[201,201],"mapped",[233]],[[202,202],"mapped",[234]],[[203,203],"mapped",[235]],[[204,204],"mapped",[236]],[[205,205],"mapped",[237]],[[206,206],"mapped",[238]],[[207,207],"mapped",[239]],[[208,208],"mapped",[240]],[[209,209],"mapped",[241]],[[210,210],"mapped",[242]],[[211,211],"mapped",[243]],[[212,212],"mapped",[244]],[[213,213],"mapped",[245]],[[214,214],"mapped",[246]],[[215,215],"valid",[],"NV8"],[[216,216],"mapped",[248]],[[217,217],"mapped",[249]],[[218,218],"mapped",[250]],[[219,219],"mapped",[251]],[[220,220],"mapped",[252]],[[221,221],"mapped",[253]],[[222,222],"mapped",[254]],[[223,223],"deviation",[115,115]],[[224,246],"valid"],[[247,247],"valid",[],"NV8"],[[248,255],"valid"],[[256,256],"mapped",[257]],[[257,257],"valid"],[[258,258],"mapped",[259]],[[259,259],"valid"],[[260,260],"mapped",[261]],[[261,261],"valid"],[[262,262],"mapped",[263]],[[263,263],"valid"],[[264,264],"mapped",[265]],[[265,265],"valid"],[[266,266],"mapped",[267]],[[267,267],"valid"],[[268,268],"mapped",[269]],[[269,269],"valid"],[[270,270],"mapped",[271]],[[271,271],"valid"],[[272,272],"mapped",[273]],[[273,273],"valid"],[[274,274],"mapped",[275]],[[275,275],"valid"],[[276,276],"mapped",[277]],[[277,277],"valid"],[[278,278],"mapped",[279]],[[279,279],"valid"],[[280,280],"mapped",[281]],[[281,281],"valid"],[[282,282],"mapped",[283]],[[283,283],"valid"],[[284,284],"mapped",[285]],[[285,285],"valid"],[[286,286],"mapped",[287]],[[287,287],"valid"],[[288,288],"mapped",[289]],[[289,289],"valid"],[[290,290],"mapped",[291]],[[291,291],"valid"],[[292,292],"mapped",[293]],[[293,293],"valid"],[[294,294],"mapped",[295]],[[295,295],"valid"],[[296,296],"mapped",[297]],[[297,297],"valid"],[[298,298],"mapped",[299]],[[299,299],"valid"],[[300,300],"mapped",[301]],[[301,301],"valid"],[[302,302],"mapped",[303]],[[303,303],"valid"],[[304,304],"mapped",[105,775]],[[305,305],"valid"],[[306,307],"mapped",[105,106]],[[308,308],"mapped",[309]],[[309,309],"valid"],[[310,310],"mapped",[311]],[[311,312],"valid"],[[313,313],"mapped",[314]],[[314,314],"valid"],[[315,315],"mapped",[316]],[[316,316],"valid"],[[317,317],"mapped",[318]],[[318,318],"valid"],[[319,320],"mapped",[108,183]],[[321,321],"mapped",[322]],[[322,322],"valid"],[[323,323],"mapped",[324]],[[324,324],"valid"],[[325,325],"mapped",[326]],[[326,326],"valid"],[[327,327],"mapped",[328]],[[328,328],"valid"],[[329,329],"mapped",[700,110]],[[330,330],"mapped",[331]],[[331,331],"valid"],[[332,332],"mapped",[333]],[[333,333],"valid"],[[334,334],"mapped",[335]],[[335,335],"valid"],[[336,336],"mapped",[337]],[[337,337],"valid"],[[338,338],"mapped",[339]],[[339,339],"valid"],[[340,340],"mapped",[341]],[[341,341],"valid"],[[342,342],"mapped",[343]],[[343,343],"valid"],[[344,344],"mapped",[345]],[[345,345],"valid"],[[346,346],"mapped",[347]],[[347,347],"valid"],[[348,348],"mapped",[349]],[[349,349],"valid"],[[350,350],"mapped",[351]],[[351,351],"valid"],[[352,352],"mapped",[353]],[[353,353],"valid"],[[354,354],"mapped",[355]],[[355,355],"valid"],[[356,356],"mapped",[357]],[[357,357],"valid"],[[358,358],"mapped",[359]],[[359,359],"valid"],[[360,360],"mapped",[361]],[[361,361],"valid"],[[362,362],"mapped",[363]],[[363,363],"valid"],[[364,364],"mapped",[365]],[[365,365],"valid"],[[366,366],"mapped",[367]],[[367,367],"valid"],[[368,368],"mapped",[369]],[[369,369],"valid"],[[370,370],"mapped",[371]],[[371,371],"valid"],[[372,372],"mapped",[373]],[[373,373],"valid"],[[374,374],"mapped",[375]],[[375,375],"valid"],[[376,376],"mapped",[255]],[[377,377],"mapped",[378]],[[378,378],"valid"],[[379,379],"mapped",[380]],[[380,380],"valid"],[[381,381],"mapped",[382]],[[382,382],"valid"],[[383,383],"mapped",[115]],[[384,384],"valid"],[[385,385],"mapped",[595]],[[386,386],"mapped",[387]],[[387,387],"valid"],[[388,388],"mapped",[389]],[[389,389],"valid"],[[390,390],"mapped",[596]],[[391,391],"mapped",[392]],[[392,392],"valid"],[[393,393],"mapped",[598]],[[394,394],"mapped",[599]],[[395,395],"mapped",[396]],[[396,397],"valid"],[[398,398],"mapped",[477]],[[399,399],"mapped",[601]],[[400,400],"mapped",[603]],[[401,401],"mapped",[402]],[[402,402],"valid"],[[403,403],"mapped",[608]],[[404,404],"mapped",[611]],[[405,405],"valid"],[[406,406],"mapped",[617]],[[407,407],"mapped",[616]],[[408,408],"mapped",[409]],[[409,411],"valid"],[[412,412],"mapped",[623]],[[413,413],"mapped",[626]],[[414,414],"valid"],[[415,415],"mapped",[629]],[[416,416],"mapped",[417]],[[417,417],"valid"],[[418,418],"mapped",[419]],[[419,419],"valid"],[[420,420],"mapped",[421]],[[421,421],"valid"],[[422,422],"mapped",[640]],[[423,423],"mapped",[424]],[[424,424],"valid"],[[425,425],"mapped",[643]],[[426,427],"valid"],[[428,428],"mapped",[429]],[[429,429],"valid"],[[430,430],"mapped",[648]],[[431,431],"mapped",[432]],[[432,432],"valid"],[[433,433],"mapped",[650]],[[434,434],"mapped",[651]],[[435,435],"mapped",[436]],[[436,436],"valid"],[[437,437],"mapped",[438]],[[438,438],"valid"],[[439,439],"mapped",[658]],[[440,440],"mapped",[441]],[[441,443],"valid"],[[444,444],"mapped",[445]],[[445,451],"valid"],[[452,454],"mapped",[100,382]],[[455,457],"mapped",[108,106]],[[458,460],"mapped",[110,106]],[[461,461],"mapped",[462]],[[462,462],"valid"],[[463,463],"mapped",[464]],[[464,464],"valid"],[[465,465],"mapped",[466]],[[466,466],"valid"],[[467,467],"mapped",[468]],[[468,468],"valid"],[[469,469],"mapped",[470]],[[470,470],"valid"],[[471,471],"mapped",[472]],[[472,472],"valid"],[[473,473],"mapped",[474]],[[474,474],"valid"],[[475,475],"mapped",[476]],[[476,477],"valid"],[[478,478],"mapped",[479]],[[479,479],"valid"],[[480,480],"mapped",[481]],[[481,481],"valid"],[[482,482],"mapped",[483]],[[483,483],"valid"],[[484,484],"mapped",[485]],[[485,485],"valid"],[[486,486],"mapped",[487]],[[487,487],"valid"],[[488,488],"mapped",[489]],[[489,489],"valid"],[[490,490],"mapped",[491]],[[491,491],"valid"],[[492,492],"mapped",[493]],[[493,493],"valid"],[[494,494],"mapped",[495]],[[495,496],"valid"],[[497,499],"mapped",[100,122]],[[500,500],"mapped",[501]],[[501,501],"valid"],[[502,502],"mapped",[405]],[[503,503],"mapped",[447]],[[504,504],"mapped",[505]],[[505,505],"valid"],[[506,506],"mapped",[507]],[[507,507],"valid"],[[508,508],"mapped",[509]],[[509,509],"valid"],[[510,510],"mapped",[511]],[[511,511],"valid"],[[512,512],"mapped",[513]],[[513,513],"valid"],[[514,514],"mapped",[515]],[[515,515],"valid"],[[516,516],"mapped",[517]],[[517,517],"valid"],[[518,518],"mapped",[519]],[[519,519],"valid"],[[520,520],"mapped",[521]],[[521,521],"valid"],[[522,522],"mapped",[523]],[[523,523],"valid"],[[524,524],"mapped",[525]],[[525,525],"valid"],[[526,526],"mapped",[527]],[[527,527],"valid"],[[528,528],"mapped",[529]],[[529,529],"valid"],[[530,530],"mapped",[531]],[[531,531],"valid"],[[532,532],"mapped",[533]],[[533,533],"valid"],[[534,534],"mapped",[535]],[[535,535],"valid"],[[536,536],"mapped",[537]],[[537,537],"valid"],[[538,538],"mapped",[539]],[[539,539],"valid"],[[540,540],"mapped",[541]],[[541,541],"valid"],[[542,542],"mapped",[543]],[[543,543],"valid"],[[544,544],"mapped",[414]],[[545,545],"valid"],[[546,546],"mapped",[547]],[[547,547],"valid"],[[548,548],"mapped",[549]],[[549,549],"valid"],[[550,550],"mapped",[551]],[[551,551],"valid"],[[552,552],"mapped",[553]],[[553,553],"valid"],[[554,554],"mapped",[555]],[[555,555],"valid"],[[556,556],"mapped",[557]],[[557,557],"valid"],[[558,558],"mapped",[559]],[[559,559],"valid"],[[560,560],"mapped",[561]],[[561,561],"valid"],[[562,562],"mapped",[563]],[[563,563],"valid"],[[564,566],"valid"],[[567,569],"valid"],[[570,570],"mapped",[11365]],[[571,571],"mapped",[572]],[[572,572],"valid"],[[573,573],"mapped",[410]],[[574,574],"mapped",[11366]],[[575,576],"valid"],[[577,577],"mapped",[578]],[[578,578],"valid"],[[579,579],"mapped",[384]],[[580,580],"mapped",[649]],[[581,581],"mapped",[652]],[[582,582],"mapped",[583]],[[583,583],"valid"],[[584,584],"mapped",[585]],[[585,585],"valid"],[[586,586],"mapped",[587]],[[587,587],"valid"],[[588,588],"mapped",[589]],[[589,589],"valid"],[[590,590],"mapped",[591]],[[591,591],"valid"],[[592,680],"valid"],[[681,685],"valid"],[[686,687],"valid"],[[688,688],"mapped",[104]],[[689,689],"mapped",[614]],[[690,690],"mapped",[106]],[[691,691],"mapped",[114]],[[692,692],"mapped",[633]],[[693,693],"mapped",[635]],[[694,694],"mapped",[641]],[[695,695],"mapped",[119]],[[696,696],"mapped",[121]],[[697,705],"valid"],[[706,709],"valid",[],"NV8"],[[710,721],"valid"],[[722,727],"valid",[],"NV8"],[[728,728],"disallowed_STD3_mapped",[32,774]],[[729,729],"disallowed_STD3_mapped",[32,775]],[[730,730],"disallowed_STD3_mapped",[32,778]],[[731,731],"disallowed_STD3_mapped",[32,808]],[[732,732],"disallowed_STD3_mapped",[32,771]],[[733,733],"disallowed_STD3_mapped",[32,779]],[[734,734],"valid",[],"NV8"],[[735,735],"valid",[],"NV8"],[[736,736],"mapped",[611]],[[737,737],"mapped",[108]],[[738,738],"mapped",[115]],[[739,739],"mapped",[120]],[[740,740],"mapped",[661]],[[741,745],"valid",[],"NV8"],[[746,747],"valid",[],"NV8"],[[748,748],"valid"],[[749,749],"valid",[],"NV8"],[[750,750],"valid"],[[751,767],"valid",[],"NV8"],[[768,831],"valid"],[[832,832],"mapped",[768]],[[833,833],"mapped",[769]],[[834,834],"valid"],[[835,835],"mapped",[787]],[[836,836],"mapped",[776,769]],[[837,837],"mapped",[953]],[[838,846],"valid"],[[847,847],"ignored"],[[848,855],"valid"],[[856,860],"valid"],[[861,863],"valid"],[[864,865],"valid"],[[866,866],"valid"],[[867,879],"valid"],[[880,880],"mapped",[881]],[[881,881],"valid"],[[882,882],"mapped",[883]],[[883,883],"valid"],[[884,884],"mapped",[697]],[[885,885],"valid"],[[886,886],"mapped",[887]],[[887,887],"valid"],[[888,889],"disallowed"],[[890,890],"disallowed_STD3_mapped",[32,953]],[[891,893],"valid"],[[894,894],"disallowed_STD3_mapped",[59]],[[895,895],"mapped",[1011]],[[896,899],"disallowed"],[[900,900],"disallowed_STD3_mapped",[32,769]],[[901,901],"disallowed_STD3_mapped",[32,776,769]],[[902,902],"mapped",[940]],[[903,903],"mapped",[183]],[[904,904],"mapped",[941]],[[905,905],"mapped",[942]],[[906,906],"mapped",[943]],[[907,907],"disallowed"],[[908,908],"mapped",[972]],[[909,909],"disallowed"],[[910,910],"mapped",[973]],[[911,911],"mapped",[974]],[[912,912],"valid"],[[913,913],"mapped",[945]],[[914,914],"mapped",[946]],[[915,915],"mapped",[947]],[[916,916],"mapped",[948]],[[917,917],"mapped",[949]],[[918,918],"mapped",[950]],[[919,919],"mapped",[951]],[[920,920],"mapped",[952]],[[921,921],"mapped",[953]],[[922,922],"mapped",[954]],[[923,923],"mapped",[955]],[[924,924],"mapped",[956]],[[925,925],"mapped",[957]],[[926,926],"mapped",[958]],[[927,927],"mapped",[959]],[[928,928],"mapped",[960]],[[929,929],"mapped",[961]],[[930,930],"disallowed"],[[931,931],"mapped",[963]],[[932,932],"mapped",[964]],[[933,933],"mapped",[965]],[[934,934],"mapped",[966]],[[935,935],"mapped",[967]],[[936,936],"mapped",[968]],[[937,937],"mapped",[969]],[[938,938],"mapped",[970]],[[939,939],"mapped",[971]],[[940,961],"valid"],[[962,962],"deviation",[963]],[[963,974],"valid"],[[975,975],"mapped",[983]],[[976,976],"mapped",[946]],[[977,977],"mapped",[952]],[[978,978],"mapped",[965]],[[979,979],"mapped",[973]],[[980,980],"mapped",[971]],[[981,981],"mapped",[966]],[[982,982],"mapped",[960]],[[983,983],"valid"],[[984,984],"mapped",[985]],[[985,985],"valid"],[[986,986],"mapped",[987]],[[987,987],"valid"],[[988,988],"mapped",[989]],[[989,989],"valid"],[[990,990],"mapped",[991]],[[991,991],"valid"],[[992,992],"mapped",[993]],[[993,993],"valid"],[[994,994],"mapped",[995]],[[995,995],"valid"],[[996,996],"mapped",[997]],[[997,997],"valid"],[[998,998],"mapped",[999]],[[999,999],"valid"],[[1000,1000],"mapped",[1001]],[[1001,1001],"valid"],[[1002,1002],"mapped",[1003]],[[1003,1003],"valid"],[[1004,1004],"mapped",[1005]],[[1005,1005],"valid"],[[1006,1006],"mapped",[1007]],[[1007,1007],"valid"],[[1008,1008],"mapped",[954]],[[1009,1009],"mapped",[961]],[[1010,1010],"mapped",[963]],[[1011,1011],"valid"],[[1012,1012],"mapped",[952]],[[1013,1013],"mapped",[949]],[[1014,1014],"valid",[],"NV8"],[[1015,1015],"mapped",[1016]],[[1016,1016],"valid"],[[1017,1017],"mapped",[963]],[[1018,1018],"mapped",[1019]],[[1019,1019],"valid"],[[1020,1020],"valid"],[[1021,1021],"mapped",[891]],[[1022,1022],"mapped",[892]],[[1023,1023],"mapped",[893]],[[1024,1024],"mapped",[1104]],[[1025,1025],"mapped",[1105]],[[1026,1026],"mapped",[1106]],[[1027,1027],"mapped",[1107]],[[1028,1028],"mapped",[1108]],[[1029,1029],"mapped",[1109]],[[1030,1030],"mapped",[1110]],[[1031,1031],"mapped",[1111]],[[1032,1032],"mapped",[1112]],[[1033,1033],"mapped",[1113]],[[1034,1034],"mapped",[1114]],[[1035,1035],"mapped",[1115]],[[1036,1036],"mapped",[1116]],[[1037,1037],"mapped",[1117]],[[1038,1038],"mapped",[1118]],[[1039,1039],"mapped",[1119]],[[1040,1040],"mapped",[1072]],[[1041,1041],"mapped",[1073]],[[1042,1042],"mapped",[1074]],[[1043,1043],"mapped",[1075]],[[1044,1044],"mapped",[1076]],[[1045,1045],"mapped",[1077]],[[1046,1046],"mapped",[1078]],[[1047,1047],"mapped",[1079]],[[1048,1048],"mapped",[1080]],[[1049,1049],"mapped",[1081]],[[1050,1050],"mapped",[1082]],[[1051,1051],"mapped",[1083]],[[1052,1052],"mapped",[1084]],[[1053,1053],"mapped",[1085]],[[1054,1054],"mapped",[1086]],[[1055,1055],"mapped",[1087]],[[1056,1056],"mapped",[1088]],[[1057,1057],"mapped",[1089]],[[1058,1058],"mapped",[1090]],[[1059,1059],"mapped",[1091]],[[1060,1060],"mapped",[1092]],[[1061,1061],"mapped",[1093]],[[1062,1062],"mapped",[1094]],[[1063,1063],"mapped",[1095]],[[1064,1064],"mapped",[1096]],[[1065,1065],"mapped",[1097]],[[1066,1066],"mapped",[1098]],[[1067,1067],"mapped",[1099]],[[1068,1068],"mapped",[1100]],[[1069,1069],"mapped",[1101]],[[1070,1070],"mapped",[1102]],[[1071,1071],"mapped",[1103]],[[1072,1103],"valid"],[[1104,1104],"valid"],[[1105,1116],"valid"],[[1117,1117],"valid"],[[1118,1119],"valid"],[[1120,1120],"mapped",[1121]],[[1121,1121],"valid"],[[1122,1122],"mapped",[1123]],[[1123,1123],"valid"],[[1124,1124],"mapped",[1125]],[[1125,1125],"valid"],[[1126,1126],"mapped",[1127]],[[1127,1127],"valid"],[[1128,1128],"mapped",[1129]],[[1129,1129],"valid"],[[1130,1130],"mapped",[1131]],[[1131,1131],"valid"],[[1132,1132],"mapped",[1133]],[[1133,1133],"valid"],[[1134,1134],"mapped",[1135]],[[1135,1135],"valid"],[[1136,1136],"mapped",[1137]],[[1137,1137],"valid"],[[1138,1138],"mapped",[1139]],[[1139,1139],"valid"],[[1140,1140],"mapped",[1141]],[[1141,1141],"valid"],[[1142,1142],"mapped",[1143]],[[1143,1143],"valid"],[[1144,1144],"mapped",[1145]],[[1145,1145],"valid"],[[1146,1146],"mapped",[1147]],[[1147,1147],"valid"],[[1148,1148],"mapped",[1149]],[[1149,1149],"valid"],[[1150,1150],"mapped",[1151]],[[1151,1151],"valid"],[[1152,1152],"mapped",[1153]],[[1153,1153],"valid"],[[1154,1154],"valid",[],"NV8"],[[1155,1158],"valid"],[[1159,1159],"valid"],[[1160,1161],"valid",[],"NV8"],[[1162,1162],"mapped",[1163]],[[1163,1163],"valid"],[[1164,1164],"mapped",[1165]],[[1165,1165],"valid"],[[1166,1166],"mapped",[1167]],[[1167,1167],"valid"],[[1168,1168],"mapped",[1169]],[[1169,1169],"valid"],[[1170,1170],"mapped",[1171]],[[1171,1171],"valid"],[[1172,1172],"mapped",[1173]],[[1173,1173],"valid"],[[1174,1174],"mapped",[1175]],[[1175,1175],"valid"],[[1176,1176],"mapped",[1177]],[[1177,1177],"valid"],[[1178,1178],"mapped",[1179]],[[1179,1179],"valid"],[[1180,1180],"mapped",[1181]],[[1181,1181],"valid"],[[1182,1182],"mapped",[1183]],[[1183,1183],"valid"],[[1184,1184],"mapped",[1185]],[[1185,1185],"valid"],[[1186,1186],"mapped",[1187]],[[1187,1187],"valid"],[[1188,1188],"mapped",[1189]],[[1189,1189],"valid"],[[1190,1190],"mapped",[1191]],[[1191,1191],"valid"],[[1192,1192],"mapped",[1193]],[[1193,1193],"valid"],[[1194,1194],"mapped",[1195]],[[1195,1195],"valid"],[[1196,1196],"mapped",[1197]],[[1197,1197],"valid"],[[1198,1198],"mapped",[1199]],[[1199,1199],"valid"],[[1200,1200],"mapped",[1201]],[[1201,1201],"valid"],[[1202,1202],"mapped",[1203]],[[1203,1203],"valid"],[[1204,1204],"mapped",[1205]],[[1205,1205],"valid"],[[1206,1206],"mapped",[1207]],[[1207,1207],"valid"],[[1208,1208],"mapped",[1209]],[[1209,1209],"valid"],[[1210,1210],"mapped",[1211]],[[1211,1211],"valid"],[[1212,1212],"mapped",[1213]],[[1213,1213],"valid"],[[1214,1214],"mapped",[1215]],[[1215,1215],"valid"],[[1216,1216],"disallowed"],[[1217,1217],"mapped",[1218]],[[1218,1218],"valid"],[[1219,1219],"mapped",[1220]],[[1220,1220],"valid"],[[1221,1221],"mapped",[1222]],[[1222,1222],"valid"],[[1223,1223],"mapped",[1224]],[[1224,1224],"valid"],[[1225,1225],"mapped",[1226]],[[1226,1226],"valid"],[[1227,1227],"mapped",[1228]],[[1228,1228],"valid"],[[1229,1229],"mapped",[1230]],[[1230,1230],"valid"],[[1231,1231],"valid"],[[1232,1232],"mapped",[1233]],[[1233,1233],"valid"],[[1234,1234],"mapped",[1235]],[[1235,1235],"valid"],[[1236,1236],"mapped",[1237]],[[1237,1237],"valid"],[[1238,1238],"mapped",[1239]],[[1239,1239],"valid"],[[1240,1240],"mapped",[1241]],[[1241,1241],"valid"],[[1242,1242],"mapped",[1243]],[[1243,1243],"valid"],[[1244,1244],"mapped",[1245]],[[1245,1245],"valid"],[[1246,1246],"mapped",[1247]],[[1247,1247],"valid"],[[1248,1248],"mapped",[1249]],[[1249,1249],"valid"],[[1250,1250],"mapped",[1251]],[[1251,1251],"valid"],[[1252,1252],"mapped",[1253]],[[1253,1253],"valid"],[[1254,1254],"mapped",[1255]],[[1255,1255],"valid"],[[1256,1256],"mapped",[1257]],[[1257,1257],"valid"],[[1258,1258],"mapped",[1259]],[[1259,1259],"valid"],[[1260,1260],"mapped",[1261]],[[1261,1261],"valid"],[[1262,1262],"mapped",[1263]],[[1263,1263],"valid"],[[1264,1264],"mapped",[1265]],[[1265,1265],"valid"],[[1266,1266],"mapped",[1267]],[[1267,1267],"valid"],[[1268,1268],"mapped",[1269]],[[1269,1269],"valid"],[[1270,1270],"mapped",[1271]],[[1271,1271],"valid"],[[1272,1272],"mapped",[1273]],[[1273,1273],"valid"],[[1274,1274],"mapped",[1275]],[[1275,1275],"valid"],[[1276,1276],"mapped",[1277]],[[1277,1277],"valid"],[[1278,1278],"mapped",[1279]],[[1279,1279],"valid"],[[1280,1280],"mapped",[1281]],[[1281,1281],"valid"],[[1282,1282],"mapped",[1283]],[[1283,1283],"valid"],[[1284,1284],"mapped",[1285]],[[1285,1285],"valid"],[[1286,1286],"mapped",[1287]],[[1287,1287],"valid"],[[1288,1288],"mapped",[1289]],[[1289,1289],"valid"],[[1290,1290],"mapped",[1291]],[[1291,1291],"valid"],[[1292,1292],"mapped",[1293]],[[1293,1293],"valid"],[[1294,1294],"mapped",[1295]],[[1295,1295],"valid"],[[1296,1296],"mapped",[1297]],[[1297,1297],"valid"],[[1298,1298],"mapped",[1299]],[[1299,1299],"valid"],[[1300,1300],"mapped",[1301]],[[1301,1301],"valid"],[[1302,1302],"mapped",[1303]],[[1303,1303],"valid"],[[1304,1304],"mapped",[1305]],[[1305,1305],"valid"],[[1306,1306],"mapped",[1307]],[[1307,1307],"valid"],[[1308,1308],"mapped",[1309]],[[1309,1309],"valid"],[[1310,1310],"mapped",[1311]],[[1311,1311],"valid"],[[1312,1312],"mapped",[1313]],[[1313,1313],"valid"],[[1314,1314],"mapped",[1315]],[[1315,1315],"valid"],[[1316,1316],"mapped",[1317]],[[1317,1317],"valid"],[[1318,1318],"mapped",[1319]],[[1319,1319],"valid"],[[1320,1320],"mapped",[1321]],[[1321,1321],"valid"],[[1322,1322],"mapped",[1323]],[[1323,1323],"valid"],[[1324,1324],"mapped",[1325]],[[1325,1325],"valid"],[[1326,1326],"mapped",[1327]],[[1327,1327],"valid"],[[1328,1328],"disallowed"],[[1329,1329],"mapped",[1377]],[[1330,1330],"mapped",[1378]],[[1331,1331],"mapped",[1379]],[[1332,1332],"mapped",[1380]],[[1333,1333],"mapped",[1381]],[[1334,1334],"mapped",[1382]],[[1335,1335],"mapped",[1383]],[[1336,1336],"mapped",[1384]],[[1337,1337],"mapped",[1385]],[[1338,1338],"mapped",[1386]],[[1339,1339],"mapped",[1387]],[[1340,1340],"mapped",[1388]],[[1341,1341],"mapped",[1389]],[[1342,1342],"mapped",[1390]],[[1343,1343],"mapped",[1391]],[[1344,1344],"mapped",[1392]],[[1345,1345],"mapped",[1393]],[[1346,1346],"mapped",[1394]],[[1347,1347],"mapped",[1395]],[[1348,1348],"mapped",[1396]],[[1349,1349],"mapped",[1397]],[[1350,1350],"mapped",[1398]],[[1351,1351],"mapped",[1399]],[[1352,1352],"mapped",[1400]],[[1353,1353],"mapped",[1401]],[[1354,1354],"mapped",[1402]],[[1355,1355],"mapped",[1403]],[[1356,1356],"mapped",[1404]],[[1357,1357],"mapped",[1405]],[[1358,1358],"mapped",[1406]],[[1359,1359],"mapped",[1407]],[[1360,1360],"mapped",[1408]],[[1361,1361],"mapped",[1409]],[[1362,1362],"mapped",[1410]],[[1363,1363],"mapped",[1411]],[[1364,1364],"mapped",[1412]],[[1365,1365],"mapped",[1413]],[[1366,1366],"mapped",[1414]],[[1367,1368],"disallowed"],[[1369,1369],"valid"],[[1370,1375],"valid",[],"NV8"],[[1376,1376],"disallowed"],[[1377,1414],"valid"],[[1415,1415],"mapped",[1381,1410]],[[1416,1416],"disallowed"],[[1417,1417],"valid",[],"NV8"],[[1418,1418],"valid",[],"NV8"],[[1419,1420],"disallowed"],[[1421,1422],"valid",[],"NV8"],[[1423,1423],"valid",[],"NV8"],[[1424,1424],"disallowed"],[[1425,1441],"valid"],[[1442,1442],"valid"],[[1443,1455],"valid"],[[1456,1465],"valid"],[[1466,1466],"valid"],[[1467,1469],"valid"],[[1470,1470],"valid",[],"NV8"],[[1471,1471],"valid"],[[1472,1472],"valid",[],"NV8"],[[1473,1474],"valid"],[[1475,1475],"valid",[],"NV8"],[[1476,1476],"valid"],[[1477,1477],"valid"],[[1478,1478],"valid",[],"NV8"],[[1479,1479],"valid"],[[1480,1487],"disallowed"],[[1488,1514],"valid"],[[1515,1519],"disallowed"],[[1520,1524],"valid"],[[1525,1535],"disallowed"],[[1536,1539],"disallowed"],[[1540,1540],"disallowed"],[[1541,1541],"disallowed"],[[1542,1546],"valid",[],"NV8"],[[1547,1547],"valid",[],"NV8"],[[1548,1548],"valid",[],"NV8"],[[1549,1551],"valid",[],"NV8"],[[1552,1557],"valid"],[[1558,1562],"valid"],[[1563,1563],"valid",[],"NV8"],[[1564,1564],"disallowed"],[[1565,1565],"disallowed"],[[1566,1566],"valid",[],"NV8"],[[1567,1567],"valid",[],"NV8"],[[1568,1568],"valid"],[[1569,1594],"valid"],[[1595,1599],"valid"],[[1600,1600],"valid",[],"NV8"],[[1601,1618],"valid"],[[1619,1621],"valid"],[[1622,1624],"valid"],[[1625,1630],"valid"],[[1631,1631],"valid"],[[1632,1641],"valid"],[[1642,1645],"valid",[],"NV8"],[[1646,1647],"valid"],[[1648,1652],"valid"],[[1653,1653],"mapped",[1575,1652]],[[1654,1654],"mapped",[1608,1652]],[[1655,1655],"mapped",[1735,1652]],[[1656,1656],"mapped",[1610,1652]],[[1657,1719],"valid"],[[1720,1721],"valid"],[[1722,1726],"valid"],[[1727,1727],"valid"],[[1728,1742],"valid"],[[1743,1743],"valid"],[[1744,1747],"valid"],[[1748,1748],"valid",[],"NV8"],[[1749,1756],"valid"],[[1757,1757],"disallowed"],[[1758,1758],"valid",[],"NV8"],[[1759,1768],"valid"],[[1769,1769],"valid",[],"NV8"],[[1770,1773],"valid"],[[1774,1775],"valid"],[[1776,1785],"valid"],[[1786,1790],"valid"],[[1791,1791],"valid"],[[1792,1805],"valid",[],"NV8"],[[1806,1806],"disallowed"],[[1807,1807],"disallowed"],[[1808,1836],"valid"],[[1837,1839],"valid"],[[1840,1866],"valid"],[[1867,1868],"disallowed"],[[1869,1871],"valid"],[[1872,1901],"valid"],[[1902,1919],"valid"],[[1920,1968],"valid"],[[1969,1969],"valid"],[[1970,1983],"disallowed"],[[1984,2037],"valid"],[[2038,2042],"valid",[],"NV8"],[[2043,2047],"disallowed"],[[2048,2093],"valid"],[[2094,2095],"disallowed"],[[2096,2110],"valid",[],"NV8"],[[2111,2111],"disallowed"],[[2112,2139],"valid"],[[2140,2141],"disallowed"],[[2142,2142],"valid",[],"NV8"],[[2143,2207],"disallowed"],[[2208,2208],"valid"],[[2209,2209],"valid"],[[2210,2220],"valid"],[[2221,2226],"valid"],[[2227,2228],"valid"],[[2229,2274],"disallowed"],[[2275,2275],"valid"],[[2276,2302],"valid"],[[2303,2303],"valid"],[[2304,2304],"valid"],[[2305,2307],"valid"],[[2308,2308],"valid"],[[2309,2361],"valid"],[[2362,2363],"valid"],[[2364,2381],"valid"],[[2382,2382],"valid"],[[2383,2383],"valid"],[[2384,2388],"valid"],[[2389,2389],"valid"],[[2390,2391],"valid"],[[2392,2392],"mapped",[2325,2364]],[[2393,2393],"mapped",[2326,2364]],[[2394,2394],"mapped",[2327,2364]],[[2395,2395],"mapped",[2332,2364]],[[2396,2396],"mapped",[2337,2364]],[[2397,2397],"mapped",[2338,2364]],[[2398,2398],"mapped",[2347,2364]],[[2399,2399],"mapped",[2351,2364]],[[2400,2403],"valid"],[[2404,2405],"valid",[],"NV8"],[[2406,2415],"valid"],[[2416,2416],"valid",[],"NV8"],[[2417,2418],"valid"],[[2419,2423],"valid"],[[2424,2424],"valid"],[[2425,2426],"valid"],[[2427,2428],"valid"],[[2429,2429],"valid"],[[2430,2431],"valid"],[[2432,2432],"valid"],[[2433,2435],"valid"],[[2436,2436],"disallowed"],[[2437,2444],"valid"],[[2445,2446],"disallowed"],[[2447,2448],"valid"],[[2449,2450],"disallowed"],[[2451,2472],"valid"],[[2473,2473],"disallowed"],[[2474,2480],"valid"],[[2481,2481],"disallowed"],[[2482,2482],"valid"],[[2483,2485],"disallowed"],[[2486,2489],"valid"],[[2490,2491],"disallowed"],[[2492,2492],"valid"],[[2493,2493],"valid"],[[2494,2500],"valid"],[[2501,2502],"disallowed"],[[2503,2504],"valid"],[[2505,2506],"disallowed"],[[2507,2509],"valid"],[[2510,2510],"valid"],[[2511,2518],"disallowed"],[[2519,2519],"valid"],[[2520,2523],"disallowed"],[[2524,2524],"mapped",[2465,2492]],[[2525,2525],"mapped",[2466,2492]],[[2526,2526],"disallowed"],[[2527,2527],"mapped",[2479,2492]],[[2528,2531],"valid"],[[2532,2533],"disallowed"],[[2534,2545],"valid"],[[2546,2554],"valid",[],"NV8"],[[2555,2555],"valid",[],"NV8"],[[2556,2560],"disallowed"],[[2561,2561],"valid"],[[2562,2562],"valid"],[[2563,2563],"valid"],[[2564,2564],"disallowed"],[[2565,2570],"valid"],[[2571,2574],"disallowed"],[[2575,2576],"valid"],[[2577,2578],"disallowed"],[[2579,2600],"valid"],[[2601,2601],"disallowed"],[[2602,2608],"valid"],[[2609,2609],"disallowed"],[[2610,2610],"valid"],[[2611,2611],"mapped",[2610,2620]],[[2612,2612],"disallowed"],[[2613,2613],"valid"],[[2614,2614],"mapped",[2616,2620]],[[2615,2615],"disallowed"],[[2616,2617],"valid"],[[2618,2619],"disallowed"],[[2620,2620],"valid"],[[2621,2621],"disallowed"],[[2622,2626],"valid"],[[2627,2630],"disallowed"],[[2631,2632],"valid"],[[2633,2634],"disallowed"],[[2635,2637],"valid"],[[2638,2640],"disallowed"],[[2641,2641],"valid"],[[2642,2648],"disallowed"],[[2649,2649],"mapped",[2582,2620]],[[2650,2650],"mapped",[2583,2620]],[[2651,2651],"mapped",[2588,2620]],[[2652,2652],"valid"],[[2653,2653],"disallowed"],[[2654,2654],"mapped",[2603,2620]],[[2655,2661],"disallowed"],[[2662,2676],"valid"],[[2677,2677],"valid"],[[2678,2688],"disallowed"],[[2689,2691],"valid"],[[2692,2692],"disallowed"],[[2693,2699],"valid"],[[2700,2700],"valid"],[[2701,2701],"valid"],[[2702,2702],"disallowed"],[[2703,2705],"valid"],[[2706,2706],"disallowed"],[[2707,2728],"valid"],[[2729,2729],"disallowed"],[[2730,2736],"valid"],[[2737,2737],"disallowed"],[[2738,2739],"valid"],[[2740,2740],"disallowed"],[[2741,2745],"valid"],[[2746,2747],"disallowed"],[[2748,2757],"valid"],[[2758,2758],"disallowed"],[[2759,2761],"valid"],[[2762,2762],"disallowed"],[[2763,2765],"valid"],[[2766,2767],"disallowed"],[[2768,2768],"valid"],[[2769,2783],"disallowed"],[[2784,2784],"valid"],[[2785,2787],"valid"],[[2788,2789],"disallowed"],[[2790,2799],"valid"],[[2800,2800],"valid",[],"NV8"],[[2801,2801],"valid",[],"NV8"],[[2802,2808],"disallowed"],[[2809,2809],"valid"],[[2810,2816],"disallowed"],[[2817,2819],"valid"],[[2820,2820],"disallowed"],[[2821,2828],"valid"],[[2829,2830],"disallowed"],[[2831,2832],"valid"],[[2833,2834],"disallowed"],[[2835,2856],"valid"],[[2857,2857],"disallowed"],[[2858,2864],"valid"],[[2865,2865],"disallowed"],[[2866,2867],"valid"],[[2868,2868],"disallowed"],[[2869,2869],"valid"],[[2870,2873],"valid"],[[2874,2875],"disallowed"],[[2876,2883],"valid"],[[2884,2884],"valid"],[[2885,2886],"disallowed"],[[2887,2888],"valid"],[[2889,2890],"disallowed"],[[2891,2893],"valid"],[[2894,2901],"disallowed"],[[2902,2903],"valid"],[[2904,2907],"disallowed"],[[2908,2908],"mapped",[2849,2876]],[[2909,2909],"mapped",[2850,2876]],[[2910,2910],"disallowed"],[[2911,2913],"valid"],[[2914,2915],"valid"],[[2916,2917],"disallowed"],[[2918,2927],"valid"],[[2928,2928],"valid",[],"NV8"],[[2929,2929],"valid"],[[2930,2935],"valid",[],"NV8"],[[2936,2945],"disallowed"],[[2946,2947],"valid"],[[2948,2948],"disallowed"],[[2949,2954],"valid"],[[2955,2957],"disallowed"],[[2958,2960],"valid"],[[2961,2961],"disallowed"],[[2962,2965],"valid"],[[2966,2968],"disallowed"],[[2969,2970],"valid"],[[2971,2971],"disallowed"],[[2972,2972],"valid"],[[2973,2973],"disallowed"],[[2974,2975],"valid"],[[2976,2978],"disallowed"],[[2979,2980],"valid"],[[2981,2983],"disallowed"],[[2984,2986],"valid"],[[2987,2989],"disallowed"],[[2990,2997],"valid"],[[2998,2998],"valid"],[[2999,3001],"valid"],[[3002,3005],"disallowed"],[[3006,3010],"valid"],[[3011,3013],"disallowed"],[[3014,3016],"valid"],[[3017,3017],"disallowed"],[[3018,3021],"valid"],[[3022,3023],"disallowed"],[[3024,3024],"valid"],[[3025,3030],"disallowed"],[[3031,3031],"valid"],[[3032,3045],"disallowed"],[[3046,3046],"valid"],[[3047,3055],"valid"],[[3056,3058],"valid",[],"NV8"],[[3059,3066],"valid",[],"NV8"],[[3067,3071],"disallowed"],[[3072,3072],"valid"],[[3073,3075],"valid"],[[3076,3076],"disallowed"],[[3077,3084],"valid"],[[3085,3085],"disallowed"],[[3086,3088],"valid"],[[3089,3089],"disallowed"],[[3090,3112],"valid"],[[3113,3113],"disallowed"],[[3114,3123],"valid"],[[3124,3124],"valid"],[[3125,3129],"valid"],[[3130,3132],"disallowed"],[[3133,3133],"valid"],[[3134,3140],"valid"],[[3141,3141],"disallowed"],[[3142,3144],"valid"],[[3145,3145],"disallowed"],[[3146,3149],"valid"],[[3150,3156],"disallowed"],[[3157,3158],"valid"],[[3159,3159],"disallowed"],[[3160,3161],"valid"],[[3162,3162],"valid"],[[3163,3167],"disallowed"],[[3168,3169],"valid"],[[3170,3171],"valid"],[[3172,3173],"disallowed"],[[3174,3183],"valid"],[[3184,3191],"disallowed"],[[3192,3199],"valid",[],"NV8"],[[3200,3200],"disallowed"],[[3201,3201],"valid"],[[3202,3203],"valid"],[[3204,3204],"disallowed"],[[3205,3212],"valid"],[[3213,3213],"disallowed"],[[3214,3216],"valid"],[[3217,3217],"disallowed"],[[3218,3240],"valid"],[[3241,3241],"disallowed"],[[3242,3251],"valid"],[[3252,3252],"disallowed"],[[3253,3257],"valid"],[[3258,3259],"disallowed"],[[3260,3261],"valid"],[[3262,3268],"valid"],[[3269,3269],"disallowed"],[[3270,3272],"valid"],[[3273,3273],"disallowed"],[[3274,3277],"valid"],[[3278,3284],"disallowed"],[[3285,3286],"valid"],[[3287,3293],"disallowed"],[[3294,3294],"valid"],[[3295,3295],"disallowed"],[[3296,3297],"valid"],[[3298,3299],"valid"],[[3300,3301],"disallowed"],[[3302,3311],"valid"],[[3312,3312],"disallowed"],[[3313,3314],"valid"],[[3315,3328],"disallowed"],[[3329,3329],"valid"],[[3330,3331],"valid"],[[3332,3332],"disallowed"],[[3333,3340],"valid"],[[3341,3341],"disallowed"],[[3342,3344],"valid"],[[3345,3345],"disallowed"],[[3346,3368],"valid"],[[3369,3369],"valid"],[[3370,3385],"valid"],[[3386,3386],"valid"],[[3387,3388],"disallowed"],[[3389,3389],"valid"],[[3390,3395],"valid"],[[3396,3396],"valid"],[[3397,3397],"disallowed"],[[3398,3400],"valid"],[[3401,3401],"disallowed"],[[3402,3405],"valid"],[[3406,3406],"valid"],[[3407,3414],"disallowed"],[[3415,3415],"valid"],[[3416,3422],"disallowed"],[[3423,3423],"valid"],[[3424,3425],"valid"],[[3426,3427],"valid"],[[3428,3429],"disallowed"],[[3430,3439],"valid"],[[3440,3445],"valid",[],"NV8"],[[3446,3448],"disallowed"],[[3449,3449],"valid",[],"NV8"],[[3450,3455],"valid"],[[3456,3457],"disallowed"],[[3458,3459],"valid"],[[3460,3460],"disallowed"],[[3461,3478],"valid"],[[3479,3481],"disallowed"],[[3482,3505],"valid"],[[3506,3506],"disallowed"],[[3507,3515],"valid"],[[3516,3516],"disallowed"],[[3517,3517],"valid"],[[3518,3519],"disallowed"],[[3520,3526],"valid"],[[3527,3529],"disallowed"],[[3530,3530],"valid"],[[3531,3534],"disallowed"],[[3535,3540],"valid"],[[3541,3541],"disallowed"],[[3542,3542],"valid"],[[3543,3543],"disallowed"],[[3544,3551],"valid"],[[3552,3557],"disallowed"],[[3558,3567],"valid"],[[3568,3569],"disallowed"],[[3570,3571],"valid"],[[3572,3572],"valid",[],"NV8"],[[3573,3584],"disallowed"],[[3585,3634],"valid"],[[3635,3635],"mapped",[3661,3634]],[[3636,3642],"valid"],[[3643,3646],"disallowed"],[[3647,3647],"valid",[],"NV8"],[[3648,3662],"valid"],[[3663,3663],"valid",[],"NV8"],[[3664,3673],"valid"],[[3674,3675],"valid",[],"NV8"],[[3676,3712],"disallowed"],[[3713,3714],"valid"],[[3715,3715],"disallowed"],[[3716,3716],"valid"],[[3717,3718],"disallowed"],[[3719,3720],"valid"],[[3721,3721],"disallowed"],[[3722,3722],"valid"],[[3723,3724],"disallowed"],[[3725,3725],"valid"],[[3726,3731],"disallowed"],[[3732,3735],"valid"],[[3736,3736],"disallowed"],[[3737,3743],"valid"],[[3744,3744],"disallowed"],[[3745,3747],"valid"],[[3748,3748],"disallowed"],[[3749,3749],"valid"],[[3750,3750],"disallowed"],[[3751,3751],"valid"],[[3752,3753],"disallowed"],[[3754,3755],"valid"],[[3756,3756],"disallowed"],[[3757,3762],"valid"],[[3763,3763],"mapped",[3789,3762]],[[3764,3769],"valid"],[[3770,3770],"disallowed"],[[3771,3773],"valid"],[[3774,3775],"disallowed"],[[3776,3780],"valid"],[[3781,3781],"disallowed"],[[3782,3782],"valid"],[[3783,3783],"disallowed"],[[3784,3789],"valid"],[[3790,3791],"disallowed"],[[3792,3801],"valid"],[[3802,3803],"disallowed"],[[3804,3804],"mapped",[3755,3737]],[[3805,3805],"mapped",[3755,3745]],[[3806,3807],"valid"],[[3808,3839],"disallowed"],[[3840,3840],"valid"],[[3841,3850],"valid",[],"NV8"],[[3851,3851],"valid"],[[3852,3852],"mapped",[3851]],[[3853,3863],"valid",[],"NV8"],[[3864,3865],"valid"],[[3866,3871],"valid",[],"NV8"],[[3872,3881],"valid"],[[3882,3892],"valid",[],"NV8"],[[3893,3893],"valid"],[[3894,3894],"valid",[],"NV8"],[[3895,3895],"valid"],[[3896,3896],"valid",[],"NV8"],[[3897,3897],"valid"],[[3898,3901],"valid",[],"NV8"],[[3902,3906],"valid"],[[3907,3907],"mapped",[3906,4023]],[[3908,3911],"valid"],[[3912,3912],"disallowed"],[[3913,3916],"valid"],[[3917,3917],"mapped",[3916,4023]],[[3918,3921],"valid"],[[3922,3922],"mapped",[3921,4023]],[[3923,3926],"valid"],[[3927,3927],"mapped",[3926,4023]],[[3928,3931],"valid"],[[3932,3932],"mapped",[3931,4023]],[[3933,3944],"valid"],[[3945,3945],"mapped",[3904,4021]],[[3946,3946],"valid"],[[3947,3948],"valid"],[[3949,3952],"disallowed"],[[3953,3954],"valid"],[[3955,3955],"mapped",[3953,3954]],[[3956,3956],"valid"],[[3957,3957],"mapped",[3953,3956]],[[3958,3958],"mapped",[4018,3968]],[[3959,3959],"mapped",[4018,3953,3968]],[[3960,3960],"mapped",[4019,3968]],[[3961,3961],"mapped",[4019,3953,3968]],[[3962,3968],"valid"],[[3969,3969],"mapped",[3953,3968]],[[3970,3972],"valid"],[[3973,3973],"valid",[],"NV8"],[[3974,3979],"valid"],[[3980,3983],"valid"],[[3984,3986],"valid"],[[3987,3987],"mapped",[3986,4023]],[[3988,3989],"valid"],[[3990,3990],"valid"],[[3991,3991],"valid"],[[3992,3992],"disallowed"],[[3993,3996],"valid"],[[3997,3997],"mapped",[3996,4023]],[[3998,4001],"valid"],[[4002,4002],"mapped",[4001,4023]],[[4003,4006],"valid"],[[4007,4007],"mapped",[4006,4023]],[[4008,4011],"valid"],[[4012,4012],"mapped",[4011,4023]],[[4013,4013],"valid"],[[4014,4016],"valid"],[[4017,4023],"valid"],[[4024,4024],"valid"],[[4025,4025],"mapped",[3984,4021]],[[4026,4028],"valid"],[[4029,4029],"disallowed"],[[4030,4037],"valid",[],"NV8"],[[4038,4038],"valid"],[[4039,4044],"valid",[],"NV8"],[[4045,4045],"disallowed"],[[4046,4046],"valid",[],"NV8"],[[4047,4047],"valid",[],"NV8"],[[4048,4049],"valid",[],"NV8"],[[4050,4052],"valid",[],"NV8"],[[4053,4056],"valid",[],"NV8"],[[4057,4058],"valid",[],"NV8"],[[4059,4095],"disallowed"],[[4096,4129],"valid"],[[4130,4130],"valid"],[[4131,4135],"valid"],[[4136,4136],"valid"],[[4137,4138],"valid"],[[4139,4139],"valid"],[[4140,4146],"valid"],[[4147,4149],"valid"],[[4150,4153],"valid"],[[4154,4159],"valid"],[[4160,4169],"valid"],[[4170,4175],"valid",[],"NV8"],[[4176,4185],"valid"],[[4186,4249],"valid"],[[4250,4253],"valid"],[[4254,4255],"valid",[],"NV8"],[[4256,4293],"disallowed"],[[4294,4294],"disallowed"],[[4295,4295],"mapped",[11559]],[[4296,4300],"disallowed"],[[4301,4301],"mapped",[11565]],[[4302,4303],"disallowed"],[[4304,4342],"valid"],[[4343,4344],"valid"],[[4345,4346],"valid"],[[4347,4347],"valid",[],"NV8"],[[4348,4348],"mapped",[4316]],[[4349,4351],"valid"],[[4352,4441],"valid",[],"NV8"],[[4442,4446],"valid",[],"NV8"],[[4447,4448],"disallowed"],[[4449,4514],"valid",[],"NV8"],[[4515,4519],"valid",[],"NV8"],[[4520,4601],"valid",[],"NV8"],[[4602,4607],"valid",[],"NV8"],[[4608,4614],"valid"],[[4615,4615],"valid"],[[4616,4678],"valid"],[[4679,4679],"valid"],[[4680,4680],"valid"],[[4681,4681],"disallowed"],[[4682,4685],"valid"],[[4686,4687],"disallowed"],[[4688,4694],"valid"],[[4695,4695],"disallowed"],[[4696,4696],"valid"],[[4697,4697],"disallowed"],[[4698,4701],"valid"],[[4702,4703],"disallowed"],[[4704,4742],"valid"],[[4743,4743],"valid"],[[4744,4744],"valid"],[[4745,4745],"disallowed"],[[4746,4749],"valid"],[[4750,4751],"disallowed"],[[4752,4782],"valid"],[[4783,4783],"valid"],[[4784,4784],"valid"],[[4785,4785],"disallowed"],[[4786,4789],"valid"],[[4790,4791],"disallowed"],[[4792,4798],"valid"],[[4799,4799],"disallowed"],[[4800,4800],"valid"],[[4801,4801],"disallowed"],[[4802,4805],"valid"],[[4806,4807],"disallowed"],[[4808,4814],"valid"],[[4815,4815],"valid"],[[4816,4822],"valid"],[[4823,4823],"disallowed"],[[4824,4846],"valid"],[[4847,4847],"valid"],[[4848,4878],"valid"],[[4879,4879],"valid"],[[4880,4880],"valid"],[[4881,4881],"disallowed"],[[4882,4885],"valid"],[[4886,4887],"disallowed"],[[4888,4894],"valid"],[[4895,4895],"valid"],[[4896,4934],"valid"],[[4935,4935],"valid"],[[4936,4954],"valid"],[[4955,4956],"disallowed"],[[4957,4958],"valid"],[[4959,4959],"valid"],[[4960,4960],"valid",[],"NV8"],[[4961,4988],"valid",[],"NV8"],[[4989,4991],"disallowed"],[[4992,5007],"valid"],[[5008,5017],"valid",[],"NV8"],[[5018,5023],"disallowed"],[[5024,5108],"valid"],[[5109,5109],"valid"],[[5110,5111],"disallowed"],[[5112,5112],"mapped",[5104]],[[5113,5113],"mapped",[5105]],[[5114,5114],"mapped",[5106]],[[5115,5115],"mapped",[5107]],[[5116,5116],"mapped",[5108]],[[5117,5117],"mapped",[5109]],[[5118,5119],"disallowed"],[[5120,5120],"valid",[],"NV8"],[[5121,5740],"valid"],[[5741,5742],"valid",[],"NV8"],[[5743,5750],"valid"],[[5751,5759],"valid"],[[5760,5760],"disallowed"],[[5761,5786],"valid"],[[5787,5788],"valid",[],"NV8"],[[5789,5791],"disallowed"],[[5792,5866],"valid"],[[5867,5872],"valid",[],"NV8"],[[5873,5880],"valid"],[[5881,5887],"disallowed"],[[5888,5900],"valid"],[[5901,5901],"disallowed"],[[5902,5908],"valid"],[[5909,5919],"disallowed"],[[5920,5940],"valid"],[[5941,5942],"valid",[],"NV8"],[[5943,5951],"disallowed"],[[5952,5971],"valid"],[[5972,5983],"disallowed"],[[5984,5996],"valid"],[[5997,5997],"disallowed"],[[5998,6000],"valid"],[[6001,6001],"disallowed"],[[6002,6003],"valid"],[[6004,6015],"disallowed"],[[6016,6067],"valid"],[[6068,6069],"disallowed"],[[6070,6099],"valid"],[[6100,6102],"valid",[],"NV8"],[[6103,6103],"valid"],[[6104,6107],"valid",[],"NV8"],[[6108,6108],"valid"],[[6109,6109],"valid"],[[6110,6111],"disallowed"],[[6112,6121],"valid"],[[6122,6127],"disallowed"],[[6128,6137],"valid",[],"NV8"],[[6138,6143],"disallowed"],[[6144,6149],"valid",[],"NV8"],[[6150,6150],"disallowed"],[[6151,6154],"valid",[],"NV8"],[[6155,6157],"ignored"],[[6158,6158],"disallowed"],[[6159,6159],"disallowed"],[[6160,6169],"valid"],[[6170,6175],"disallowed"],[[6176,6263],"valid"],[[6264,6271],"disallowed"],[[6272,6313],"valid"],[[6314,6314],"valid"],[[6315,6319],"disallowed"],[[6320,6389],"valid"],[[6390,6399],"disallowed"],[[6400,6428],"valid"],[[6429,6430],"valid"],[[6431,6431],"disallowed"],[[6432,6443],"valid"],[[6444,6447],"disallowed"],[[6448,6459],"valid"],[[6460,6463],"disallowed"],[[6464,6464],"valid",[],"NV8"],[[6465,6467],"disallowed"],[[6468,6469],"valid",[],"NV8"],[[6470,6509],"valid"],[[6510,6511],"disallowed"],[[6512,6516],"valid"],[[6517,6527],"disallowed"],[[6528,6569],"valid"],[[6570,6571],"valid"],[[6572,6575],"disallowed"],[[6576,6601],"valid"],[[6602,6607],"disallowed"],[[6608,6617],"valid"],[[6618,6618],"valid",[],"XV8"],[[6619,6621],"disallowed"],[[6622,6623],"valid",[],"NV8"],[[6624,6655],"valid",[],"NV8"],[[6656,6683],"valid"],[[6684,6685],"disallowed"],[[6686,6687],"valid",[],"NV8"],[[6688,6750],"valid"],[[6751,6751],"disallowed"],[[6752,6780],"valid"],[[6781,6782],"disallowed"],[[6783,6793],"valid"],[[6794,6799],"disallowed"],[[6800,6809],"valid"],[[6810,6815],"disallowed"],[[6816,6822],"valid",[],"NV8"],[[6823,6823],"valid"],[[6824,6829],"valid",[],"NV8"],[[6830,6831],"disallowed"],[[6832,6845],"valid"],[[6846,6846],"valid",[],"NV8"],[[6847,6911],"disallowed"],[[6912,6987],"valid"],[[6988,6991],"disallowed"],[[6992,7001],"valid"],[[7002,7018],"valid",[],"NV8"],[[7019,7027],"valid"],[[7028,7036],"valid",[],"NV8"],[[7037,7039],"disallowed"],[[7040,7082],"valid"],[[7083,7085],"valid"],[[7086,7097],"valid"],[[7098,7103],"valid"],[[7104,7155],"valid"],[[7156,7163],"disallowed"],[[7164,7167],"valid",[],"NV8"],[[7168,7223],"valid"],[[7224,7226],"disallowed"],[[7227,7231],"valid",[],"NV8"],[[7232,7241],"valid"],[[7242,7244],"disallowed"],[[7245,7293],"valid"],[[7294,7295],"valid",[],"NV8"],[[7296,7359],"disallowed"],[[7360,7367],"valid",[],"NV8"],[[7368,7375],"disallowed"],[[7376,7378],"valid"],[[7379,7379],"valid",[],"NV8"],[[7380,7410],"valid"],[[7411,7414],"valid"],[[7415,7415],"disallowed"],[[7416,7417],"valid"],[[7418,7423],"disallowed"],[[7424,7467],"valid"],[[7468,7468],"mapped",[97]],[[7469,7469],"mapped",[230]],[[7470,7470],"mapped",[98]],[[7471,7471],"valid"],[[7472,7472],"mapped",[100]],[[7473,7473],"mapped",[101]],[[7474,7474],"mapped",[477]],[[7475,7475],"mapped",[103]],[[7476,7476],"mapped",[104]],[[7477,7477],"mapped",[105]],[[7478,7478],"mapped",[106]],[[7479,7479],"mapped",[107]],[[7480,7480],"mapped",[108]],[[7481,7481],"mapped",[109]],[[7482,7482],"mapped",[110]],[[7483,7483],"valid"],[[7484,7484],"mapped",[111]],[[7485,7485],"mapped",[547]],[[7486,7486],"mapped",[112]],[[7487,7487],"mapped",[114]],[[7488,7488],"mapped",[116]],[[7489,7489],"mapped",[117]],[[7490,7490],"mapped",[119]],[[7491,7491],"mapped",[97]],[[7492,7492],"mapped",[592]],[[7493,7493],"mapped",[593]],[[7494,7494],"mapped",[7426]],[[7495,7495],"mapped",[98]],[[7496,7496],"mapped",[100]],[[7497,7497],"mapped",[101]],[[7498,7498],"mapped",[601]],[[7499,7499],"mapped",[603]],[[7500,7500],"mapped",[604]],[[7501,7501],"mapped",[103]],[[7502,7502],"valid"],[[7503,7503],"mapped",[107]],[[7504,7504],"mapped",[109]],[[7505,7505],"mapped",[331]],[[7506,7506],"mapped",[111]],[[7507,7507],"mapped",[596]],[[7508,7508],"mapped",[7446]],[[7509,7509],"mapped",[7447]],[[7510,7510],"mapped",[112]],[[7511,7511],"mapped",[116]],[[7512,7512],"mapped",[117]],[[7513,7513],"mapped",[7453]],[[7514,7514],"mapped",[623]],[[7515,7515],"mapped",[118]],[[7516,7516],"mapped",[7461]],[[7517,7517],"mapped",[946]],[[7518,7518],"mapped",[947]],[[7519,7519],"mapped",[948]],[[7520,7520],"mapped",[966]],[[7521,7521],"mapped",[967]],[[7522,7522],"mapped",[105]],[[7523,7523],"mapped",[114]],[[7524,7524],"mapped",[117]],[[7525,7525],"mapped",[118]],[[7526,7526],"mapped",[946]],[[7527,7527],"mapped",[947]],[[7528,7528],"mapped",[961]],[[7529,7529],"mapped",[966]],[[7530,7530],"mapped",[967]],[[7531,7531],"valid"],[[7532,7543],"valid"],[[7544,7544],"mapped",[1085]],[[7545,7578],"valid"],[[7579,7579],"mapped",[594]],[[7580,7580],"mapped",[99]],[[7581,7581],"mapped",[597]],[[7582,7582],"mapped",[240]],[[7583,7583],"mapped",[604]],[[7584,7584],"mapped",[102]],[[7585,7585],"mapped",[607]],[[7586,7586],"mapped",[609]],[[7587,7587],"mapped",[613]],[[7588,7588],"mapped",[616]],[[7589,7589],"mapped",[617]],[[7590,7590],"mapped",[618]],[[7591,7591],"mapped",[7547]],[[7592,7592],"mapped",[669]],[[7593,7593],"mapped",[621]],[[7594,7594],"mapped",[7557]],[[7595,7595],"mapped",[671]],[[7596,7596],"mapped",[625]],[[7597,7597],"mapped",[624]],[[7598,7598],"mapped",[626]],[[7599,7599],"mapped",[627]],[[7600,7600],"mapped",[628]],[[7601,7601],"mapped",[629]],[[7602,7602],"mapped",[632]],[[7603,7603],"mapped",[642]],[[7604,7604],"mapped",[643]],[[7605,7605],"mapped",[427]],[[7606,7606],"mapped",[649]],[[7607,7607],"mapped",[650]],[[7608,7608],"mapped",[7452]],[[7609,7609],"mapped",[651]],[[7610,7610],"mapped",[652]],[[7611,7611],"mapped",[122]],[[7612,7612],"mapped",[656]],[[7613,7613],"mapped",[657]],[[7614,7614],"mapped",[658]],[[7615,7615],"mapped",[952]],[[7616,7619],"valid"],[[7620,7626],"valid"],[[7627,7654],"valid"],[[7655,7669],"valid"],[[7670,7675],"disallowed"],[[7676,7676],"valid"],[[7677,7677],"valid"],[[7678,7679],"valid"],[[7680,7680],"mapped",[7681]],[[7681,7681],"valid"],[[7682,7682],"mapped",[7683]],[[7683,7683],"valid"],[[7684,7684],"mapped",[7685]],[[7685,7685],"valid"],[[7686,7686],"mapped",[7687]],[[7687,7687],"valid"],[[7688,7688],"mapped",[7689]],[[7689,7689],"valid"],[[7690,7690],"mapped",[7691]],[[7691,7691],"valid"],[[7692,7692],"mapped",[7693]],[[7693,7693],"valid"],[[7694,7694],"mapped",[7695]],[[7695,7695],"valid"],[[7696,7696],"mapped",[7697]],[[7697,7697],"valid"],[[7698,7698],"mapped",[7699]],[[7699,7699],"valid"],[[7700,7700],"mapped",[7701]],[[7701,7701],"valid"],[[7702,7702],"mapped",[7703]],[[7703,7703],"valid"],[[7704,7704],"mapped",[7705]],[[7705,7705],"valid"],[[7706,7706],"mapped",[7707]],[[7707,7707],"valid"],[[7708,7708],"mapped",[7709]],[[7709,7709],"valid"],[[7710,7710],"mapped",[7711]],[[7711,7711],"valid"],[[7712,7712],"mapped",[7713]],[[7713,7713],"valid"],[[7714,7714],"mapped",[7715]],[[7715,7715],"valid"],[[7716,7716],"mapped",[7717]],[[7717,7717],"valid"],[[7718,7718],"mapped",[7719]],[[7719,7719],"valid"],[[7720,7720],"mapped",[7721]],[[7721,7721],"valid"],[[7722,7722],"mapped",[7723]],[[7723,7723],"valid"],[[7724,7724],"mapped",[7725]],[[7725,7725],"valid"],[[7726,7726],"mapped",[7727]],[[7727,7727],"valid"],[[7728,7728],"mapped",[7729]],[[7729,7729],"valid"],[[7730,7730],"mapped",[7731]],[[7731,7731],"valid"],[[7732,7732],"mapped",[7733]],[[7733,7733],"valid"],[[7734,7734],"mapped",[7735]],[[7735,7735],"valid"],[[7736,7736],"mapped",[7737]],[[7737,7737],"valid"],[[7738,7738],"mapped",[7739]],[[7739,7739],"valid"],[[7740,7740],"mapped",[7741]],[[7741,7741],"valid"],[[7742,7742],"mapped",[7743]],[[7743,7743],"valid"],[[7744,7744],"mapped",[7745]],[[7745,7745],"valid"],[[7746,7746],"mapped",[7747]],[[7747,7747],"valid"],[[7748,7748],"mapped",[7749]],[[7749,7749],"valid"],[[7750,7750],"mapped",[7751]],[[7751,7751],"valid"],[[7752,7752],"mapped",[7753]],[[7753,7753],"valid"],[[7754,7754],"mapped",[7755]],[[7755,7755],"valid"],[[7756,7756],"mapped",[7757]],[[7757,7757],"valid"],[[7758,7758],"mapped",[7759]],[[7759,7759],"valid"],[[7760,7760],"mapped",[7761]],[[7761,7761],"valid"],[[7762,7762],"mapped",[7763]],[[7763,7763],"valid"],[[7764,7764],"mapped",[7765]],[[7765,7765],"valid"],[[7766,7766],"mapped",[7767]],[[7767,7767],"valid"],[[7768,7768],"mapped",[7769]],[[7769,7769],"valid"],[[7770,7770],"mapped",[7771]],[[7771,7771],"valid"],[[7772,7772],"mapped",[7773]],[[7773,7773],"valid"],[[7774,7774],"mapped",[7775]],[[7775,7775],"valid"],[[7776,7776],"mapped",[7777]],[[7777,7777],"valid"],[[7778,7778],"mapped",[7779]],[[7779,7779],"valid"],[[7780,7780],"mapped",[7781]],[[7781,7781],"valid"],[[7782,7782],"mapped",[7783]],[[7783,7783],"valid"],[[7784,7784],"mapped",[7785]],[[7785,7785],"valid"],[[7786,7786],"mapped",[7787]],[[7787,7787],"valid"],[[7788,7788],"mapped",[7789]],[[7789,7789],"valid"],[[7790,7790],"mapped",[7791]],[[7791,7791],"valid"],[[7792,7792],"mapped",[7793]],[[7793,7793],"valid"],[[7794,7794],"mapped",[7795]],[[7795,7795],"valid"],[[7796,7796],"mapped",[7797]],[[7797,7797],"valid"],[[7798,7798],"mapped",[7799]],[[7799,7799],"valid"],[[7800,7800],"mapped",[7801]],[[7801,7801],"valid"],[[7802,7802],"mapped",[7803]],[[7803,7803],"valid"],[[7804,7804],"mapped",[7805]],[[7805,7805],"valid"],[[7806,7806],"mapped",[7807]],[[7807,7807],"valid"],[[7808,7808],"mapped",[7809]],[[7809,7809],"valid"],[[7810,7810],"mapped",[7811]],[[7811,7811],"valid"],[[7812,7812],"mapped",[7813]],[[7813,7813],"valid"],[[7814,7814],"mapped",[7815]],[[7815,7815],"valid"],[[7816,7816],"mapped",[7817]],[[7817,7817],"valid"],[[7818,7818],"mapped",[7819]],[[7819,7819],"valid"],[[7820,7820],"mapped",[7821]],[[7821,7821],"valid"],[[7822,7822],"mapped",[7823]],[[7823,7823],"valid"],[[7824,7824],"mapped",[7825]],[[7825,7825],"valid"],[[7826,7826],"mapped",[7827]],[[7827,7827],"valid"],[[7828,7828],"mapped",[7829]],[[7829,7833],"valid"],[[7834,7834],"mapped",[97,702]],[[7835,7835],"mapped",[7777]],[[7836,7837],"valid"],[[7838,7838],"mapped",[115,115]],[[7839,7839],"valid"],[[7840,7840],"mapped",[7841]],[[7841,7841],"valid"],[[7842,7842],"mapped",[7843]],[[7843,7843],"valid"],[[7844,7844],"mapped",[7845]],[[7845,7845],"valid"],[[7846,7846],"mapped",[7847]],[[7847,7847],"valid"],[[7848,7848],"mapped",[7849]],[[7849,7849],"valid"],[[7850,7850],"mapped",[7851]],[[7851,7851],"valid"],[[7852,7852],"mapped",[7853]],[[7853,7853],"valid"],[[7854,7854],"mapped",[7855]],[[7855,7855],"valid"],[[7856,7856],"mapped",[7857]],[[7857,7857],"valid"],[[7858,7858],"mapped",[7859]],[[7859,7859],"valid"],[[7860,7860],"mapped",[7861]],[[7861,7861],"valid"],[[7862,7862],"mapped",[7863]],[[7863,7863],"valid"],[[7864,7864],"mapped",[7865]],[[7865,7865],"valid"],[[7866,7866],"mapped",[7867]],[[7867,7867],"valid"],[[7868,7868],"mapped",[7869]],[[7869,7869],"valid"],[[7870,7870],"mapped",[7871]],[[7871,7871],"valid"],[[7872,7872],"mapped",[7873]],[[7873,7873],"valid"],[[7874,7874],"mapped",[7875]],[[7875,7875],"valid"],[[7876,7876],"mapped",[7877]],[[7877,7877],"valid"],[[7878,7878],"mapped",[7879]],[[7879,7879],"valid"],[[7880,7880],"mapped",[7881]],[[7881,7881],"valid"],[[7882,7882],"mapped",[7883]],[[7883,7883],"valid"],[[7884,7884],"mapped",[7885]],[[7885,7885],"valid"],[[7886,7886],"mapped",[7887]],[[7887,7887],"valid"],[[7888,7888],"mapped",[7889]],[[7889,7889],"valid"],[[7890,7890],"mapped",[7891]],[[7891,7891],"valid"],[[7892,7892],"mapped",[7893]],[[7893,7893],"valid"],[[7894,7894],"mapped",[7895]],[[7895,7895],"valid"],[[7896,7896],"mapped",[7897]],[[7897,7897],"valid"],[[7898,7898],"mapped",[7899]],[[7899,7899],"valid"],[[7900,7900],"mapped",[7901]],[[7901,7901],"valid"],[[7902,7902],"mapped",[7903]],[[7903,7903],"valid"],[[7904,7904],"mapped",[7905]],[[7905,7905],"valid"],[[7906,7906],"mapped",[7907]],[[7907,7907],"valid"],[[7908,7908],"mapped",[7909]],[[7909,7909],"valid"],[[7910,7910],"mapped",[7911]],[[7911,7911],"valid"],[[7912,7912],"mapped",[7913]],[[7913,7913],"valid"],[[7914,7914],"mapped",[7915]],[[7915,7915],"valid"],[[7916,7916],"mapped",[7917]],[[7917,7917],"valid"],[[7918,7918],"mapped",[7919]],[[7919,7919],"valid"],[[7920,7920],"mapped",[7921]],[[7921,7921],"valid"],[[7922,7922],"mapped",[7923]],[[7923,7923],"valid"],[[7924,7924],"mapped",[7925]],[[7925,7925],"valid"],[[7926,7926],"mapped",[7927]],[[7927,7927],"valid"],[[7928,7928],"mapped",[7929]],[[7929,7929],"valid"],[[7930,7930],"mapped",[7931]],[[7931,7931],"valid"],[[7932,7932],"mapped",[7933]],[[7933,7933],"valid"],[[7934,7934],"mapped",[7935]],[[7935,7935],"valid"],[[7936,7943],"valid"],[[7944,7944],"mapped",[7936]],[[7945,7945],"mapped",[7937]],[[7946,7946],"mapped",[7938]],[[7947,7947],"mapped",[7939]],[[7948,7948],"mapped",[7940]],[[7949,7949],"mapped",[7941]],[[7950,7950],"mapped",[7942]],[[7951,7951],"mapped",[7943]],[[7952,7957],"valid"],[[7958,7959],"disallowed"],[[7960,7960],"mapped",[7952]],[[7961,7961],"mapped",[7953]],[[7962,7962],"mapped",[7954]],[[7963,7963],"mapped",[7955]],[[7964,7964],"mapped",[7956]],[[7965,7965],"mapped",[7957]],[[7966,7967],"disallowed"],[[7968,7975],"valid"],[[7976,7976],"mapped",[7968]],[[7977,7977],"mapped",[7969]],[[7978,7978],"mapped",[7970]],[[7979,7979],"mapped",[7971]],[[7980,7980],"mapped",[7972]],[[7981,7981],"mapped",[7973]],[[7982,7982],"mapped",[7974]],[[7983,7983],"mapped",[7975]],[[7984,7991],"valid"],[[7992,7992],"mapped",[7984]],[[7993,7993],"mapped",[7985]],[[7994,7994],"mapped",[7986]],[[7995,7995],"mapped",[7987]],[[7996,7996],"mapped",[7988]],[[7997,7997],"mapped",[7989]],[[7998,7998],"mapped",[7990]],[[7999,7999],"mapped",[7991]],[[8000,8005],"valid"],[[8006,8007],"disallowed"],[[8008,8008],"mapped",[8000]],[[8009,8009],"mapped",[8001]],[[8010,8010],"mapped",[8002]],[[8011,8011],"mapped",[8003]],[[8012,8012],"mapped",[8004]],[[8013,8013],"mapped",[8005]],[[8014,8015],"disallowed"],[[8016,8023],"valid"],[[8024,8024],"disallowed"],[[8025,8025],"mapped",[8017]],[[8026,8026],"disallowed"],[[8027,8027],"mapped",[8019]],[[8028,8028],"disallowed"],[[8029,8029],"mapped",[8021]],[[8030,8030],"disallowed"],[[8031,8031],"mapped",[8023]],[[8032,8039],"valid"],[[8040,8040],"mapped",[8032]],[[8041,8041],"mapped",[8033]],[[8042,8042],"mapped",[8034]],[[8043,8043],"mapped",[8035]],[[8044,8044],"mapped",[8036]],[[8045,8045],"mapped",[8037]],[[8046,8046],"mapped",[8038]],[[8047,8047],"mapped",[8039]],[[8048,8048],"valid"],[[8049,8049],"mapped",[940]],[[8050,8050],"valid"],[[8051,8051],"mapped",[941]],[[8052,8052],"valid"],[[8053,8053],"mapped",[942]],[[8054,8054],"valid"],[[8055,8055],"mapped",[943]],[[8056,8056],"valid"],[[8057,8057],"mapped",[972]],[[8058,8058],"valid"],[[8059,8059],"mapped",[973]],[[8060,8060],"valid"],[[8061,8061],"mapped",[974]],[[8062,8063],"disallowed"],[[8064,8064],"mapped",[7936,953]],[[8065,8065],"mapped",[7937,953]],[[8066,8066],"mapped",[7938,953]],[[8067,8067],"mapped",[7939,953]],[[8068,8068],"mapped",[7940,953]],[[8069,8069],"mapped",[7941,953]],[[8070,8070],"mapped",[7942,953]],[[8071,8071],"mapped",[7943,953]],[[8072,8072],"mapped",[7936,953]],[[8073,8073],"mapped",[7937,953]],[[8074,8074],"mapped",[7938,953]],[[8075,8075],"mapped",[7939,953]],[[8076,8076],"mapped",[7940,953]],[[8077,8077],"mapped",[7941,953]],[[8078,8078],"mapped",[7942,953]],[[8079,8079],"mapped",[7943,953]],[[8080,8080],"mapped",[7968,953]],[[8081,8081],"mapped",[7969,953]],[[8082,8082],"mapped",[7970,953]],[[8083,8083],"mapped",[7971,953]],[[8084,8084],"mapped",[7972,953]],[[8085,8085],"mapped",[7973,953]],[[8086,8086],"mapped",[7974,953]],[[8087,8087],"mapped",[7975,953]],[[8088,8088],"mapped",[7968,953]],[[8089,8089],"mapped",[7969,953]],[[8090,8090],"mapped",[7970,953]],[[8091,8091],"mapped",[7971,953]],[[8092,8092],"mapped",[7972,953]],[[8093,8093],"mapped",[7973,953]],[[8094,8094],"mapped",[7974,953]],[[8095,8095],"mapped",[7975,953]],[[8096,8096],"mapped",[8032,953]],[[8097,8097],"mapped",[8033,953]],[[8098,8098],"mapped",[8034,953]],[[8099,8099],"mapped",[8035,953]],[[8100,8100],"mapped",[8036,953]],[[8101,8101],"mapped",[8037,953]],[[8102,8102],"mapped",[8038,953]],[[8103,8103],"mapped",[8039,953]],[[8104,8104],"mapped",[8032,953]],[[8105,8105],"mapped",[8033,953]],[[8106,8106],"mapped",[8034,953]],[[8107,8107],"mapped",[8035,953]],[[8108,8108],"mapped",[8036,953]],[[8109,8109],"mapped",[8037,953]],[[8110,8110],"mapped",[8038,953]],[[8111,8111],"mapped",[8039,953]],[[8112,8113],"valid"],[[8114,8114],"mapped",[8048,953]],[[8115,8115],"mapped",[945,953]],[[8116,8116],"mapped",[940,953]],[[8117,8117],"disallowed"],[[8118,8118],"valid"],[[8119,8119],"mapped",[8118,953]],[[8120,8120],"mapped",[8112]],[[8121,8121],"mapped",[8113]],[[8122,8122],"mapped",[8048]],[[8123,8123],"mapped",[940]],[[8124,8124],"mapped",[945,953]],[[8125,8125],"disallowed_STD3_mapped",[32,787]],[[8126,8126],"mapped",[953]],[[8127,8127],"disallowed_STD3_mapped",[32,787]],[[8128,8128],"disallowed_STD3_mapped",[32,834]],[[8129,8129],"disallowed_STD3_mapped",[32,776,834]],[[8130,8130],"mapped",[8052,953]],[[8131,8131],"mapped",[951,953]],[[8132,8132],"mapped",[942,953]],[[8133,8133],"disallowed"],[[8134,8134],"valid"],[[8135,8135],"mapped",[8134,953]],[[8136,8136],"mapped",[8050]],[[8137,8137],"mapped",[941]],[[8138,8138],"mapped",[8052]],[[8139,8139],"mapped",[942]],[[8140,8140],"mapped",[951,953]],[[8141,8141],"disallowed_STD3_mapped",[32,787,768]],[[8142,8142],"disallowed_STD3_mapped",[32,787,769]],[[8143,8143],"disallowed_STD3_mapped",[32,787,834]],[[8144,8146],"valid"],[[8147,8147],"mapped",[912]],[[8148,8149],"disallowed"],[[8150,8151],"valid"],[[8152,8152],"mapped",[8144]],[[8153,8153],"mapped",[8145]],[[8154,8154],"mapped",[8054]],[[8155,8155],"mapped",[943]],[[8156,8156],"disallowed"],[[8157,8157],"disallowed_STD3_mapped",[32,788,768]],[[8158,8158],"disallowed_STD3_mapped",[32,788,769]],[[8159,8159],"disallowed_STD3_mapped",[32,788,834]],[[8160,8162],"valid"],[[8163,8163],"mapped",[944]],[[8164,8167],"valid"],[[8168,8168],"mapped",[8160]],[[8169,8169],"mapped",[8161]],[[8170,8170],"mapped",[8058]],[[8171,8171],"mapped",[973]],[[8172,8172],"mapped",[8165]],[[8173,8173],"disallowed_STD3_mapped",[32,776,768]],[[8174,8174],"disallowed_STD3_mapped",[32,776,769]],[[8175,8175],"disallowed_STD3_mapped",[96]],[[8176,8177],"disallowed"],[[8178,8178],"mapped",[8060,953]],[[8179,8179],"mapped",[969,953]],[[8180,8180],"mapped",[974,953]],[[8181,8181],"disallowed"],[[8182,8182],"valid"],[[8183,8183],"mapped",[8182,953]],[[8184,8184],"mapped",[8056]],[[8185,8185],"mapped",[972]],[[8186,8186],"mapped",[8060]],[[8187,8187],"mapped",[974]],[[8188,8188],"mapped",[969,953]],[[8189,8189],"disallowed_STD3_mapped",[32,769]],[[8190,8190],"disallowed_STD3_mapped",[32,788]],[[8191,8191],"disallowed"],[[8192,8202],"disallowed_STD3_mapped",[32]],[[8203,8203],"ignored"],[[8204,8205],"deviation",[]],[[8206,8207],"disallowed"],[[8208,8208],"valid",[],"NV8"],[[8209,8209],"mapped",[8208]],[[8210,8214],"valid",[],"NV8"],[[8215,8215],"disallowed_STD3_mapped",[32,819]],[[8216,8227],"valid",[],"NV8"],[[8228,8230],"disallowed"],[[8231,8231],"valid",[],"NV8"],[[8232,8238],"disallowed"],[[8239,8239],"disallowed_STD3_mapped",[32]],[[8240,8242],"valid",[],"NV8"],[[8243,8243],"mapped",[8242,8242]],[[8244,8244],"mapped",[8242,8242,8242]],[[8245,8245],"valid",[],"NV8"],[[8246,8246],"mapped",[8245,8245]],[[8247,8247],"mapped",[8245,8245,8245]],[[8248,8251],"valid",[],"NV8"],[[8252,8252],"disallowed_STD3_mapped",[33,33]],[[8253,8253],"valid",[],"NV8"],[[8254,8254],"disallowed_STD3_mapped",[32,773]],[[8255,8262],"valid",[],"NV8"],[[8263,8263],"disallowed_STD3_mapped",[63,63]],[[8264,8264],"disallowed_STD3_mapped",[63,33]],[[8265,8265],"disallowed_STD3_mapped",[33,63]],[[8266,8269],"valid",[],"NV8"],[[8270,8274],"valid",[],"NV8"],[[8275,8276],"valid",[],"NV8"],[[8277,8278],"valid",[],"NV8"],[[8279,8279],"mapped",[8242,8242,8242,8242]],[[8280,8286],"valid",[],"NV8"],[[8287,8287],"disallowed_STD3_mapped",[32]],[[8288,8288],"ignored"],[[8289,8291],"disallowed"],[[8292,8292],"ignored"],[[8293,8293],"disallowed"],[[8294,8297],"disallowed"],[[8298,8303],"disallowed"],[[8304,8304],"mapped",[48]],[[8305,8305],"mapped",[105]],[[8306,8307],"disallowed"],[[8308,8308],"mapped",[52]],[[8309,8309],"mapped",[53]],[[8310,8310],"mapped",[54]],[[8311,8311],"mapped",[55]],[[8312,8312],"mapped",[56]],[[8313,8313],"mapped",[57]],[[8314,8314],"disallowed_STD3_mapped",[43]],[[8315,8315],"mapped",[8722]],[[8316,8316],"disallowed_STD3_mapped",[61]],[[8317,8317],"disallowed_STD3_mapped",[40]],[[8318,8318],"disallowed_STD3_mapped",[41]],[[8319,8319],"mapped",[110]],[[8320,8320],"mapped",[48]],[[8321,8321],"mapped",[49]],[[8322,8322],"mapped",[50]],[[8323,8323],"mapped",[51]],[[8324,8324],"mapped",[52]],[[8325,8325],"mapped",[53]],[[8326,8326],"mapped",[54]],[[8327,8327],"mapped",[55]],[[8328,8328],"mapped",[56]],[[8329,8329],"mapped",[57]],[[8330,8330],"disallowed_STD3_mapped",[43]],[[8331,8331],"mapped",[8722]],[[8332,8332],"disallowed_STD3_mapped",[61]],[[8333,8333],"disallowed_STD3_mapped",[40]],[[8334,8334],"disallowed_STD3_mapped",[41]],[[8335,8335],"disallowed"],[[8336,8336],"mapped",[97]],[[8337,8337],"mapped",[101]],[[8338,8338],"mapped",[111]],[[8339,8339],"mapped",[120]],[[8340,8340],"mapped",[601]],[[8341,8341],"mapped",[104]],[[8342,8342],"mapped",[107]],[[8343,8343],"mapped",[108]],[[8344,8344],"mapped",[109]],[[8345,8345],"mapped",[110]],[[8346,8346],"mapped",[112]],[[8347,8347],"mapped",[115]],[[8348,8348],"mapped",[116]],[[8349,8351],"disallowed"],[[8352,8359],"valid",[],"NV8"],[[8360,8360],"mapped",[114,115]],[[8361,8362],"valid",[],"NV8"],[[8363,8363],"valid",[],"NV8"],[[8364,8364],"valid",[],"NV8"],[[8365,8367],"valid",[],"NV8"],[[8368,8369],"valid",[],"NV8"],[[8370,8373],"valid",[],"NV8"],[[8374,8376],"valid",[],"NV8"],[[8377,8377],"valid",[],"NV8"],[[8378,8378],"valid",[],"NV8"],[[8379,8381],"valid",[],"NV8"],[[8382,8382],"valid",[],"NV8"],[[8383,8399],"disallowed"],[[8400,8417],"valid",[],"NV8"],[[8418,8419],"valid",[],"NV8"],[[8420,8426],"valid",[],"NV8"],[[8427,8427],"valid",[],"NV8"],[[8428,8431],"valid",[],"NV8"],[[8432,8432],"valid",[],"NV8"],[[8433,8447],"disallowed"],[[8448,8448],"disallowed_STD3_mapped",[97,47,99]],[[8449,8449],"disallowed_STD3_mapped",[97,47,115]],[[8450,8450],"mapped",[99]],[[8451,8451],"mapped",[176,99]],[[8452,8452],"valid",[],"NV8"],[[8453,8453],"disallowed_STD3_mapped",[99,47,111]],[[8454,8454],"disallowed_STD3_mapped",[99,47,117]],[[8455,8455],"mapped",[603]],[[8456,8456],"valid",[],"NV8"],[[8457,8457],"mapped",[176,102]],[[8458,8458],"mapped",[103]],[[8459,8462],"mapped",[104]],[[8463,8463],"mapped",[295]],[[8464,8465],"mapped",[105]],[[8466,8467],"mapped",[108]],[[8468,8468],"valid",[],"NV8"],[[8469,8469],"mapped",[110]],[[8470,8470],"mapped",[110,111]],[[8471,8472],"valid",[],"NV8"],[[8473,8473],"mapped",[112]],[[8474,8474],"mapped",[113]],[[8475,8477],"mapped",[114]],[[8478,8479],"valid",[],"NV8"],[[8480,8480],"mapped",[115,109]],[[8481,8481],"mapped",[116,101,108]],[[8482,8482],"mapped",[116,109]],[[8483,8483],"valid",[],"NV8"],[[8484,8484],"mapped",[122]],[[8485,8485],"valid",[],"NV8"],[[8486,8486],"mapped",[969]],[[8487,8487],"valid",[],"NV8"],[[8488,8488],"mapped",[122]],[[8489,8489],"valid",[],"NV8"],[[8490,8490],"mapped",[107]],[[8491,8491],"mapped",[229]],[[8492,8492],"mapped",[98]],[[8493,8493],"mapped",[99]],[[8494,8494],"valid",[],"NV8"],[[8495,8496],"mapped",[101]],[[8497,8497],"mapped",[102]],[[8498,8498],"disallowed"],[[8499,8499],"mapped",[109]],[[8500,8500],"mapped",[111]],[[8501,8501],"mapped",[1488]],[[8502,8502],"mapped",[1489]],[[8503,8503],"mapped",[1490]],[[8504,8504],"mapped",[1491]],[[8505,8505],"mapped",[105]],[[8506,8506],"valid",[],"NV8"],[[8507,8507],"mapped",[102,97,120]],[[8508,8508],"mapped",[960]],[[8509,8510],"mapped",[947]],[[8511,8511],"mapped",[960]],[[8512,8512],"mapped",[8721]],[[8513,8516],"valid",[],"NV8"],[[8517,8518],"mapped",[100]],[[8519,8519],"mapped",[101]],[[8520,8520],"mapped",[105]],[[8521,8521],"mapped",[106]],[[8522,8523],"valid",[],"NV8"],[[8524,8524],"valid",[],"NV8"],[[8525,8525],"valid",[],"NV8"],[[8526,8526],"valid"],[[8527,8527],"valid",[],"NV8"],[[8528,8528],"mapped",[49,8260,55]],[[8529,8529],"mapped",[49,8260,57]],[[8530,8530],"mapped",[49,8260,49,48]],[[8531,8531],"mapped",[49,8260,51]],[[8532,8532],"mapped",[50,8260,51]],[[8533,8533],"mapped",[49,8260,53]],[[8534,8534],"mapped",[50,8260,53]],[[8535,8535],"mapped",[51,8260,53]],[[8536,8536],"mapped",[52,8260,53]],[[8537,8537],"mapped",[49,8260,54]],[[8538,8538],"mapped",[53,8260,54]],[[8539,8539],"mapped",[49,8260,56]],[[8540,8540],"mapped",[51,8260,56]],[[8541,8541],"mapped",[53,8260,56]],[[8542,8542],"mapped",[55,8260,56]],[[8543,8543],"mapped",[49,8260]],[[8544,8544],"mapped",[105]],[[8545,8545],"mapped",[105,105]],[[8546,8546],"mapped",[105,105,105]],[[8547,8547],"mapped",[105,118]],[[8548,8548],"mapped",[118]],[[8549,8549],"mapped",[118,105]],[[8550,8550],"mapped",[118,105,105]],[[8551,8551],"mapped",[118,105,105,105]],[[8552,8552],"mapped",[105,120]],[[8553,8553],"mapped",[120]],[[8554,8554],"mapped",[120,105]],[[8555,8555],"mapped",[120,105,105]],[[8556,8556],"mapped",[108]],[[8557,8557],"mapped",[99]],[[8558,8558],"mapped",[100]],[[8559,8559],"mapped",[109]],[[8560,8560],"mapped",[105]],[[8561,8561],"mapped",[105,105]],[[8562,8562],"mapped",[105,105,105]],[[8563,8563],"mapped",[105,118]],[[8564,8564],"mapped",[118]],[[8565,8565],"mapped",[118,105]],[[8566,8566],"mapped",[118,105,105]],[[8567,8567],"mapped",[118,105,105,105]],[[8568,8568],"mapped",[105,120]],[[8569,8569],"mapped",[120]],[[8570,8570],"mapped",[120,105]],[[8571,8571],"mapped",[120,105,105]],[[8572,8572],"mapped",[108]],[[8573,8573],"mapped",[99]],[[8574,8574],"mapped",[100]],[[8575,8575],"mapped",[109]],[[8576,8578],"valid",[],"NV8"],[[8579,8579],"disallowed"],[[8580,8580],"valid"],[[8581,8584],"valid",[],"NV8"],[[8585,8585],"mapped",[48,8260,51]],[[8586,8587],"valid",[],"NV8"],[[8588,8591],"disallowed"],[[8592,8682],"valid",[],"NV8"],[[8683,8691],"valid",[],"NV8"],[[8692,8703],"valid",[],"NV8"],[[8704,8747],"valid",[],"NV8"],[[8748,8748],"mapped",[8747,8747]],[[8749,8749],"mapped",[8747,8747,8747]],[[8750,8750],"valid",[],"NV8"],[[8751,8751],"mapped",[8750,8750]],[[8752,8752],"mapped",[8750,8750,8750]],[[8753,8799],"valid",[],"NV8"],[[8800,8800],"disallowed_STD3_valid"],[[8801,8813],"valid",[],"NV8"],[[8814,8815],"disallowed_STD3_valid"],[[8816,8945],"valid",[],"NV8"],[[8946,8959],"valid",[],"NV8"],[[8960,8960],"valid",[],"NV8"],[[8961,8961],"valid",[],"NV8"],[[8962,9000],"valid",[],"NV8"],[[9001,9001],"mapped",[12296]],[[9002,9002],"mapped",[12297]],[[9003,9082],"valid",[],"NV8"],[[9083,9083],"valid",[],"NV8"],[[9084,9084],"valid",[],"NV8"],[[9085,9114],"valid",[],"NV8"],[[9115,9166],"valid",[],"NV8"],[[9167,9168],"valid",[],"NV8"],[[9169,9179],"valid",[],"NV8"],[[9180,9191],"valid",[],"NV8"],[[9192,9192],"valid",[],"NV8"],[[9193,9203],"valid",[],"NV8"],[[9204,9210],"valid",[],"NV8"],[[9211,9215],"disallowed"],[[9216,9252],"valid",[],"NV8"],[[9253,9254],"valid",[],"NV8"],[[9255,9279],"disallowed"],[[9280,9290],"valid",[],"NV8"],[[9291,9311],"disallowed"],[[9312,9312],"mapped",[49]],[[9313,9313],"mapped",[50]],[[9314,9314],"mapped",[51]],[[9315,9315],"mapped",[52]],[[9316,9316],"mapped",[53]],[[9317,9317],"mapped",[54]],[[9318,9318],"mapped",[55]],[[9319,9319],"mapped",[56]],[[9320,9320],"mapped",[57]],[[9321,9321],"mapped",[49,48]],[[9322,9322],"mapped",[49,49]],[[9323,9323],"mapped",[49,50]],[[9324,9324],"mapped",[49,51]],[[9325,9325],"mapped",[49,52]],[[9326,9326],"mapped",[49,53]],[[9327,9327],"mapped",[49,54]],[[9328,9328],"mapped",[49,55]],[[9329,9329],"mapped",[49,56]],[[9330,9330],"mapped",[49,57]],[[9331,9331],"mapped",[50,48]],[[9332,9332],"disallowed_STD3_mapped",[40,49,41]],[[9333,9333],"disallowed_STD3_mapped",[40,50,41]],[[9334,9334],"disallowed_STD3_mapped",[40,51,41]],[[9335,9335],"disallowed_STD3_mapped",[40,52,41]],[[9336,9336],"disallowed_STD3_mapped",[40,53,41]],[[9337,9337],"disallowed_STD3_mapped",[40,54,41]],[[9338,9338],"disallowed_STD3_mapped",[40,55,41]],[[9339,9339],"disallowed_STD3_mapped",[40,56,41]],[[9340,9340],"disallowed_STD3_mapped",[40,57,41]],[[9341,9341],"disallowed_STD3_mapped",[40,49,48,41]],[[9342,9342],"disallowed_STD3_mapped",[40,49,49,41]],[[9343,9343],"disallowed_STD3_mapped",[40,49,50,41]],[[9344,9344],"disallowed_STD3_mapped",[40,49,51,41]],[[9345,9345],"disallowed_STD3_mapped",[40,49,52,41]],[[9346,9346],"disallowed_STD3_mapped",[40,49,53,41]],[[9347,9347],"disallowed_STD3_mapped",[40,49,54,41]],[[9348,9348],"disallowed_STD3_mapped",[40,49,55,41]],[[9349,9349],"disallowed_STD3_mapped",[40,49,56,41]],[[9350,9350],"disallowed_STD3_mapped",[40,49,57,41]],[[9351,9351],"disallowed_STD3_mapped",[40,50,48,41]],[[9352,9371],"disallowed"],[[9372,9372],"disallowed_STD3_mapped",[40,97,41]],[[9373,9373],"disallowed_STD3_mapped",[40,98,41]],[[9374,9374],"disallowed_STD3_mapped",[40,99,41]],[[9375,9375],"disallowed_STD3_mapped",[40,100,41]],[[9376,9376],"disallowed_STD3_mapped",[40,101,41]],[[9377,9377],"disallowed_STD3_mapped",[40,102,41]],[[9378,9378],"disallowed_STD3_mapped",[40,103,41]],[[9379,9379],"disallowed_STD3_mapped",[40,104,41]],[[9380,9380],"disallowed_STD3_mapped",[40,105,41]],[[9381,9381],"disallowed_STD3_mapped",[40,106,41]],[[9382,9382],"disallowed_STD3_mapped",[40,107,41]],[[9383,9383],"disallowed_STD3_mapped",[40,108,41]],[[9384,9384],"disallowed_STD3_mapped",[40,109,41]],[[9385,9385],"disallowed_STD3_mapped",[40,110,41]],[[9386,9386],"disallowed_STD3_mapped",[40,111,41]],[[9387,9387],"disallowed_STD3_mapped",[40,112,41]],[[9388,9388],"disallowed_STD3_mapped",[40,113,41]],[[9389,9389],"disallowed_STD3_mapped",[40,114,41]],[[9390,9390],"disallowed_STD3_mapped",[40,115,41]],[[9391,9391],"disallowed_STD3_mapped",[40,116,41]],[[9392,9392],"disallowed_STD3_mapped",[40,117,41]],[[9393,9393],"disallowed_STD3_mapped",[40,118,41]],[[9394,9394],"disallowed_STD3_mapped",[40,119,41]],[[9395,9395],"disallowed_STD3_mapped",[40,120,41]],[[9396,9396],"disallowed_STD3_mapped",[40,121,41]],[[9397,9397],"disallowed_STD3_mapped",[40,122,41]],[[9398,9398],"mapped",[97]],[[9399,9399],"mapped",[98]],[[9400,9400],"mapped",[99]],[[9401,9401],"mapped",[100]],[[9402,9402],"mapped",[101]],[[9403,9403],"mapped",[102]],[[9404,9404],"mapped",[103]],[[9405,9405],"mapped",[104]],[[9406,9406],"mapped",[105]],[[9407,9407],"mapped",[106]],[[9408,9408],"mapped",[107]],[[9409,9409],"mapped",[108]],[[9410,9410],"mapped",[109]],[[9411,9411],"mapped",[110]],[[9412,9412],"mapped",[111]],[[9413,9413],"mapped",[112]],[[9414,9414],"mapped",[113]],[[9415,9415],"mapped",[114]],[[9416,9416],"mapped",[115]],[[9417,9417],"mapped",[116]],[[9418,9418],"mapped",[117]],[[9419,9419],"mapped",[118]],[[9420,9420],"mapped",[119]],[[9421,9421],"mapped",[120]],[[9422,9422],"mapped",[121]],[[9423,9423],"mapped",[122]],[[9424,9424],"mapped",[97]],[[9425,9425],"mapped",[98]],[[9426,9426],"mapped",[99]],[[9427,9427],"mapped",[100]],[[9428,9428],"mapped",[101]],[[9429,9429],"mapped",[102]],[[9430,9430],"mapped",[103]],[[9431,9431],"mapped",[104]],[[9432,9432],"mapped",[105]],[[9433,9433],"mapped",[106]],[[9434,9434],"mapped",[107]],[[9435,9435],"mapped",[108]],[[9436,9436],"mapped",[109]],[[9437,9437],"mapped",[110]],[[9438,9438],"mapped",[111]],[[9439,9439],"mapped",[112]],[[9440,9440],"mapped",[113]],[[9441,9441],"mapped",[114]],[[9442,9442],"mapped",[115]],[[9443,9443],"mapped",[116]],[[9444,9444],"mapped",[117]],[[9445,9445],"mapped",[118]],[[9446,9446],"mapped",[119]],[[9447,9447],"mapped",[120]],[[9448,9448],"mapped",[121]],[[9449,9449],"mapped",[122]],[[9450,9450],"mapped",[48]],[[9451,9470],"valid",[],"NV8"],[[9471,9471],"valid",[],"NV8"],[[9472,9621],"valid",[],"NV8"],[[9622,9631],"valid",[],"NV8"],[[9632,9711],"valid",[],"NV8"],[[9712,9719],"valid",[],"NV8"],[[9720,9727],"valid",[],"NV8"],[[9728,9747],"valid",[],"NV8"],[[9748,9749],"valid",[],"NV8"],[[9750,9751],"valid",[],"NV8"],[[9752,9752],"valid",[],"NV8"],[[9753,9753],"valid",[],"NV8"],[[9754,9839],"valid",[],"NV8"],[[9840,9841],"valid",[],"NV8"],[[9842,9853],"valid",[],"NV8"],[[9854,9855],"valid",[],"NV8"],[[9856,9865],"valid",[],"NV8"],[[9866,9873],"valid",[],"NV8"],[[9874,9884],"valid",[],"NV8"],[[9885,9885],"valid",[],"NV8"],[[9886,9887],"valid",[],"NV8"],[[9888,9889],"valid",[],"NV8"],[[9890,9905],"valid",[],"NV8"],[[9906,9906],"valid",[],"NV8"],[[9907,9916],"valid",[],"NV8"],[[9917,9919],"valid",[],"NV8"],[[9920,9923],"valid",[],"NV8"],[[9924,9933],"valid",[],"NV8"],[[9934,9934],"valid",[],"NV8"],[[9935,9953],"valid",[],"NV8"],[[9954,9954],"valid",[],"NV8"],[[9955,9955],"valid",[],"NV8"],[[9956,9959],"valid",[],"NV8"],[[9960,9983],"valid",[],"NV8"],[[9984,9984],"valid",[],"NV8"],[[9985,9988],"valid",[],"NV8"],[[9989,9989],"valid",[],"NV8"],[[9990,9993],"valid",[],"NV8"],[[9994,9995],"valid",[],"NV8"],[[9996,10023],"valid",[],"NV8"],[[10024,10024],"valid",[],"NV8"],[[10025,10059],"valid",[],"NV8"],[[10060,10060],"valid",[],"NV8"],[[10061,10061],"valid",[],"NV8"],[[10062,10062],"valid",[],"NV8"],[[10063,10066],"valid",[],"NV8"],[[10067,10069],"valid",[],"NV8"],[[10070,10070],"valid",[],"NV8"],[[10071,10071],"valid",[],"NV8"],[[10072,10078],"valid",[],"NV8"],[[10079,10080],"valid",[],"NV8"],[[10081,10087],"valid",[],"NV8"],[[10088,10101],"valid",[],"NV8"],[[10102,10132],"valid",[],"NV8"],[[10133,10135],"valid",[],"NV8"],[[10136,10159],"valid",[],"NV8"],[[10160,10160],"valid",[],"NV8"],[[10161,10174],"valid",[],"NV8"],[[10175,10175],"valid",[],"NV8"],[[10176,10182],"valid",[],"NV8"],[[10183,10186],"valid",[],"NV8"],[[10187,10187],"valid",[],"NV8"],[[10188,10188],"valid",[],"NV8"],[[10189,10189],"valid",[],"NV8"],[[10190,10191],"valid",[],"NV8"],[[10192,10219],"valid",[],"NV8"],[[10220,10223],"valid",[],"NV8"],[[10224,10239],"valid",[],"NV8"],[[10240,10495],"valid",[],"NV8"],[[10496,10763],"valid",[],"NV8"],[[10764,10764],"mapped",[8747,8747,8747,8747]],[[10765,10867],"valid",[],"NV8"],[[10868,10868],"disallowed_STD3_mapped",[58,58,61]],[[10869,10869],"disallowed_STD3_mapped",[61,61]],[[10870,10870],"disallowed_STD3_mapped",[61,61,61]],[[10871,10971],"valid",[],"NV8"],[[10972,10972],"mapped",[10973,824]],[[10973,11007],"valid",[],"NV8"],[[11008,11021],"valid",[],"NV8"],[[11022,11027],"valid",[],"NV8"],[[11028,11034],"valid",[],"NV8"],[[11035,11039],"valid",[],"NV8"],[[11040,11043],"valid",[],"NV8"],[[11044,11084],"valid",[],"NV8"],[[11085,11087],"valid",[],"NV8"],[[11088,11092],"valid",[],"NV8"],[[11093,11097],"valid",[],"NV8"],[[11098,11123],"valid",[],"NV8"],[[11124,11125],"disallowed"],[[11126,11157],"valid",[],"NV8"],[[11158,11159],"disallowed"],[[11160,11193],"valid",[],"NV8"],[[11194,11196],"disallowed"],[[11197,11208],"valid",[],"NV8"],[[11209,11209],"disallowed"],[[11210,11217],"valid",[],"NV8"],[[11218,11243],"disallowed"],[[11244,11247],"valid",[],"NV8"],[[11248,11263],"disallowed"],[[11264,11264],"mapped",[11312]],[[11265,11265],"mapped",[11313]],[[11266,11266],"mapped",[11314]],[[11267,11267],"mapped",[11315]],[[11268,11268],"mapped",[11316]],[[11269,11269],"mapped",[11317]],[[11270,11270],"mapped",[11318]],[[11271,11271],"mapped",[11319]],[[11272,11272],"mapped",[11320]],[[11273,11273],"mapped",[11321]],[[11274,11274],"mapped",[11322]],[[11275,11275],"mapped",[11323]],[[11276,11276],"mapped",[11324]],[[11277,11277],"mapped",[11325]],[[11278,11278],"mapped",[11326]],[[11279,11279],"mapped",[11327]],[[11280,11280],"mapped",[11328]],[[11281,11281],"mapped",[11329]],[[11282,11282],"mapped",[11330]],[[11283,11283],"mapped",[11331]],[[11284,11284],"mapped",[11332]],[[11285,11285],"mapped",[11333]],[[11286,11286],"mapped",[11334]],[[11287,11287],"mapped",[11335]],[[11288,11288],"mapped",[11336]],[[11289,11289],"mapped",[11337]],[[11290,11290],"mapped",[11338]],[[11291,11291],"mapped",[11339]],[[11292,11292],"mapped",[11340]],[[11293,11293],"mapped",[11341]],[[11294,11294],"mapped",[11342]],[[11295,11295],"mapped",[11343]],[[11296,11296],"mapped",[11344]],[[11297,11297],"mapped",[11345]],[[11298,11298],"mapped",[11346]],[[11299,11299],"mapped",[11347]],[[11300,11300],"mapped",[11348]],[[11301,11301],"mapped",[11349]],[[11302,11302],"mapped",[11350]],[[11303,11303],"mapped",[11351]],[[11304,11304],"mapped",[11352]],[[11305,11305],"mapped",[11353]],[[11306,11306],"mapped",[11354]],[[11307,11307],"mapped",[11355]],[[11308,11308],"mapped",[11356]],[[11309,11309],"mapped",[11357]],[[11310,11310],"mapped",[11358]],[[11311,11311],"disallowed"],[[11312,11358],"valid"],[[11359,11359],"disallowed"],[[11360,11360],"mapped",[11361]],[[11361,11361],"valid"],[[11362,11362],"mapped",[619]],[[11363,11363],"mapped",[7549]],[[11364,11364],"mapped",[637]],[[11365,11366],"valid"],[[11367,11367],"mapped",[11368]],[[11368,11368],"valid"],[[11369,11369],"mapped",[11370]],[[11370,11370],"valid"],[[11371,11371],"mapped",[11372]],[[11372,11372],"valid"],[[11373,11373],"mapped",[593]],[[11374,11374],"mapped",[625]],[[11375,11375],"mapped",[592]],[[11376,11376],"mapped",[594]],[[11377,11377],"valid"],[[11378,11378],"mapped",[11379]],[[11379,11379],"valid"],[[11380,11380],"valid"],[[11381,11381],"mapped",[11382]],[[11382,11383],"valid"],[[11384,11387],"valid"],[[11388,11388],"mapped",[106]],[[11389,11389],"mapped",[118]],[[11390,11390],"mapped",[575]],[[11391,11391],"mapped",[576]],[[11392,11392],"mapped",[11393]],[[11393,11393],"valid"],[[11394,11394],"mapped",[11395]],[[11395,11395],"valid"],[[11396,11396],"mapped",[11397]],[[11397,11397],"valid"],[[11398,11398],"mapped",[11399]],[[11399,11399],"valid"],[[11400,11400],"mapped",[11401]],[[11401,11401],"valid"],[[11402,11402],"mapped",[11403]],[[11403,11403],"valid"],[[11404,11404],"mapped",[11405]],[[11405,11405],"valid"],[[11406,11406],"mapped",[11407]],[[11407,11407],"valid"],[[11408,11408],"mapped",[11409]],[[11409,11409],"valid"],[[11410,11410],"mapped",[11411]],[[11411,11411],"valid"],[[11412,11412],"mapped",[11413]],[[11413,11413],"valid"],[[11414,11414],"mapped",[11415]],[[11415,11415],"valid"],[[11416,11416],"mapped",[11417]],[[11417,11417],"valid"],[[11418,11418],"mapped",[11419]],[[11419,11419],"valid"],[[11420,11420],"mapped",[11421]],[[11421,11421],"valid"],[[11422,11422],"mapped",[11423]],[[11423,11423],"valid"],[[11424,11424],"mapped",[11425]],[[11425,11425],"valid"],[[11426,11426],"mapped",[11427]],[[11427,11427],"valid"],[[11428,11428],"mapped",[11429]],[[11429,11429],"valid"],[[11430,11430],"mapped",[11431]],[[11431,11431],"valid"],[[11432,11432],"mapped",[11433]],[[11433,11433],"valid"],[[11434,11434],"mapped",[11435]],[[11435,11435],"valid"],[[11436,11436],"mapped",[11437]],[[11437,11437],"valid"],[[11438,11438],"mapped",[11439]],[[11439,11439],"valid"],[[11440,11440],"mapped",[11441]],[[11441,11441],"valid"],[[11442,11442],"mapped",[11443]],[[11443,11443],"valid"],[[11444,11444],"mapped",[11445]],[[11445,11445],"valid"],[[11446,11446],"mapped",[11447]],[[11447,11447],"valid"],[[11448,11448],"mapped",[11449]],[[11449,11449],"valid"],[[11450,11450],"mapped",[11451]],[[11451,11451],"valid"],[[11452,11452],"mapped",[11453]],[[11453,11453],"valid"],[[11454,11454],"mapped",[11455]],[[11455,11455],"valid"],[[11456,11456],"mapped",[11457]],[[11457,11457],"valid"],[[11458,11458],"mapped",[11459]],[[11459,11459],"valid"],[[11460,11460],"mapped",[11461]],[[11461,11461],"valid"],[[11462,11462],"mapped",[11463]],[[11463,11463],"valid"],[[11464,11464],"mapped",[11465]],[[11465,11465],"valid"],[[11466,11466],"mapped",[11467]],[[11467,11467],"valid"],[[11468,11468],"mapped",[11469]],[[11469,11469],"valid"],[[11470,11470],"mapped",[11471]],[[11471,11471],"valid"],[[11472,11472],"mapped",[11473]],[[11473,11473],"valid"],[[11474,11474],"mapped",[11475]],[[11475,11475],"valid"],[[11476,11476],"mapped",[11477]],[[11477,11477],"valid"],[[11478,11478],"mapped",[11479]],[[11479,11479],"valid"],[[11480,11480],"mapped",[11481]],[[11481,11481],"valid"],[[11482,11482],"mapped",[11483]],[[11483,11483],"valid"],[[11484,11484],"mapped",[11485]],[[11485,11485],"valid"],[[11486,11486],"mapped",[11487]],[[11487,11487],"valid"],[[11488,11488],"mapped",[11489]],[[11489,11489],"valid"],[[11490,11490],"mapped",[11491]],[[11491,11492],"valid"],[[11493,11498],"valid",[],"NV8"],[[11499,11499],"mapped",[11500]],[[11500,11500],"valid"],[[11501,11501],"mapped",[11502]],[[11502,11505],"valid"],[[11506,11506],"mapped",[11507]],[[11507,11507],"valid"],[[11508,11512],"disallowed"],[[11513,11519],"valid",[],"NV8"],[[11520,11557],"valid"],[[11558,11558],"disallowed"],[[11559,11559],"valid"],[[11560,11564],"disallowed"],[[11565,11565],"valid"],[[11566,11567],"disallowed"],[[11568,11621],"valid"],[[11622,11623],"valid"],[[11624,11630],"disallowed"],[[11631,11631],"mapped",[11617]],[[11632,11632],"valid",[],"NV8"],[[11633,11646],"disallowed"],[[11647,11647],"valid"],[[11648,11670],"valid"],[[11671,11679],"disallowed"],[[11680,11686],"valid"],[[11687,11687],"disallowed"],[[11688,11694],"valid"],[[11695,11695],"disallowed"],[[11696,11702],"valid"],[[11703,11703],"disallowed"],[[11704,11710],"valid"],[[11711,11711],"disallowed"],[[11712,11718],"valid"],[[11719,11719],"disallowed"],[[11720,11726],"valid"],[[11727,11727],"disallowed"],[[11728,11734],"valid"],[[11735,11735],"disallowed"],[[11736,11742],"valid"],[[11743,11743],"disallowed"],[[11744,11775],"valid"],[[11776,11799],"valid",[],"NV8"],[[11800,11803],"valid",[],"NV8"],[[11804,11805],"valid",[],"NV8"],[[11806,11822],"valid",[],"NV8"],[[11823,11823],"valid"],[[11824,11824],"valid",[],"NV8"],[[11825,11825],"valid",[],"NV8"],[[11826,11835],"valid",[],"NV8"],[[11836,11842],"valid",[],"NV8"],[[11843,11903],"disallowed"],[[11904,11929],"valid",[],"NV8"],[[11930,11930],"disallowed"],[[11931,11934],"valid",[],"NV8"],[[11935,11935],"mapped",[27597]],[[11936,12018],"valid",[],"NV8"],[[12019,12019],"mapped",[40863]],[[12020,12031],"disallowed"],[[12032,12032],"mapped",[19968]],[[12033,12033],"mapped",[20008]],[[12034,12034],"mapped",[20022]],[[12035,12035],"mapped",[20031]],[[12036,12036],"mapped",[20057]],[[12037,12037],"mapped",[20101]],[[12038,12038],"mapped",[20108]],[[12039,12039],"mapped",[20128]],[[12040,12040],"mapped",[20154]],[[12041,12041],"mapped",[20799]],[[12042,12042],"mapped",[20837]],[[12043,12043],"mapped",[20843]],[[12044,12044],"mapped",[20866]],[[12045,12045],"mapped",[20886]],[[12046,12046],"mapped",[20907]],[[12047,12047],"mapped",[20960]],[[12048,12048],"mapped",[20981]],[[12049,12049],"mapped",[20992]],[[12050,12050],"mapped",[21147]],[[12051,12051],"mapped",[21241]],[[12052,12052],"mapped",[21269]],[[12053,12053],"mapped",[21274]],[[12054,12054],"mapped",[21304]],[[12055,12055],"mapped",[21313]],[[12056,12056],"mapped",[21340]],[[12057,12057],"mapped",[21353]],[[12058,12058],"mapped",[21378]],[[12059,12059],"mapped",[21430]],[[12060,12060],"mapped",[21448]],[[12061,12061],"mapped",[21475]],[[12062,12062],"mapped",[22231]],[[12063,12063],"mapped",[22303]],[[12064,12064],"mapped",[22763]],[[12065,12065],"mapped",[22786]],[[12066,12066],"mapped",[22794]],[[12067,12067],"mapped",[22805]],[[12068,12068],"mapped",[22823]],[[12069,12069],"mapped",[22899]],[[12070,12070],"mapped",[23376]],[[12071,12071],"mapped",[23424]],[[12072,12072],"mapped",[23544]],[[12073,12073],"mapped",[23567]],[[12074,12074],"mapped",[23586]],[[12075,12075],"mapped",[23608]],[[12076,12076],"mapped",[23662]],[[12077,12077],"mapped",[23665]],[[12078,12078],"mapped",[24027]],[[12079,12079],"mapped",[24037]],[[12080,12080],"mapped",[24049]],[[12081,12081],"mapped",[24062]],[[12082,12082],"mapped",[24178]],[[12083,12083],"mapped",[24186]],[[12084,12084],"mapped",[24191]],[[12085,12085],"mapped",[24308]],[[12086,12086],"mapped",[24318]],[[12087,12087],"mapped",[24331]],[[12088,12088],"mapped",[24339]],[[12089,12089],"mapped",[24400]],[[12090,12090],"mapped",[24417]],[[12091,12091],"mapped",[24435]],[[12092,12092],"mapped",[24515]],[[12093,12093],"mapped",[25096]],[[12094,12094],"mapped",[25142]],[[12095,12095],"mapped",[25163]],[[12096,12096],"mapped",[25903]],[[12097,12097],"mapped",[25908]],[[12098,12098],"mapped",[25991]],[[12099,12099],"mapped",[26007]],[[12100,12100],"mapped",[26020]],[[12101,12101],"mapped",[26041]],[[12102,12102],"mapped",[26080]],[[12103,12103],"mapped",[26085]],[[12104,12104],"mapped",[26352]],[[12105,12105],"mapped",[26376]],[[12106,12106],"mapped",[26408]],[[12107,12107],"mapped",[27424]],[[12108,12108],"mapped",[27490]],[[12109,12109],"mapped",[27513]],[[12110,12110],"mapped",[27571]],[[12111,12111],"mapped",[27595]],[[12112,12112],"mapped",[27604]],[[12113,12113],"mapped",[27611]],[[12114,12114],"mapped",[27663]],[[12115,12115],"mapped",[27668]],[[12116,12116],"mapped",[27700]],[[12117,12117],"mapped",[28779]],[[12118,12118],"mapped",[29226]],[[12119,12119],"mapped",[29238]],[[12120,12120],"mapped",[29243]],[[12121,12121],"mapped",[29247]],[[12122,12122],"mapped",[29255]],[[12123,12123],"mapped",[29273]],[[12124,12124],"mapped",[29275]],[[12125,12125],"mapped",[29356]],[[12126,12126],"mapped",[29572]],[[12127,12127],"mapped",[29577]],[[12128,12128],"mapped",[29916]],[[12129,12129],"mapped",[29926]],[[12130,12130],"mapped",[29976]],[[12131,12131],"mapped",[29983]],[[12132,12132],"mapped",[29992]],[[12133,12133],"mapped",[30000]],[[12134,12134],"mapped",[30091]],[[12135,12135],"mapped",[30098]],[[12136,12136],"mapped",[30326]],[[12137,12137],"mapped",[30333]],[[12138,12138],"mapped",[30382]],[[12139,12139],"mapped",[30399]],[[12140,12140],"mapped",[30446]],[[12141,12141],"mapped",[30683]],[[12142,12142],"mapped",[30690]],[[12143,12143],"mapped",[30707]],[[12144,12144],"mapped",[31034]],[[12145,12145],"mapped",[31160]],[[12146,12146],"mapped",[31166]],[[12147,12147],"mapped",[31348]],[[12148,12148],"mapped",[31435]],[[12149,12149],"mapped",[31481]],[[12150,12150],"mapped",[31859]],[[12151,12151],"mapped",[31992]],[[12152,12152],"mapped",[32566]],[[12153,12153],"mapped",[32593]],[[12154,12154],"mapped",[32650]],[[12155,12155],"mapped",[32701]],[[12156,12156],"mapped",[32769]],[[12157,12157],"mapped",[32780]],[[12158,12158],"mapped",[32786]],[[12159,12159],"mapped",[32819]],[[12160,12160],"mapped",[32895]],[[12161,12161],"mapped",[32905]],[[12162,12162],"mapped",[33251]],[[12163,12163],"mapped",[33258]],[[12164,12164],"mapped",[33267]],[[12165,12165],"mapped",[33276]],[[12166,12166],"mapped",[33292]],[[12167,12167],"mapped",[33307]],[[12168,12168],"mapped",[33311]],[[12169,12169],"mapped",[33390]],[[12170,12170],"mapped",[33394]],[[12171,12171],"mapped",[33400]],[[12172,12172],"mapped",[34381]],[[12173,12173],"mapped",[34411]],[[12174,12174],"mapped",[34880]],[[12175,12175],"mapped",[34892]],[[12176,12176],"mapped",[34915]],[[12177,12177],"mapped",[35198]],[[12178,12178],"mapped",[35211]],[[12179,12179],"mapped",[35282]],[[12180,12180],"mapped",[35328]],[[12181,12181],"mapped",[35895]],[[12182,12182],"mapped",[35910]],[[12183,12183],"mapped",[35925]],[[12184,12184],"mapped",[35960]],[[12185,12185],"mapped",[35997]],[[12186,12186],"mapped",[36196]],[[12187,12187],"mapped",[36208]],[[12188,12188],"mapped",[36275]],[[12189,12189],"mapped",[36523]],[[12190,12190],"mapped",[36554]],[[12191,12191],"mapped",[36763]],[[12192,12192],"mapped",[36784]],[[12193,12193],"mapped",[36789]],[[12194,12194],"mapped",[37009]],[[12195,12195],"mapped",[37193]],[[12196,12196],"mapped",[37318]],[[12197,12197],"mapped",[37324]],[[12198,12198],"mapped",[37329]],[[12199,12199],"mapped",[38263]],[[12200,12200],"mapped",[38272]],[[12201,12201],"mapped",[38428]],[[12202,12202],"mapped",[38582]],[[12203,12203],"mapped",[38585]],[[12204,12204],"mapped",[38632]],[[12205,12205],"mapped",[38737]],[[12206,12206],"mapped",[38750]],[[12207,12207],"mapped",[38754]],[[12208,12208],"mapped",[38761]],[[12209,12209],"mapped",[38859]],[[12210,12210],"mapped",[38893]],[[12211,12211],"mapped",[38899]],[[12212,12212],"mapped",[38913]],[[12213,12213],"mapped",[39080]],[[12214,12214],"mapped",[39131]],[[12215,12215],"mapped",[39135]],[[12216,12216],"mapped",[39318]],[[12217,12217],"mapped",[39321]],[[12218,12218],"mapped",[39340]],[[12219,12219],"mapped",[39592]],[[12220,12220],"mapped",[39640]],[[12221,12221],"mapped",[39647]],[[12222,12222],"mapped",[39717]],[[12223,12223],"mapped",[39727]],[[12224,12224],"mapped",[39730]],[[12225,12225],"mapped",[39740]],[[12226,12226],"mapped",[39770]],[[12227,12227],"mapped",[40165]],[[12228,12228],"mapped",[40565]],[[12229,12229],"mapped",[40575]],[[12230,12230],"mapped",[40613]],[[12231,12231],"mapped",[40635]],[[12232,12232],"mapped",[40643]],[[12233,12233],"mapped",[40653]],[[12234,12234],"mapped",[40657]],[[12235,12235],"mapped",[40697]],[[12236,12236],"mapped",[40701]],[[12237,12237],"mapped",[40718]],[[12238,12238],"mapped",[40723]],[[12239,12239],"mapped",[40736]],[[12240,12240],"mapped",[40763]],[[12241,12241],"mapped",[40778]],[[12242,12242],"mapped",[40786]],[[12243,12243],"mapped",[40845]],[[12244,12244],"mapped",[40860]],[[12245,12245],"mapped",[40864]],[[12246,12271],"disallowed"],[[12272,12283],"disallowed"],[[12284,12287],"disallowed"],[[12288,12288],"disallowed_STD3_mapped",[32]],[[12289,12289],"valid",[],"NV8"],[[12290,12290],"mapped",[46]],[[12291,12292],"valid",[],"NV8"],[[12293,12295],"valid"],[[12296,12329],"valid",[],"NV8"],[[12330,12333],"valid"],[[12334,12341],"valid",[],"NV8"],[[12342,12342],"mapped",[12306]],[[12343,12343],"valid",[],"NV8"],[[12344,12344],"mapped",[21313]],[[12345,12345],"mapped",[21316]],[[12346,12346],"mapped",[21317]],[[12347,12347],"valid",[],"NV8"],[[12348,12348],"valid"],[[12349,12349],"valid",[],"NV8"],[[12350,12350],"valid",[],"NV8"],[[12351,12351],"valid",[],"NV8"],[[12352,12352],"disallowed"],[[12353,12436],"valid"],[[12437,12438],"valid"],[[12439,12440],"disallowed"],[[12441,12442],"valid"],[[12443,12443],"disallowed_STD3_mapped",[32,12441]],[[12444,12444],"disallowed_STD3_mapped",[32,12442]],[[12445,12446],"valid"],[[12447,12447],"mapped",[12424,12426]],[[12448,12448],"valid",[],"NV8"],[[12449,12542],"valid"],[[12543,12543],"mapped",[12467,12488]],[[12544,12548],"disallowed"],[[12549,12588],"valid"],[[12589,12589],"valid"],[[12590,12592],"disallowed"],[[12593,12593],"mapped",[4352]],[[12594,12594],"mapped",[4353]],[[12595,12595],"mapped",[4522]],[[12596,12596],"mapped",[4354]],[[12597,12597],"mapped",[4524]],[[12598,12598],"mapped",[4525]],[[12599,12599],"mapped",[4355]],[[12600,12600],"mapped",[4356]],[[12601,12601],"mapped",[4357]],[[12602,12602],"mapped",[4528]],[[12603,12603],"mapped",[4529]],[[12604,12604],"mapped",[4530]],[[12605,12605],"mapped",[4531]],[[12606,12606],"mapped",[4532]],[[12607,12607],"mapped",[4533]],[[12608,12608],"mapped",[4378]],[[12609,12609],"mapped",[4358]],[[12610,12610],"mapped",[4359]],[[12611,12611],"mapped",[4360]],[[12612,12612],"mapped",[4385]],[[12613,12613],"mapped",[4361]],[[12614,12614],"mapped",[4362]],[[12615,12615],"mapped",[4363]],[[12616,12616],"mapped",[4364]],[[12617,12617],"mapped",[4365]],[[12618,12618],"mapped",[4366]],[[12619,12619],"mapped",[4367]],[[12620,12620],"mapped",[4368]],[[12621,12621],"mapped",[4369]],[[12622,12622],"mapped",[4370]],[[12623,12623],"mapped",[4449]],[[12624,12624],"mapped",[4450]],[[12625,12625],"mapped",[4451]],[[12626,12626],"mapped",[4452]],[[12627,12627],"mapped",[4453]],[[12628,12628],"mapped",[4454]],[[12629,12629],"mapped",[4455]],[[12630,12630],"mapped",[4456]],[[12631,12631],"mapped",[4457]],[[12632,12632],"mapped",[4458]],[[12633,12633],"mapped",[4459]],[[12634,12634],"mapped",[4460]],[[12635,12635],"mapped",[4461]],[[12636,12636],"mapped",[4462]],[[12637,12637],"mapped",[4463]],[[12638,12638],"mapped",[4464]],[[12639,12639],"mapped",[4465]],[[12640,12640],"mapped",[4466]],[[12641,12641],"mapped",[4467]],[[12642,12642],"mapped",[4468]],[[12643,12643],"mapped",[4469]],[[12644,12644],"disallowed"],[[12645,12645],"mapped",[4372]],[[12646,12646],"mapped",[4373]],[[12647,12647],"mapped",[4551]],[[12648,12648],"mapped",[4552]],[[12649,12649],"mapped",[4556]],[[12650,12650],"mapped",[4558]],[[12651,12651],"mapped",[4563]],[[12652,12652],"mapped",[4567]],[[12653,12653],"mapped",[4569]],[[12654,12654],"mapped",[4380]],[[12655,12655],"mapped",[4573]],[[12656,12656],"mapped",[4575]],[[12657,12657],"mapped",[4381]],[[12658,12658],"mapped",[4382]],[[12659,12659],"mapped",[4384]],[[12660,12660],"mapped",[4386]],[[12661,12661],"mapped",[4387]],[[12662,12662],"mapped",[4391]],[[12663,12663],"mapped",[4393]],[[12664,12664],"mapped",[4395]],[[12665,12665],"mapped",[4396]],[[12666,12666],"mapped",[4397]],[[12667,12667],"mapped",[4398]],[[12668,12668],"mapped",[4399]],[[12669,12669],"mapped",[4402]],[[12670,12670],"mapped",[4406]],[[12671,12671],"mapped",[4416]],[[12672,12672],"mapped",[4423]],[[12673,12673],"mapped",[4428]],[[12674,12674],"mapped",[4593]],[[12675,12675],"mapped",[4594]],[[12676,12676],"mapped",[4439]],[[12677,12677],"mapped",[4440]],[[12678,12678],"mapped",[4441]],[[12679,12679],"mapped",[4484]],[[12680,12680],"mapped",[4485]],[[12681,12681],"mapped",[4488]],[[12682,12682],"mapped",[4497]],[[12683,12683],"mapped",[4498]],[[12684,12684],"mapped",[4500]],[[12685,12685],"mapped",[4510]],[[12686,12686],"mapped",[4513]],[[12687,12687],"disallowed"],[[12688,12689],"valid",[],"NV8"],[[12690,12690],"mapped",[19968]],[[12691,12691],"mapped",[20108]],[[12692,12692],"mapped",[19977]],[[12693,12693],"mapped",[22235]],[[12694,12694],"mapped",[19978]],[[12695,12695],"mapped",[20013]],[[12696,12696],"mapped",[19979]],[[12697,12697],"mapped",[30002]],[[12698,12698],"mapped",[20057]],[[12699,12699],"mapped",[19993]],[[12700,12700],"mapped",[19969]],[[12701,12701],"mapped",[22825]],[[12702,12702],"mapped",[22320]],[[12703,12703],"mapped",[20154]],[[12704,12727],"valid"],[[12728,12730],"valid"],[[12731,12735],"disallowed"],[[12736,12751],"valid",[],"NV8"],[[12752,12771],"valid",[],"NV8"],[[12772,12783],"disallowed"],[[12784,12799],"valid"],[[12800,12800],"disallowed_STD3_mapped",[40,4352,41]],[[12801,12801],"disallowed_STD3_mapped",[40,4354,41]],[[12802,12802],"disallowed_STD3_mapped",[40,4355,41]],[[12803,12803],"disallowed_STD3_mapped",[40,4357,41]],[[12804,12804],"disallowed_STD3_mapped",[40,4358,41]],[[12805,12805],"disallowed_STD3_mapped",[40,4359,41]],[[12806,12806],"disallowed_STD3_mapped",[40,4361,41]],[[12807,12807],"disallowed_STD3_mapped",[40,4363,41]],[[12808,12808],"disallowed_STD3_mapped",[40,4364,41]],[[12809,12809],"disallowed_STD3_mapped",[40,4366,41]],[[12810,12810],"disallowed_STD3_mapped",[40,4367,41]],[[12811,12811],"disallowed_STD3_mapped",[40,4368,41]],[[12812,12812],"disallowed_STD3_mapped",[40,4369,41]],[[12813,12813],"disallowed_STD3_mapped",[40,4370,41]],[[12814,12814],"disallowed_STD3_mapped",[40,44032,41]],[[12815,12815],"disallowed_STD3_mapped",[40,45208,41]],[[12816,12816],"disallowed_STD3_mapped",[40,45796,41]],[[12817,12817],"disallowed_STD3_mapped",[40,46972,41]],[[12818,12818],"disallowed_STD3_mapped",[40,47560,41]],[[12819,12819],"disallowed_STD3_mapped",[40,48148,41]],[[12820,12820],"disallowed_STD3_mapped",[40,49324,41]],[[12821,12821],"disallowed_STD3_mapped",[40,50500,41]],[[12822,12822],"disallowed_STD3_mapped",[40,51088,41]],[[12823,12823],"disallowed_STD3_mapped",[40,52264,41]],[[12824,12824],"disallowed_STD3_mapped",[40,52852,41]],[[12825,12825],"disallowed_STD3_mapped",[40,53440,41]],[[12826,12826],"disallowed_STD3_mapped",[40,54028,41]],[[12827,12827],"disallowed_STD3_mapped",[40,54616,41]],[[12828,12828],"disallowed_STD3_mapped",[40,51452,41]],[[12829,12829],"disallowed_STD3_mapped",[40,50724,51204,41]],[[12830,12830],"disallowed_STD3_mapped",[40,50724,54980,41]],[[12831,12831],"disallowed"],[[12832,12832],"disallowed_STD3_mapped",[40,19968,41]],[[12833,12833],"disallowed_STD3_mapped",[40,20108,41]],[[12834,12834],"disallowed_STD3_mapped",[40,19977,41]],[[12835,12835],"disallowed_STD3_mapped",[40,22235,41]],[[12836,12836],"disallowed_STD3_mapped",[40,20116,41]],[[12837,12837],"disallowed_STD3_mapped",[40,20845,41]],[[12838,12838],"disallowed_STD3_mapped",[40,19971,41]],[[12839,12839],"disallowed_STD3_mapped",[40,20843,41]],[[12840,12840],"disallowed_STD3_mapped",[40,20061,41]],[[12841,12841],"disallowed_STD3_mapped",[40,21313,41]],[[12842,12842],"disallowed_STD3_mapped",[40,26376,41]],[[12843,12843],"disallowed_STD3_mapped",[40,28779,41]],[[12844,12844],"disallowed_STD3_mapped",[40,27700,41]],[[12845,12845],"disallowed_STD3_mapped",[40,26408,41]],[[12846,12846],"disallowed_STD3_mapped",[40,37329,41]],[[12847,12847],"disallowed_STD3_mapped",[40,22303,41]],[[12848,12848],"disallowed_STD3_mapped",[40,26085,41]],[[12849,12849],"disallowed_STD3_mapped",[40,26666,41]],[[12850,12850],"disallowed_STD3_mapped",[40,26377,41]],[[12851,12851],"disallowed_STD3_mapped",[40,31038,41]],[[12852,12852],"disallowed_STD3_mapped",[40,21517,41]],[[12853,12853],"disallowed_STD3_mapped",[40,29305,41]],[[12854,12854],"disallowed_STD3_mapped",[40,36001,41]],[[12855,12855],"disallowed_STD3_mapped",[40,31069,41]],[[12856,12856],"disallowed_STD3_mapped",[40,21172,41]],[[12857,12857],"disallowed_STD3_mapped",[40,20195,41]],[[12858,12858],"disallowed_STD3_mapped",[40,21628,41]],[[12859,12859],"disallowed_STD3_mapped",[40,23398,41]],[[12860,12860],"disallowed_STD3_mapped",[40,30435,41]],[[12861,12861],"disallowed_STD3_mapped",[40,20225,41]],[[12862,12862],"disallowed_STD3_mapped",[40,36039,41]],[[12863,12863],"disallowed_STD3_mapped",[40,21332,41]],[[12864,12864],"disallowed_STD3_mapped",[40,31085,41]],[[12865,12865],"disallowed_STD3_mapped",[40,20241,41]],[[12866,12866],"disallowed_STD3_mapped",[40,33258,41]],[[12867,12867],"disallowed_STD3_mapped",[40,33267,41]],[[12868,12868],"mapped",[21839]],[[12869,12869],"mapped",[24188]],[[12870,12870],"mapped",[25991]],[[12871,12871],"mapped",[31631]],[[12872,12879],"valid",[],"NV8"],[[12880,12880],"mapped",[112,116,101]],[[12881,12881],"mapped",[50,49]],[[12882,12882],"mapped",[50,50]],[[12883,12883],"mapped",[50,51]],[[12884,12884],"mapped",[50,52]],[[12885,12885],"mapped",[50,53]],[[12886,12886],"mapped",[50,54]],[[12887,12887],"mapped",[50,55]],[[12888,12888],"mapped",[50,56]],[[12889,12889],"mapped",[50,57]],[[12890,12890],"mapped",[51,48]],[[12891,12891],"mapped",[51,49]],[[12892,12892],"mapped",[51,50]],[[12893,12893],"mapped",[51,51]],[[12894,12894],"mapped",[51,52]],[[12895,12895],"mapped",[51,53]],[[12896,12896],"mapped",[4352]],[[12897,12897],"mapped",[4354]],[[12898,12898],"mapped",[4355]],[[12899,12899],"mapped",[4357]],[[12900,12900],"mapped",[4358]],[[12901,12901],"mapped",[4359]],[[12902,12902],"mapped",[4361]],[[12903,12903],"mapped",[4363]],[[12904,12904],"mapped",[4364]],[[12905,12905],"mapped",[4366]],[[12906,12906],"mapped",[4367]],[[12907,12907],"mapped",[4368]],[[12908,12908],"mapped",[4369]],[[12909,12909],"mapped",[4370]],[[12910,12910],"mapped",[44032]],[[12911,12911],"mapped",[45208]],[[12912,12912],"mapped",[45796]],[[12913,12913],"mapped",[46972]],[[12914,12914],"mapped",[47560]],[[12915,12915],"mapped",[48148]],[[12916,12916],"mapped",[49324]],[[12917,12917],"mapped",[50500]],[[12918,12918],"mapped",[51088]],[[12919,12919],"mapped",[52264]],[[12920,12920],"mapped",[52852]],[[12921,12921],"mapped",[53440]],[[12922,12922],"mapped",[54028]],[[12923,12923],"mapped",[54616]],[[12924,12924],"mapped",[52280,44256]],[[12925,12925],"mapped",[51452,51032]],[[12926,12926],"mapped",[50864]],[[12927,12927],"valid",[],"NV8"],[[12928,12928],"mapped",[19968]],[[12929,12929],"mapped",[20108]],[[12930,12930],"mapped",[19977]],[[12931,12931],"mapped",[22235]],[[12932,12932],"mapped",[20116]],[[12933,12933],"mapped",[20845]],[[12934,12934],"mapped",[19971]],[[12935,12935],"mapped",[20843]],[[12936,12936],"mapped",[20061]],[[12937,12937],"mapped",[21313]],[[12938,12938],"mapped",[26376]],[[12939,12939],"mapped",[28779]],[[12940,12940],"mapped",[27700]],[[12941,12941],"mapped",[26408]],[[12942,12942],"mapped",[37329]],[[12943,12943],"mapped",[22303]],[[12944,12944],"mapped",[26085]],[[12945,12945],"mapped",[26666]],[[12946,12946],"mapped",[26377]],[[12947,12947],"mapped",[31038]],[[12948,12948],"mapped",[21517]],[[12949,12949],"mapped",[29305]],[[12950,12950],"mapped",[36001]],[[12951,12951],"mapped",[31069]],[[12952,12952],"mapped",[21172]],[[12953,12953],"mapped",[31192]],[[12954,12954],"mapped",[30007]],[[12955,12955],"mapped",[22899]],[[12956,12956],"mapped",[36969]],[[12957,12957],"mapped",[20778]],[[12958,12958],"mapped",[21360]],[[12959,12959],"mapped",[27880]],[[12960,12960],"mapped",[38917]],[[12961,12961],"mapped",[20241]],[[12962,12962],"mapped",[20889]],[[12963,12963],"mapped",[27491]],[[12964,12964],"mapped",[19978]],[[12965,12965],"mapped",[20013]],[[12966,12966],"mapped",[19979]],[[12967,12967],"mapped",[24038]],[[12968,12968],"mapped",[21491]],[[12969,12969],"mapped",[21307]],[[12970,12970],"mapped",[23447]],[[12971,12971],"mapped",[23398]],[[12972,12972],"mapped",[30435]],[[12973,12973],"mapped",[20225]],[[12974,12974],"mapped",[36039]],[[12975,12975],"mapped",[21332]],[[12976,12976],"mapped",[22812]],[[12977,12977],"mapped",[51,54]],[[12978,12978],"mapped",[51,55]],[[12979,12979],"mapped",[51,56]],[[12980,12980],"mapped",[51,57]],[[12981,12981],"mapped",[52,48]],[[12982,12982],"mapped",[52,49]],[[12983,12983],"mapped",[52,50]],[[12984,12984],"mapped",[52,51]],[[12985,12985],"mapped",[52,52]],[[12986,12986],"mapped",[52,53]],[[12987,12987],"mapped",[52,54]],[[12988,12988],"mapped",[52,55]],[[12989,12989],"mapped",[52,56]],[[12990,12990],"mapped",[52,57]],[[12991,12991],"mapped",[53,48]],[[12992,12992],"mapped",[49,26376]],[[12993,12993],"mapped",[50,26376]],[[12994,12994],"mapped",[51,26376]],[[12995,12995],"mapped",[52,26376]],[[12996,12996],"mapped",[53,26376]],[[12997,12997],"mapped",[54,26376]],[[12998,12998],"mapped",[55,26376]],[[12999,12999],"mapped",[56,26376]],[[13000,13000],"mapped",[57,26376]],[[13001,13001],"mapped",[49,48,26376]],[[13002,13002],"mapped",[49,49,26376]],[[13003,13003],"mapped",[49,50,26376]],[[13004,13004],"mapped",[104,103]],[[13005,13005],"mapped",[101,114,103]],[[13006,13006],"mapped",[101,118]],[[13007,13007],"mapped",[108,116,100]],[[13008,13008],"mapped",[12450]],[[13009,13009],"mapped",[12452]],[[13010,13010],"mapped",[12454]],[[13011,13011],"mapped",[12456]],[[13012,13012],"mapped",[12458]],[[13013,13013],"mapped",[12459]],[[13014,13014],"mapped",[12461]],[[13015,13015],"mapped",[12463]],[[13016,13016],"mapped",[12465]],[[13017,13017],"mapped",[12467]],[[13018,13018],"mapped",[12469]],[[13019,13019],"mapped",[12471]],[[13020,13020],"mapped",[12473]],[[13021,13021],"mapped",[12475]],[[13022,13022],"mapped",[12477]],[[13023,13023],"mapped",[12479]],[[13024,13024],"mapped",[12481]],[[13025,13025],"mapped",[12484]],[[13026,13026],"mapped",[12486]],[[13027,13027],"mapped",[12488]],[[13028,13028],"mapped",[12490]],[[13029,13029],"mapped",[12491]],[[13030,13030],"mapped",[12492]],[[13031,13031],"mapped",[12493]],[[13032,13032],"mapped",[12494]],[[13033,13033],"mapped",[12495]],[[13034,13034],"mapped",[12498]],[[13035,13035],"mapped",[12501]],[[13036,13036],"mapped",[12504]],[[13037,13037],"mapped",[12507]],[[13038,13038],"mapped",[12510]],[[13039,13039],"mapped",[12511]],[[13040,13040],"mapped",[12512]],[[13041,13041],"mapped",[12513]],[[13042,13042],"mapped",[12514]],[[13043,13043],"mapped",[12516]],[[13044,13044],"mapped",[12518]],[[13045,13045],"mapped",[12520]],[[13046,13046],"mapped",[12521]],[[13047,13047],"mapped",[12522]],[[13048,13048],"mapped",[12523]],[[13049,13049],"mapped",[12524]],[[13050,13050],"mapped",[12525]],[[13051,13051],"mapped",[12527]],[[13052,13052],"mapped",[12528]],[[13053,13053],"mapped",[12529]],[[13054,13054],"mapped",[12530]],[[13055,13055],"disallowed"],[[13056,13056],"mapped",[12450,12497,12540,12488]],[[13057,13057],"mapped",[12450,12523,12501,12449]],[[13058,13058],"mapped",[12450,12531,12506,12450]],[[13059,13059],"mapped",[12450,12540,12523]],[[13060,13060],"mapped",[12452,12491,12531,12464]],[[13061,13061],"mapped",[12452,12531,12481]],[[13062,13062],"mapped",[12454,12457,12531]],[[13063,13063],"mapped",[12456,12473,12463,12540,12489]],[[13064,13064],"mapped",[12456,12540,12459,12540]],[[13065,13065],"mapped",[12458,12531,12473]],[[13066,13066],"mapped",[12458,12540,12512]],[[13067,13067],"mapped",[12459,12452,12522]],[[13068,13068],"mapped",[12459,12521,12483,12488]],[[13069,13069],"mapped",[12459,12525,12522,12540]],[[13070,13070],"mapped",[12460,12525,12531]],[[13071,13071],"mapped",[12460,12531,12510]],[[13072,13072],"mapped",[12462,12460]],[[13073,13073],"mapped",[12462,12491,12540]],[[13074,13074],"mapped",[12461,12517,12522,12540]],[[13075,13075],"mapped",[12462,12523,12480,12540]],[[13076,13076],"mapped",[12461,12525]],[[13077,13077],"mapped",[12461,12525,12464,12521,12512]],[[13078,13078],"mapped",[12461,12525,12513,12540,12488,12523]],[[13079,13079],"mapped",[12461,12525,12527,12483,12488]],[[13080,13080],"mapped",[12464,12521,12512]],[[13081,13081],"mapped",[12464,12521,12512,12488,12531]],[[13082,13082],"mapped",[12463,12523,12476,12452,12525]],[[13083,13083],"mapped",[12463,12525,12540,12493]],[[13084,13084],"mapped",[12465,12540,12473]],[[13085,13085],"mapped",[12467,12523,12490]],[[13086,13086],"mapped",[12467,12540,12509]],[[13087,13087],"mapped",[12469,12452,12463,12523]],[[13088,13088],"mapped",[12469,12531,12481,12540,12512]],[[13089,13089],"mapped",[12471,12522,12531,12464]],[[13090,13090],"mapped",[12475,12531,12481]],[[13091,13091],"mapped",[12475,12531,12488]],[[13092,13092],"mapped",[12480,12540,12473]],[[13093,13093],"mapped",[12487,12471]],[[13094,13094],"mapped",[12489,12523]],[[13095,13095],"mapped",[12488,12531]],[[13096,13096],"mapped",[12490,12494]],[[13097,13097],"mapped",[12494,12483,12488]],[[13098,13098],"mapped",[12495,12452,12484]],[[13099,13099],"mapped",[12497,12540,12475,12531,12488]],[[13100,13100],"mapped",[12497,12540,12484]],[[13101,13101],"mapped",[12496,12540,12524,12523]],[[13102,13102],"mapped",[12500,12450,12473,12488,12523]],[[13103,13103],"mapped",[12500,12463,12523]],[[13104,13104],"mapped",[12500,12467]],[[13105,13105],"mapped",[12499,12523]],[[13106,13106],"mapped",[12501,12449,12521,12483,12489]],[[13107,13107],"mapped",[12501,12451,12540,12488]],[[13108,13108],"mapped",[12502,12483,12471,12455,12523]],[[13109,13109],"mapped",[12501,12521,12531]],[[13110,13110],"mapped",[12504,12463,12479,12540,12523]],[[13111,13111],"mapped",[12506,12477]],[[13112,13112],"mapped",[12506,12491,12498]],[[13113,13113],"mapped",[12504,12523,12484]],[[13114,13114],"mapped",[12506,12531,12473]],[[13115,13115],"mapped",[12506,12540,12472]],[[13116,13116],"mapped",[12505,12540,12479]],[[13117,13117],"mapped",[12509,12452,12531,12488]],[[13118,13118],"mapped",[12508,12523,12488]],[[13119,13119],"mapped",[12507,12531]],[[13120,13120],"mapped",[12509,12531,12489]],[[13121,13121],"mapped",[12507,12540,12523]],[[13122,13122],"mapped",[12507,12540,12531]],[[13123,13123],"mapped",[12510,12452,12463,12525]],[[13124,13124],"mapped",[12510,12452,12523]],[[13125,13125],"mapped",[12510,12483,12495]],[[13126,13126],"mapped",[12510,12523,12463]],[[13127,13127],"mapped",[12510,12531,12471,12519,12531]],[[13128,13128],"mapped",[12511,12463,12525,12531]],[[13129,13129],"mapped",[12511,12522]],[[13130,13130],"mapped",[12511,12522,12496,12540,12523]],[[13131,13131],"mapped",[12513,12460]],[[13132,13132],"mapped",[12513,12460,12488,12531]],[[13133,13133],"mapped",[12513,12540,12488,12523]],[[13134,13134],"mapped",[12516,12540,12489]],[[13135,13135],"mapped",[12516,12540,12523]],[[13136,13136],"mapped",[12518,12450,12531]],[[13137,13137],"mapped",[12522,12483,12488,12523]],[[13138,13138],"mapped",[12522,12521]],[[13139,13139],"mapped",[12523,12500,12540]],[[13140,13140],"mapped",[12523,12540,12502,12523]],[[13141,13141],"mapped",[12524,12512]],[[13142,13142],"mapped",[12524,12531,12488,12466,12531]],[[13143,13143],"mapped",[12527,12483,12488]],[[13144,13144],"mapped",[48,28857]],[[13145,13145],"mapped",[49,28857]],[[13146,13146],"mapped",[50,28857]],[[13147,13147],"mapped",[51,28857]],[[13148,13148],"mapped",[52,28857]],[[13149,13149],"mapped",[53,28857]],[[13150,13150],"mapped",[54,28857]],[[13151,13151],"mapped",[55,28857]],[[13152,13152],"mapped",[56,28857]],[[13153,13153],"mapped",[57,28857]],[[13154,13154],"mapped",[49,48,28857]],[[13155,13155],"mapped",[49,49,28857]],[[13156,13156],"mapped",[49,50,28857]],[[13157,13157],"mapped",[49,51,28857]],[[13158,13158],"mapped",[49,52,28857]],[[13159,13159],"mapped",[49,53,28857]],[[13160,13160],"mapped",[49,54,28857]],[[13161,13161],"mapped",[49,55,28857]],[[13162,13162],"mapped",[49,56,28857]],[[13163,13163],"mapped",[49,57,28857]],[[13164,13164],"mapped",[50,48,28857]],[[13165,13165],"mapped",[50,49,28857]],[[13166,13166],"mapped",[50,50,28857]],[[13167,13167],"mapped",[50,51,28857]],[[13168,13168],"mapped",[50,52,28857]],[[13169,13169],"mapped",[104,112,97]],[[13170,13170],"mapped",[100,97]],[[13171,13171],"mapped",[97,117]],[[13172,13172],"mapped",[98,97,114]],[[13173,13173],"mapped",[111,118]],[[13174,13174],"mapped",[112,99]],[[13175,13175],"mapped",[100,109]],[[13176,13176],"mapped",[100,109,50]],[[13177,13177],"mapped",[100,109,51]],[[13178,13178],"mapped",[105,117]],[[13179,13179],"mapped",[24179,25104]],[[13180,13180],"mapped",[26157,21644]],[[13181,13181],"mapped",[22823,27491]],[[13182,13182],"mapped",[26126,27835]],[[13183,13183],"mapped",[26666,24335,20250,31038]],[[13184,13184],"mapped",[112,97]],[[13185,13185],"mapped",[110,97]],[[13186,13186],"mapped",[956,97]],[[13187,13187],"mapped",[109,97]],[[13188,13188],"mapped",[107,97]],[[13189,13189],"mapped",[107,98]],[[13190,13190],"mapped",[109,98]],[[13191,13191],"mapped",[103,98]],[[13192,13192],"mapped",[99,97,108]],[[13193,13193],"mapped",[107,99,97,108]],[[13194,13194],"mapped",[112,102]],[[13195,13195],"mapped",[110,102]],[[13196,13196],"mapped",[956,102]],[[13197,13197],"mapped",[956,103]],[[13198,13198],"mapped",[109,103]],[[13199,13199],"mapped",[107,103]],[[13200,13200],"mapped",[104,122]],[[13201,13201],"mapped",[107,104,122]],[[13202,13202],"mapped",[109,104,122]],[[13203,13203],"mapped",[103,104,122]],[[13204,13204],"mapped",[116,104,122]],[[13205,13205],"mapped",[956,108]],[[13206,13206],"mapped",[109,108]],[[13207,13207],"mapped",[100,108]],[[13208,13208],"mapped",[107,108]],[[13209,13209],"mapped",[102,109]],[[13210,13210],"mapped",[110,109]],[[13211,13211],"mapped",[956,109]],[[13212,13212],"mapped",[109,109]],[[13213,13213],"mapped",[99,109]],[[13214,13214],"mapped",[107,109]],[[13215,13215],"mapped",[109,109,50]],[[13216,13216],"mapped",[99,109,50]],[[13217,13217],"mapped",[109,50]],[[13218,13218],"mapped",[107,109,50]],[[13219,13219],"mapped",[109,109,51]],[[13220,13220],"mapped",[99,109,51]],[[13221,13221],"mapped",[109,51]],[[13222,13222],"mapped",[107,109,51]],[[13223,13223],"mapped",[109,8725,115]],[[13224,13224],"mapped",[109,8725,115,50]],[[13225,13225],"mapped",[112,97]],[[13226,13226],"mapped",[107,112,97]],[[13227,13227],"mapped",[109,112,97]],[[13228,13228],"mapped",[103,112,97]],[[13229,13229],"mapped",[114,97,100]],[[13230,13230],"mapped",[114,97,100,8725,115]],[[13231,13231],"mapped",[114,97,100,8725,115,50]],[[13232,13232],"mapped",[112,115]],[[13233,13233],"mapped",[110,115]],[[13234,13234],"mapped",[956,115]],[[13235,13235],"mapped",[109,115]],[[13236,13236],"mapped",[112,118]],[[13237,13237],"mapped",[110,118]],[[13238,13238],"mapped",[956,118]],[[13239,13239],"mapped",[109,118]],[[13240,13240],"mapped",[107,118]],[[13241,13241],"mapped",[109,118]],[[13242,13242],"mapped",[112,119]],[[13243,13243],"mapped",[110,119]],[[13244,13244],"mapped",[956,119]],[[13245,13245],"mapped",[109,119]],[[13246,13246],"mapped",[107,119]],[[13247,13247],"mapped",[109,119]],[[13248,13248],"mapped",[107,969]],[[13249,13249],"mapped",[109,969]],[[13250,13250],"disallowed"],[[13251,13251],"mapped",[98,113]],[[13252,13252],"mapped",[99,99]],[[13253,13253],"mapped",[99,100]],[[13254,13254],"mapped",[99,8725,107,103]],[[13255,13255],"disallowed"],[[13256,13256],"mapped",[100,98]],[[13257,13257],"mapped",[103,121]],[[13258,13258],"mapped",[104,97]],[[13259,13259],"mapped",[104,112]],[[13260,13260],"mapped",[105,110]],[[13261,13261],"mapped",[107,107]],[[13262,13262],"mapped",[107,109]],[[13263,13263],"mapped",[107,116]],[[13264,13264],"mapped",[108,109]],[[13265,13265],"mapped",[108,110]],[[13266,13266],"mapped",[108,111,103]],[[13267,13267],"mapped",[108,120]],[[13268,13268],"mapped",[109,98]],[[13269,13269],"mapped",[109,105,108]],[[13270,13270],"mapped",[109,111,108]],[[13271,13271],"mapped",[112,104]],[[13272,13272],"disallowed"],[[13273,13273],"mapped",[112,112,109]],[[13274,13274],"mapped",[112,114]],[[13275,13275],"mapped",[115,114]],[[13276,13276],"mapped",[115,118]],[[13277,13277],"mapped",[119,98]],[[13278,13278],"mapped",[118,8725,109]],[[13279,13279],"mapped",[97,8725,109]],[[13280,13280],"mapped",[49,26085]],[[13281,13281],"mapped",[50,26085]],[[13282,13282],"mapped",[51,26085]],[[13283,13283],"mapped",[52,26085]],[[13284,13284],"mapped",[53,26085]],[[13285,13285],"mapped",[54,26085]],[[13286,13286],"mapped",[55,26085]],[[13287,13287],"mapped",[56,26085]],[[13288,13288],"mapped",[57,26085]],[[13289,13289],"mapped",[49,48,26085]],[[13290,13290],"mapped",[49,49,26085]],[[13291,13291],"mapped",[49,50,26085]],[[13292,13292],"mapped",[49,51,26085]],[[13293,13293],"mapped",[49,52,26085]],[[13294,13294],"mapped",[49,53,26085]],[[13295,13295],"mapped",[49,54,26085]],[[13296,13296],"mapped",[49,55,26085]],[[13297,13297],"mapped",[49,56,26085]],[[13298,13298],"mapped",[49,57,26085]],[[13299,13299],"mapped",[50,48,26085]],[[13300,13300],"mapped",[50,49,26085]],[[13301,13301],"mapped",[50,50,26085]],[[13302,13302],"mapped",[50,51,26085]],[[13303,13303],"mapped",[50,52,26085]],[[13304,13304],"mapped",[50,53,26085]],[[13305,13305],"mapped",[50,54,26085]],[[13306,13306],"mapped",[50,55,26085]],[[13307,13307],"mapped",[50,56,26085]],[[13308,13308],"mapped",[50,57,26085]],[[13309,13309],"mapped",[51,48,26085]],[[13310,13310],"mapped",[51,49,26085]],[[13311,13311],"mapped",[103,97,108]],[[13312,19893],"valid"],[[19894,19903],"disallowed"],[[19904,19967],"valid",[],"NV8"],[[19968,40869],"valid"],[[40870,40891],"valid"],[[40892,40899],"valid"],[[40900,40907],"valid"],[[40908,40908],"valid"],[[40909,40917],"valid"],[[40918,40959],"disallowed"],[[40960,42124],"valid"],[[42125,42127],"disallowed"],[[42128,42145],"valid",[],"NV8"],[[42146,42147],"valid",[],"NV8"],[[42148,42163],"valid",[],"NV8"],[[42164,42164],"valid",[],"NV8"],[[42165,42176],"valid",[],"NV8"],[[42177,42177],"valid",[],"NV8"],[[42178,42180],"valid",[],"NV8"],[[42181,42181],"valid",[],"NV8"],[[42182,42182],"valid",[],"NV8"],[[42183,42191],"disallowed"],[[42192,42237],"valid"],[[42238,42239],"valid",[],"NV8"],[[42240,42508],"valid"],[[42509,42511],"valid",[],"NV8"],[[42512,42539],"valid"],[[42540,42559],"disallowed"],[[42560,42560],"mapped",[42561]],[[42561,42561],"valid"],[[42562,42562],"mapped",[42563]],[[42563,42563],"valid"],[[42564,42564],"mapped",[42565]],[[42565,42565],"valid"],[[42566,42566],"mapped",[42567]],[[42567,42567],"valid"],[[42568,42568],"mapped",[42569]],[[42569,42569],"valid"],[[42570,42570],"mapped",[42571]],[[42571,42571],"valid"],[[42572,42572],"mapped",[42573]],[[42573,42573],"valid"],[[42574,42574],"mapped",[42575]],[[42575,42575],"valid"],[[42576,42576],"mapped",[42577]],[[42577,42577],"valid"],[[42578,42578],"mapped",[42579]],[[42579,42579],"valid"],[[42580,42580],"mapped",[42581]],[[42581,42581],"valid"],[[42582,42582],"mapped",[42583]],[[42583,42583],"valid"],[[42584,42584],"mapped",[42585]],[[42585,42585],"valid"],[[42586,42586],"mapped",[42587]],[[42587,42587],"valid"],[[42588,42588],"mapped",[42589]],[[42589,42589],"valid"],[[42590,42590],"mapped",[42591]],[[42591,42591],"valid"],[[42592,42592],"mapped",[42593]],[[42593,42593],"valid"],[[42594,42594],"mapped",[42595]],[[42595,42595],"valid"],[[42596,42596],"mapped",[42597]],[[42597,42597],"valid"],[[42598,42598],"mapped",[42599]],[[42599,42599],"valid"],[[42600,42600],"mapped",[42601]],[[42601,42601],"valid"],[[42602,42602],"mapped",[42603]],[[42603,42603],"valid"],[[42604,42604],"mapped",[42605]],[[42605,42607],"valid"],[[42608,42611],"valid",[],"NV8"],[[42612,42619],"valid"],[[42620,42621],"valid"],[[42622,42622],"valid",[],"NV8"],[[42623,42623],"valid"],[[42624,42624],"mapped",[42625]],[[42625,42625],"valid"],[[42626,42626],"mapped",[42627]],[[42627,42627],"valid"],[[42628,42628],"mapped",[42629]],[[42629,42629],"valid"],[[42630,42630],"mapped",[42631]],[[42631,42631],"valid"],[[42632,42632],"mapped",[42633]],[[42633,42633],"valid"],[[42634,42634],"mapped",[42635]],[[42635,42635],"valid"],[[42636,42636],"mapped",[42637]],[[42637,42637],"valid"],[[42638,42638],"mapped",[42639]],[[42639,42639],"valid"],[[42640,42640],"mapped",[42641]],[[42641,42641],"valid"],[[42642,42642],"mapped",[42643]],[[42643,42643],"valid"],[[42644,42644],"mapped",[42645]],[[42645,42645],"valid"],[[42646,42646],"mapped",[42647]],[[42647,42647],"valid"],[[42648,42648],"mapped",[42649]],[[42649,42649],"valid"],[[42650,42650],"mapped",[42651]],[[42651,42651],"valid"],[[42652,42652],"mapped",[1098]],[[42653,42653],"mapped",[1100]],[[42654,42654],"valid"],[[42655,42655],"valid"],[[42656,42725],"valid"],[[42726,42735],"valid",[],"NV8"],[[42736,42737],"valid"],[[42738,42743],"valid",[],"NV8"],[[42744,42751],"disallowed"],[[42752,42774],"valid",[],"NV8"],[[42775,42778],"valid"],[[42779,42783],"valid"],[[42784,42785],"valid",[],"NV8"],[[42786,42786],"mapped",[42787]],[[42787,42787],"valid"],[[42788,42788],"mapped",[42789]],[[42789,42789],"valid"],[[42790,42790],"mapped",[42791]],[[42791,42791],"valid"],[[42792,42792],"mapped",[42793]],[[42793,42793],"valid"],[[42794,42794],"mapped",[42795]],[[42795,42795],"valid"],[[42796,42796],"mapped",[42797]],[[42797,42797],"valid"],[[42798,42798],"mapped",[42799]],[[42799,42801],"valid"],[[42802,42802],"mapped",[42803]],[[42803,42803],"valid"],[[42804,42804],"mapped",[42805]],[[42805,42805],"valid"],[[42806,42806],"mapped",[42807]],[[42807,42807],"valid"],[[42808,42808],"mapped",[42809]],[[42809,42809],"valid"],[[42810,42810],"mapped",[42811]],[[42811,42811],"valid"],[[42812,42812],"mapped",[42813]],[[42813,42813],"valid"],[[42814,42814],"mapped",[42815]],[[42815,42815],"valid"],[[42816,42816],"mapped",[42817]],[[42817,42817],"valid"],[[42818,42818],"mapped",[42819]],[[42819,42819],"valid"],[[42820,42820],"mapped",[42821]],[[42821,42821],"valid"],[[42822,42822],"mapped",[42823]],[[42823,42823],"valid"],[[42824,42824],"mapped",[42825]],[[42825,42825],"valid"],[[42826,42826],"mapped",[42827]],[[42827,42827],"valid"],[[42828,42828],"mapped",[42829]],[[42829,42829],"valid"],[[42830,42830],"mapped",[42831]],[[42831,42831],"valid"],[[42832,42832],"mapped",[42833]],[[42833,42833],"valid"],[[42834,42834],"mapped",[42835]],[[42835,42835],"valid"],[[42836,42836],"mapped",[42837]],[[42837,42837],"valid"],[[42838,42838],"mapped",[42839]],[[42839,42839],"valid"],[[42840,42840],"mapped",[42841]],[[42841,42841],"valid"],[[42842,42842],"mapped",[42843]],[[42843,42843],"valid"],[[42844,42844],"mapped",[42845]],[[42845,42845],"valid"],[[42846,42846],"mapped",[42847]],[[42847,42847],"valid"],[[42848,42848],"mapped",[42849]],[[42849,42849],"valid"],[[42850,42850],"mapped",[42851]],[[42851,42851],"valid"],[[42852,42852],"mapped",[42853]],[[42853,42853],"valid"],[[42854,42854],"mapped",[42855]],[[42855,42855],"valid"],[[42856,42856],"mapped",[42857]],[[42857,42857],"valid"],[[42858,42858],"mapped",[42859]],[[42859,42859],"valid"],[[42860,42860],"mapped",[42861]],[[42861,42861],"valid"],[[42862,42862],"mapped",[42863]],[[42863,42863],"valid"],[[42864,42864],"mapped",[42863]],[[42865,42872],"valid"],[[42873,42873],"mapped",[42874]],[[42874,42874],"valid"],[[42875,42875],"mapped",[42876]],[[42876,42876],"valid"],[[42877,42877],"mapped",[7545]],[[42878,42878],"mapped",[42879]],[[42879,42879],"valid"],[[42880,42880],"mapped",[42881]],[[42881,42881],"valid"],[[42882,42882],"mapped",[42883]],[[42883,42883],"valid"],[[42884,42884],"mapped",[42885]],[[42885,42885],"valid"],[[42886,42886],"mapped",[42887]],[[42887,42888],"valid"],[[42889,42890],"valid",[],"NV8"],[[42891,42891],"mapped",[42892]],[[42892,42892],"valid"],[[42893,42893],"mapped",[613]],[[42894,42894],"valid"],[[42895,42895],"valid"],[[42896,42896],"mapped",[42897]],[[42897,42897],"valid"],[[42898,42898],"mapped",[42899]],[[42899,42899],"valid"],[[42900,42901],"valid"],[[42902,42902],"mapped",[42903]],[[42903,42903],"valid"],[[42904,42904],"mapped",[42905]],[[42905,42905],"valid"],[[42906,42906],"mapped",[42907]],[[42907,42907],"valid"],[[42908,42908],"mapped",[42909]],[[42909,42909],"valid"],[[42910,42910],"mapped",[42911]],[[42911,42911],"valid"],[[42912,42912],"mapped",[42913]],[[42913,42913],"valid"],[[42914,42914],"mapped",[42915]],[[42915,42915],"valid"],[[42916,42916],"mapped",[42917]],[[42917,42917],"valid"],[[42918,42918],"mapped",[42919]],[[42919,42919],"valid"],[[42920,42920],"mapped",[42921]],[[42921,42921],"valid"],[[42922,42922],"mapped",[614]],[[42923,42923],"mapped",[604]],[[42924,42924],"mapped",[609]],[[42925,42925],"mapped",[620]],[[42926,42927],"disallowed"],[[42928,42928],"mapped",[670]],[[42929,42929],"mapped",[647]],[[42930,42930],"mapped",[669]],[[42931,42931],"mapped",[43859]],[[42932,42932],"mapped",[42933]],[[42933,42933],"valid"],[[42934,42934],"mapped",[42935]],[[42935,42935],"valid"],[[42936,42998],"disallowed"],[[42999,42999],"valid"],[[43000,43000],"mapped",[295]],[[43001,43001],"mapped",[339]],[[43002,43002],"valid"],[[43003,43007],"valid"],[[43008,43047],"valid"],[[43048,43051],"valid",[],"NV8"],[[43052,43055],"disallowed"],[[43056,43065],"valid",[],"NV8"],[[43066,43071],"disallowed"],[[43072,43123],"valid"],[[43124,43127],"valid",[],"NV8"],[[43128,43135],"disallowed"],[[43136,43204],"valid"],[[43205,43213],"disallowed"],[[43214,43215],"valid",[],"NV8"],[[43216,43225],"valid"],[[43226,43231],"disallowed"],[[43232,43255],"valid"],[[43256,43258],"valid",[],"NV8"],[[43259,43259],"valid"],[[43260,43260],"valid",[],"NV8"],[[43261,43261],"valid"],[[43262,43263],"disallowed"],[[43264,43309],"valid"],[[43310,43311],"valid",[],"NV8"],[[43312,43347],"valid"],[[43348,43358],"disallowed"],[[43359,43359],"valid",[],"NV8"],[[43360,43388],"valid",[],"NV8"],[[43389,43391],"disallowed"],[[43392,43456],"valid"],[[43457,43469],"valid",[],"NV8"],[[43470,43470],"disallowed"],[[43471,43481],"valid"],[[43482,43485],"disallowed"],[[43486,43487],"valid",[],"NV8"],[[43488,43518],"valid"],[[43519,43519],"disallowed"],[[43520,43574],"valid"],[[43575,43583],"disallowed"],[[43584,43597],"valid"],[[43598,43599],"disallowed"],[[43600,43609],"valid"],[[43610,43611],"disallowed"],[[43612,43615],"valid",[],"NV8"],[[43616,43638],"valid"],[[43639,43641],"valid",[],"NV8"],[[43642,43643],"valid"],[[43644,43647],"valid"],[[43648,43714],"valid"],[[43715,43738],"disallowed"],[[43739,43741],"valid"],[[43742,43743],"valid",[],"NV8"],[[43744,43759],"valid"],[[43760,43761],"valid",[],"NV8"],[[43762,43766],"valid"],[[43767,43776],"disallowed"],[[43777,43782],"valid"],[[43783,43784],"disallowed"],[[43785,43790],"valid"],[[43791,43792],"disallowed"],[[43793,43798],"valid"],[[43799,43807],"disallowed"],[[43808,43814],"valid"],[[43815,43815],"disallowed"],[[43816,43822],"valid"],[[43823,43823],"disallowed"],[[43824,43866],"valid"],[[43867,43867],"valid",[],"NV8"],[[43868,43868],"mapped",[42791]],[[43869,43869],"mapped",[43831]],[[43870,43870],"mapped",[619]],[[43871,43871],"mapped",[43858]],[[43872,43875],"valid"],[[43876,43877],"valid"],[[43878,43887],"disallowed"],[[43888,43888],"mapped",[5024]],[[43889,43889],"mapped",[5025]],[[43890,43890],"mapped",[5026]],[[43891,43891],"mapped",[5027]],[[43892,43892],"mapped",[5028]],[[43893,43893],"mapped",[5029]],[[43894,43894],"mapped",[5030]],[[43895,43895],"mapped",[5031]],[[43896,43896],"mapped",[5032]],[[43897,43897],"mapped",[5033]],[[43898,43898],"mapped",[5034]],[[43899,43899],"mapped",[5035]],[[43900,43900],"mapped",[5036]],[[43901,43901],"mapped",[5037]],[[43902,43902],"mapped",[5038]],[[43903,43903],"mapped",[5039]],[[43904,43904],"mapped",[5040]],[[43905,43905],"mapped",[5041]],[[43906,43906],"mapped",[5042]],[[43907,43907],"mapped",[5043]],[[43908,43908],"mapped",[5044]],[[43909,43909],"mapped",[5045]],[[43910,43910],"mapped",[5046]],[[43911,43911],"mapped",[5047]],[[43912,43912],"mapped",[5048]],[[43913,43913],"mapped",[5049]],[[43914,43914],"mapped",[5050]],[[43915,43915],"mapped",[5051]],[[43916,43916],"mapped",[5052]],[[43917,43917],"mapped",[5053]],[[43918,43918],"mapped",[5054]],[[43919,43919],"mapped",[5055]],[[43920,43920],"mapped",[5056]],[[43921,43921],"mapped",[5057]],[[43922,43922],"mapped",[5058]],[[43923,43923],"mapped",[5059]],[[43924,43924],"mapped",[5060]],[[43925,43925],"mapped",[5061]],[[43926,43926],"mapped",[5062]],[[43927,43927],"mapped",[5063]],[[43928,43928],"mapped",[5064]],[[43929,43929],"mapped",[5065]],[[43930,43930],"mapped",[5066]],[[43931,43931],"mapped",[5067]],[[43932,43932],"mapped",[5068]],[[43933,43933],"mapped",[5069]],[[43934,43934],"mapped",[5070]],[[43935,43935],"mapped",[5071]],[[43936,43936],"mapped",[5072]],[[43937,43937],"mapped",[5073]],[[43938,43938],"mapped",[5074]],[[43939,43939],"mapped",[5075]],[[43940,43940],"mapped",[5076]],[[43941,43941],"mapped",[5077]],[[43942,43942],"mapped",[5078]],[[43943,43943],"mapped",[5079]],[[43944,43944],"mapped",[5080]],[[43945,43945],"mapped",[5081]],[[43946,43946],"mapped",[5082]],[[43947,43947],"mapped",[5083]],[[43948,43948],"mapped",[5084]],[[43949,43949],"mapped",[5085]],[[43950,43950],"mapped",[5086]],[[43951,43951],"mapped",[5087]],[[43952,43952],"mapped",[5088]],[[43953,43953],"mapped",[5089]],[[43954,43954],"mapped",[5090]],[[43955,43955],"mapped",[5091]],[[43956,43956],"mapped",[5092]],[[43957,43957],"mapped",[5093]],[[43958,43958],"mapped",[5094]],[[43959,43959],"mapped",[5095]],[[43960,43960],"mapped",[5096]],[[43961,43961],"mapped",[5097]],[[43962,43962],"mapped",[5098]],[[43963,43963],"mapped",[5099]],[[43964,43964],"mapped",[5100]],[[43965,43965],"mapped",[5101]],[[43966,43966],"mapped",[5102]],[[43967,43967],"mapped",[5103]],[[43968,44010],"valid"],[[44011,44011],"valid",[],"NV8"],[[44012,44013],"valid"],[[44014,44015],"disallowed"],[[44016,44025],"valid"],[[44026,44031],"disallowed"],[[44032,55203],"valid"],[[55204,55215],"disallowed"],[[55216,55238],"valid",[],"NV8"],[[55239,55242],"disallowed"],[[55243,55291],"valid",[],"NV8"],[[55292,55295],"disallowed"],[[55296,57343],"disallowed"],[[57344,63743],"disallowed"],[[63744,63744],"mapped",[35912]],[[63745,63745],"mapped",[26356]],[[63746,63746],"mapped",[36554]],[[63747,63747],"mapped",[36040]],[[63748,63748],"mapped",[28369]],[[63749,63749],"mapped",[20018]],[[63750,63750],"mapped",[21477]],[[63751,63752],"mapped",[40860]],[[63753,63753],"mapped",[22865]],[[63754,63754],"mapped",[37329]],[[63755,63755],"mapped",[21895]],[[63756,63756],"mapped",[22856]],[[63757,63757],"mapped",[25078]],[[63758,63758],"mapped",[30313]],[[63759,63759],"mapped",[32645]],[[63760,63760],"mapped",[34367]],[[63761,63761],"mapped",[34746]],[[63762,63762],"mapped",[35064]],[[63763,63763],"mapped",[37007]],[[63764,63764],"mapped",[27138]],[[63765,63765],"mapped",[27931]],[[63766,63766],"mapped",[28889]],[[63767,63767],"mapped",[29662]],[[63768,63768],"mapped",[33853]],[[63769,63769],"mapped",[37226]],[[63770,63770],"mapped",[39409]],[[63771,63771],"mapped",[20098]],[[63772,63772],"mapped",[21365]],[[63773,63773],"mapped",[27396]],[[63774,63774],"mapped",[29211]],[[63775,63775],"mapped",[34349]],[[63776,63776],"mapped",[40478]],[[63777,63777],"mapped",[23888]],[[63778,63778],"mapped",[28651]],[[63779,63779],"mapped",[34253]],[[63780,63780],"mapped",[35172]],[[63781,63781],"mapped",[25289]],[[63782,63782],"mapped",[33240]],[[63783,63783],"mapped",[34847]],[[63784,63784],"mapped",[24266]],[[63785,63785],"mapped",[26391]],[[63786,63786],"mapped",[28010]],[[63787,63787],"mapped",[29436]],[[63788,63788],"mapped",[37070]],[[63789,63789],"mapped",[20358]],[[63790,63790],"mapped",[20919]],[[63791,63791],"mapped",[21214]],[[63792,63792],"mapped",[25796]],[[63793,63793],"mapped",[27347]],[[63794,63794],"mapped",[29200]],[[63795,63795],"mapped",[30439]],[[63796,63796],"mapped",[32769]],[[63797,63797],"mapped",[34310]],[[63798,63798],"mapped",[34396]],[[63799,63799],"mapped",[36335]],[[63800,63800],"mapped",[38706]],[[63801,63801],"mapped",[39791]],[[63802,63802],"mapped",[40442]],[[63803,63803],"mapped",[30860]],[[63804,63804],"mapped",[31103]],[[63805,63805],"mapped",[32160]],[[63806,63806],"mapped",[33737]],[[63807,63807],"mapped",[37636]],[[63808,63808],"mapped",[40575]],[[63809,63809],"mapped",[35542]],[[63810,63810],"mapped",[22751]],[[63811,63811],"mapped",[24324]],[[63812,63812],"mapped",[31840]],[[63813,63813],"mapped",[32894]],[[63814,63814],"mapped",[29282]],[[63815,63815],"mapped",[30922]],[[63816,63816],"mapped",[36034]],[[63817,63817],"mapped",[38647]],[[63818,63818],"mapped",[22744]],[[63819,63819],"mapped",[23650]],[[63820,63820],"mapped",[27155]],[[63821,63821],"mapped",[28122]],[[63822,63822],"mapped",[28431]],[[63823,63823],"mapped",[32047]],[[63824,63824],"mapped",[32311]],[[63825,63825],"mapped",[38475]],[[63826,63826],"mapped",[21202]],[[63827,63827],"mapped",[32907]],[[63828,63828],"mapped",[20956]],[[63829,63829],"mapped",[20940]],[[63830,63830],"mapped",[31260]],[[63831,63831],"mapped",[32190]],[[63832,63832],"mapped",[33777]],[[63833,63833],"mapped",[38517]],[[63834,63834],"mapped",[35712]],[[63835,63835],"mapped",[25295]],[[63836,63836],"mapped",[27138]],[[63837,63837],"mapped",[35582]],[[63838,63838],"mapped",[20025]],[[63839,63839],"mapped",[23527]],[[63840,63840],"mapped",[24594]],[[63841,63841],"mapped",[29575]],[[63842,63842],"mapped",[30064]],[[63843,63843],"mapped",[21271]],[[63844,63844],"mapped",[30971]],[[63845,63845],"mapped",[20415]],[[63846,63846],"mapped",[24489]],[[63847,63847],"mapped",[19981]],[[63848,63848],"mapped",[27852]],[[63849,63849],"mapped",[25976]],[[63850,63850],"mapped",[32034]],[[63851,63851],"mapped",[21443]],[[63852,63852],"mapped",[22622]],[[63853,63853],"mapped",[30465]],[[63854,63854],"mapped",[33865]],[[63855,63855],"mapped",[35498]],[[63856,63856],"mapped",[27578]],[[63857,63857],"mapped",[36784]],[[63858,63858],"mapped",[27784]],[[63859,63859],"mapped",[25342]],[[63860,63860],"mapped",[33509]],[[63861,63861],"mapped",[25504]],[[63862,63862],"mapped",[30053]],[[63863,63863],"mapped",[20142]],[[63864,63864],"mapped",[20841]],[[63865,63865],"mapped",[20937]],[[63866,63866],"mapped",[26753]],[[63867,63867],"mapped",[31975]],[[63868,63868],"mapped",[33391]],[[63869,63869],"mapped",[35538]],[[63870,63870],"mapped",[37327]],[[63871,63871],"mapped",[21237]],[[63872,63872],"mapped",[21570]],[[63873,63873],"mapped",[22899]],[[63874,63874],"mapped",[24300]],[[63875,63875],"mapped",[26053]],[[63876,63876],"mapped",[28670]],[[63877,63877],"mapped",[31018]],[[63878,63878],"mapped",[38317]],[[63879,63879],"mapped",[39530]],[[63880,63880],"mapped",[40599]],[[63881,63881],"mapped",[40654]],[[63882,63882],"mapped",[21147]],[[63883,63883],"mapped",[26310]],[[63884,63884],"mapped",[27511]],[[63885,63885],"mapped",[36706]],[[63886,63886],"mapped",[24180]],[[63887,63887],"mapped",[24976]],[[63888,63888],"mapped",[25088]],[[63889,63889],"mapped",[25754]],[[63890,63890],"mapped",[28451]],[[63891,63891],"mapped",[29001]],[[63892,63892],"mapped",[29833]],[[63893,63893],"mapped",[31178]],[[63894,63894],"mapped",[32244]],[[63895,63895],"mapped",[32879]],[[63896,63896],"mapped",[36646]],[[63897,63897],"mapped",[34030]],[[63898,63898],"mapped",[36899]],[[63899,63899],"mapped",[37706]],[[63900,63900],"mapped",[21015]],[[63901,63901],"mapped",[21155]],[[63902,63902],"mapped",[21693]],[[63903,63903],"mapped",[28872]],[[63904,63904],"mapped",[35010]],[[63905,63905],"mapped",[35498]],[[63906,63906],"mapped",[24265]],[[63907,63907],"mapped",[24565]],[[63908,63908],"mapped",[25467]],[[63909,63909],"mapped",[27566]],[[63910,63910],"mapped",[31806]],[[63911,63911],"mapped",[29557]],[[63912,63912],"mapped",[20196]],[[63913,63913],"mapped",[22265]],[[63914,63914],"mapped",[23527]],[[63915,63915],"mapped",[23994]],[[63916,63916],"mapped",[24604]],[[63917,63917],"mapped",[29618]],[[63918,63918],"mapped",[29801]],[[63919,63919],"mapped",[32666]],[[63920,63920],"mapped",[32838]],[[63921,63921],"mapped",[37428]],[[63922,63922],"mapped",[38646]],[[63923,63923],"mapped",[38728]],[[63924,63924],"mapped",[38936]],[[63925,63925],"mapped",[20363]],[[63926,63926],"mapped",[31150]],[[63927,63927],"mapped",[37300]],[[63928,63928],"mapped",[38584]],[[63929,63929],"mapped",[24801]],[[63930,63930],"mapped",[20102]],[[63931,63931],"mapped",[20698]],[[63932,63932],"mapped",[23534]],[[63933,63933],"mapped",[23615]],[[63934,63934],"mapped",[26009]],[[63935,63935],"mapped",[27138]],[[63936,63936],"mapped",[29134]],[[63937,63937],"mapped",[30274]],[[63938,63938],"mapped",[34044]],[[63939,63939],"mapped",[36988]],[[63940,63940],"mapped",[40845]],[[63941,63941],"mapped",[26248]],[[63942,63942],"mapped",[38446]],[[63943,63943],"mapped",[21129]],[[63944,63944],"mapped",[26491]],[[63945,63945],"mapped",[26611]],[[63946,63946],"mapped",[27969]],[[63947,63947],"mapped",[28316]],[[63948,63948],"mapped",[29705]],[[63949,63949],"mapped",[30041]],[[63950,63950],"mapped",[30827]],[[63951,63951],"mapped",[32016]],[[63952,63952],"mapped",[39006]],[[63953,63953],"mapped",[20845]],[[63954,63954],"mapped",[25134]],[[63955,63955],"mapped",[38520]],[[63956,63956],"mapped",[20523]],[[63957,63957],"mapped",[23833]],[[63958,63958],"mapped",[28138]],[[63959,63959],"mapped",[36650]],[[63960,63960],"mapped",[24459]],[[63961,63961],"mapped",[24900]],[[63962,63962],"mapped",[26647]],[[63963,63963],"mapped",[29575]],[[63964,63964],"mapped",[38534]],[[63965,63965],"mapped",[21033]],[[63966,63966],"mapped",[21519]],[[63967,63967],"mapped",[23653]],[[63968,63968],"mapped",[26131]],[[63969,63969],"mapped",[26446]],[[63970,63970],"mapped",[26792]],[[63971,63971],"mapped",[27877]],[[63972,63972],"mapped",[29702]],[[63973,63973],"mapped",[30178]],[[63974,63974],"mapped",[32633]],[[63975,63975],"mapped",[35023]],[[63976,63976],"mapped",[35041]],[[63977,63977],"mapped",[37324]],[[63978,63978],"mapped",[38626]],[[63979,63979],"mapped",[21311]],[[63980,63980],"mapped",[28346]],[[63981,63981],"mapped",[21533]],[[63982,63982],"mapped",[29136]],[[63983,63983],"mapped",[29848]],[[63984,63984],"mapped",[34298]],[[63985,63985],"mapped",[38563]],[[63986,63986],"mapped",[40023]],[[63987,63987],"mapped",[40607]],[[63988,63988],"mapped",[26519]],[[63989,63989],"mapped",[28107]],[[63990,63990],"mapped",[33256]],[[63991,63991],"mapped",[31435]],[[63992,63992],"mapped",[31520]],[[63993,63993],"mapped",[31890]],[[63994,63994],"mapped",[29376]],[[63995,63995],"mapped",[28825]],[[63996,63996],"mapped",[35672]],[[63997,63997],"mapped",[20160]],[[63998,63998],"mapped",[33590]],[[63999,63999],"mapped",[21050]],[[64000,64000],"mapped",[20999]],[[64001,64001],"mapped",[24230]],[[64002,64002],"mapped",[25299]],[[64003,64003],"mapped",[31958]],[[64004,64004],"mapped",[23429]],[[64005,64005],"mapped",[27934]],[[64006,64006],"mapped",[26292]],[[64007,64007],"mapped",[36667]],[[64008,64008],"mapped",[34892]],[[64009,64009],"mapped",[38477]],[[64010,64010],"mapped",[35211]],[[64011,64011],"mapped",[24275]],[[64012,64012],"mapped",[20800]],[[64013,64013],"mapped",[21952]],[[64014,64015],"valid"],[[64016,64016],"mapped",[22618]],[[64017,64017],"valid"],[[64018,64018],"mapped",[26228]],[[64019,64020],"valid"],[[64021,64021],"mapped",[20958]],[[64022,64022],"mapped",[29482]],[[64023,64023],"mapped",[30410]],[[64024,64024],"mapped",[31036]],[[64025,64025],"mapped",[31070]],[[64026,64026],"mapped",[31077]],[[64027,64027],"mapped",[31119]],[[64028,64028],"mapped",[38742]],[[64029,64029],"mapped",[31934]],[[64030,64030],"mapped",[32701]],[[64031,64031],"valid"],[[64032,64032],"mapped",[34322]],[[64033,64033],"valid"],[[64034,64034],"mapped",[35576]],[[64035,64036],"valid"],[[64037,64037],"mapped",[36920]],[[64038,64038],"mapped",[37117]],[[64039,64041],"valid"],[[64042,64042],"mapped",[39151]],[[64043,64043],"mapped",[39164]],[[64044,64044],"mapped",[39208]],[[64045,64045],"mapped",[40372]],[[64046,64046],"mapped",[37086]],[[64047,64047],"mapped",[38583]],[[64048,64048],"mapped",[20398]],[[64049,64049],"mapped",[20711]],[[64050,64050],"mapped",[20813]],[[64051,64051],"mapped",[21193]],[[64052,64052],"mapped",[21220]],[[64053,64053],"mapped",[21329]],[[64054,64054],"mapped",[21917]],[[64055,64055],"mapped",[22022]],[[64056,64056],"mapped",[22120]],[[64057,64057],"mapped",[22592]],[[64058,64058],"mapped",[22696]],[[64059,64059],"mapped",[23652]],[[64060,64060],"mapped",[23662]],[[64061,64061],"mapped",[24724]],[[64062,64062],"mapped",[24936]],[[64063,64063],"mapped",[24974]],[[64064,64064],"mapped",[25074]],[[64065,64065],"mapped",[25935]],[[64066,64066],"mapped",[26082]],[[64067,64067],"mapped",[26257]],[[64068,64068],"mapped",[26757]],[[64069,64069],"mapped",[28023]],[[64070,64070],"mapped",[28186]],[[64071,64071],"mapped",[28450]],[[64072,64072],"mapped",[29038]],[[64073,64073],"mapped",[29227]],[[64074,64074],"mapped",[29730]],[[64075,64075],"mapped",[30865]],[[64076,64076],"mapped",[31038]],[[64077,64077],"mapped",[31049]],[[64078,64078],"mapped",[31048]],[[64079,64079],"mapped",[31056]],[[64080,64080],"mapped",[31062]],[[64081,64081],"mapped",[31069]],[[64082,64082],"mapped",[31117]],[[64083,64083],"mapped",[31118]],[[64084,64084],"mapped",[31296]],[[64085,64085],"mapped",[31361]],[[64086,64086],"mapped",[31680]],[[64087,64087],"mapped",[32244]],[[64088,64088],"mapped",[32265]],[[64089,64089],"mapped",[32321]],[[64090,64090],"mapped",[32626]],[[64091,64091],"mapped",[32773]],[[64092,64092],"mapped",[33261]],[[64093,64094],"mapped",[33401]],[[64095,64095],"mapped",[33879]],[[64096,64096],"mapped",[35088]],[[64097,64097],"mapped",[35222]],[[64098,64098],"mapped",[35585]],[[64099,64099],"mapped",[35641]],[[64100,64100],"mapped",[36051]],[[64101,64101],"mapped",[36104]],[[64102,64102],"mapped",[36790]],[[64103,64103],"mapped",[36920]],[[64104,64104],"mapped",[38627]],[[64105,64105],"mapped",[38911]],[[64106,64106],"mapped",[38971]],[[64107,64107],"mapped",[24693]],[[64108,64108],"mapped",[148206]],[[64109,64109],"mapped",[33304]],[[64110,64111],"disallowed"],[[64112,64112],"mapped",[20006]],[[64113,64113],"mapped",[20917]],[[64114,64114],"mapped",[20840]],[[64115,64115],"mapped",[20352]],[[64116,64116],"mapped",[20805]],[[64117,64117],"mapped",[20864]],[[64118,64118],"mapped",[21191]],[[64119,64119],"mapped",[21242]],[[64120,64120],"mapped",[21917]],[[64121,64121],"mapped",[21845]],[[64122,64122],"mapped",[21913]],[[64123,64123],"mapped",[21986]],[[64124,64124],"mapped",[22618]],[[64125,64125],"mapped",[22707]],[[64126,64126],"mapped",[22852]],[[64127,64127],"mapped",[22868]],[[64128,64128],"mapped",[23138]],[[64129,64129],"mapped",[23336]],[[64130,64130],"mapped",[24274]],[[64131,64131],"mapped",[24281]],[[64132,64132],"mapped",[24425]],[[64133,64133],"mapped",[24493]],[[64134,64134],"mapped",[24792]],[[64135,64135],"mapped",[24910]],[[64136,64136],"mapped",[24840]],[[64137,64137],"mapped",[24974]],[[64138,64138],"mapped",[24928]],[[64139,64139],"mapped",[25074]],[[64140,64140],"mapped",[25140]],[[64141,64141],"mapped",[25540]],[[64142,64142],"mapped",[25628]],[[64143,64143],"mapped",[25682]],[[64144,64144],"mapped",[25942]],[[64145,64145],"mapped",[26228]],[[64146,64146],"mapped",[26391]],[[64147,64147],"mapped",[26395]],[[64148,64148],"mapped",[26454]],[[64149,64149],"mapped",[27513]],[[64150,64150],"mapped",[27578]],[[64151,64151],"mapped",[27969]],[[64152,64152],"mapped",[28379]],[[64153,64153],"mapped",[28363]],[[64154,64154],"mapped",[28450]],[[64155,64155],"mapped",[28702]],[[64156,64156],"mapped",[29038]],[[64157,64157],"mapped",[30631]],[[64158,64158],"mapped",[29237]],[[64159,64159],"mapped",[29359]],[[64160,64160],"mapped",[29482]],[[64161,64161],"mapped",[29809]],[[64162,64162],"mapped",[29958]],[[64163,64163],"mapped",[30011]],[[64164,64164],"mapped",[30237]],[[64165,64165],"mapped",[30239]],[[64166,64166],"mapped",[30410]],[[64167,64167],"mapped",[30427]],[[64168,64168],"mapped",[30452]],[[64169,64169],"mapped",[30538]],[[64170,64170],"mapped",[30528]],[[64171,64171],"mapped",[30924]],[[64172,64172],"mapped",[31409]],[[64173,64173],"mapped",[31680]],[[64174,64174],"mapped",[31867]],[[64175,64175],"mapped",[32091]],[[64176,64176],"mapped",[32244]],[[64177,64177],"mapped",[32574]],[[64178,64178],"mapped",[32773]],[[64179,64179],"mapped",[33618]],[[64180,64180],"mapped",[33775]],[[64181,64181],"mapped",[34681]],[[64182,64182],"mapped",[35137]],[[64183,64183],"mapped",[35206]],[[64184,64184],"mapped",[35222]],[[64185,64185],"mapped",[35519]],[[64186,64186],"mapped",[35576]],[[64187,64187],"mapped",[35531]],[[64188,64188],"mapped",[35585]],[[64189,64189],"mapped",[35582]],[[64190,64190],"mapped",[35565]],[[64191,64191],"mapped",[35641]],[[64192,64192],"mapped",[35722]],[[64193,64193],"mapped",[36104]],[[64194,64194],"mapped",[36664]],[[64195,64195],"mapped",[36978]],[[64196,64196],"mapped",[37273]],[[64197,64197],"mapped",[37494]],[[64198,64198],"mapped",[38524]],[[64199,64199],"mapped",[38627]],[[64200,64200],"mapped",[38742]],[[64201,64201],"mapped",[38875]],[[64202,64202],"mapped",[38911]],[[64203,64203],"mapped",[38923]],[[64204,64204],"mapped",[38971]],[[64205,64205],"mapped",[39698]],[[64206,64206],"mapped",[40860]],[[64207,64207],"mapped",[141386]],[[64208,64208],"mapped",[141380]],[[64209,64209],"mapped",[144341]],[[64210,64210],"mapped",[15261]],[[64211,64211],"mapped",[16408]],[[64212,64212],"mapped",[16441]],[[64213,64213],"mapped",[152137]],[[64214,64214],"mapped",[154832]],[[64215,64215],"mapped",[163539]],[[64216,64216],"mapped",[40771]],[[64217,64217],"mapped",[40846]],[[64218,64255],"disallowed"],[[64256,64256],"mapped",[102,102]],[[64257,64257],"mapped",[102,105]],[[64258,64258],"mapped",[102,108]],[[64259,64259],"mapped",[102,102,105]],[[64260,64260],"mapped",[102,102,108]],[[64261,64262],"mapped",[115,116]],[[64263,64274],"disallowed"],[[64275,64275],"mapped",[1396,1398]],[[64276,64276],"mapped",[1396,1381]],[[64277,64277],"mapped",[1396,1387]],[[64278,64278],"mapped",[1406,1398]],[[64279,64279],"mapped",[1396,1389]],[[64280,64284],"disallowed"],[[64285,64285],"mapped",[1497,1460]],[[64286,64286],"valid"],[[64287,64287],"mapped",[1522,1463]],[[64288,64288],"mapped",[1506]],[[64289,64289],"mapped",[1488]],[[64290,64290],"mapped",[1491]],[[64291,64291],"mapped",[1492]],[[64292,64292],"mapped",[1499]],[[64293,64293],"mapped",[1500]],[[64294,64294],"mapped",[1501]],[[64295,64295],"mapped",[1512]],[[64296,64296],"mapped",[1514]],[[64297,64297],"disallowed_STD3_mapped",[43]],[[64298,64298],"mapped",[1513,1473]],[[64299,64299],"mapped",[1513,1474]],[[64300,64300],"mapped",[1513,1468,1473]],[[64301,64301],"mapped",[1513,1468,1474]],[[64302,64302],"mapped",[1488,1463]],[[64303,64303],"mapped",[1488,1464]],[[64304,64304],"mapped",[1488,1468]],[[64305,64305],"mapped",[1489,1468]],[[64306,64306],"mapped",[1490,1468]],[[64307,64307],"mapped",[1491,1468]],[[64308,64308],"mapped",[1492,1468]],[[64309,64309],"mapped",[1493,1468]],[[64310,64310],"mapped",[1494,1468]],[[64311,64311],"disallowed"],[[64312,64312],"mapped",[1496,1468]],[[64313,64313],"mapped",[1497,1468]],[[64314,64314],"mapped",[1498,1468]],[[64315,64315],"mapped",[1499,1468]],[[64316,64316],"mapped",[1500,1468]],[[64317,64317],"disallowed"],[[64318,64318],"mapped",[1502,1468]],[[64319,64319],"disallowed"],[[64320,64320],"mapped",[1504,1468]],[[64321,64321],"mapped",[1505,1468]],[[64322,64322],"disallowed"],[[64323,64323],"mapped",[1507,1468]],[[64324,64324],"mapped",[1508,1468]],[[64325,64325],"disallowed"],[[64326,64326],"mapped",[1510,1468]],[[64327,64327],"mapped",[1511,1468]],[[64328,64328],"mapped",[1512,1468]],[[64329,64329],"mapped",[1513,1468]],[[64330,64330],"mapped",[1514,1468]],[[64331,64331],"mapped",[1493,1465]],[[64332,64332],"mapped",[1489,1471]],[[64333,64333],"mapped",[1499,1471]],[[64334,64334],"mapped",[1508,1471]],[[64335,64335],"mapped",[1488,1500]],[[64336,64337],"mapped",[1649]],[[64338,64341],"mapped",[1659]],[[64342,64345],"mapped",[1662]],[[64346,64349],"mapped",[1664]],[[64350,64353],"mapped",[1658]],[[64354,64357],"mapped",[1663]],[[64358,64361],"mapped",[1657]],[[64362,64365],"mapped",[1700]],[[64366,64369],"mapped",[1702]],[[64370,64373],"mapped",[1668]],[[64374,64377],"mapped",[1667]],[[64378,64381],"mapped",[1670]],[[64382,64385],"mapped",[1671]],[[64386,64387],"mapped",[1677]],[[64388,64389],"mapped",[1676]],[[64390,64391],"mapped",[1678]],[[64392,64393],"mapped",[1672]],[[64394,64395],"mapped",[1688]],[[64396,64397],"mapped",[1681]],[[64398,64401],"mapped",[1705]],[[64402,64405],"mapped",[1711]],[[64406,64409],"mapped",[1715]],[[64410,64413],"mapped",[1713]],[[64414,64415],"mapped",[1722]],[[64416,64419],"mapped",[1723]],[[64420,64421],"mapped",[1728]],[[64422,64425],"mapped",[1729]],[[64426,64429],"mapped",[1726]],[[64430,64431],"mapped",[1746]],[[64432,64433],"mapped",[1747]],[[64434,64449],"valid",[],"NV8"],[[64450,64466],"disallowed"],[[64467,64470],"mapped",[1709]],[[64471,64472],"mapped",[1735]],[[64473,64474],"mapped",[1734]],[[64475,64476],"mapped",[1736]],[[64477,64477],"mapped",[1735,1652]],[[64478,64479],"mapped",[1739]],[[64480,64481],"mapped",[1733]],[[64482,64483],"mapped",[1737]],[[64484,64487],"mapped",[1744]],[[64488,64489],"mapped",[1609]],[[64490,64491],"mapped",[1574,1575]],[[64492,64493],"mapped",[1574,1749]],[[64494,64495],"mapped",[1574,1608]],[[64496,64497],"mapped",[1574,1735]],[[64498,64499],"mapped",[1574,1734]],[[64500,64501],"mapped",[1574,1736]],[[64502,64504],"mapped",[1574,1744]],[[64505,64507],"mapped",[1574,1609]],[[64508,64511],"mapped",[1740]],[[64512,64512],"mapped",[1574,1580]],[[64513,64513],"mapped",[1574,1581]],[[64514,64514],"mapped",[1574,1605]],[[64515,64515],"mapped",[1574,1609]],[[64516,64516],"mapped",[1574,1610]],[[64517,64517],"mapped",[1576,1580]],[[64518,64518],"mapped",[1576,1581]],[[64519,64519],"mapped",[1576,1582]],[[64520,64520],"mapped",[1576,1605]],[[64521,64521],"mapped",[1576,1609]],[[64522,64522],"mapped",[1576,1610]],[[64523,64523],"mapped",[1578,1580]],[[64524,64524],"mapped",[1578,1581]],[[64525,64525],"mapped",[1578,1582]],[[64526,64526],"mapped",[1578,1605]],[[64527,64527],"mapped",[1578,1609]],[[64528,64528],"mapped",[1578,1610]],[[64529,64529],"mapped",[1579,1580]],[[64530,64530],"mapped",[1579,1605]],[[64531,64531],"mapped",[1579,1609]],[[64532,64532],"mapped",[1579,1610]],[[64533,64533],"mapped",[1580,1581]],[[64534,64534],"mapped",[1580,1605]],[[64535,64535],"mapped",[1581,1580]],[[64536,64536],"mapped",[1581,1605]],[[64537,64537],"mapped",[1582,1580]],[[64538,64538],"mapped",[1582,1581]],[[64539,64539],"mapped",[1582,1605]],[[64540,64540],"mapped",[1587,1580]],[[64541,64541],"mapped",[1587,1581]],[[64542,64542],"mapped",[1587,1582]],[[64543,64543],"mapped",[1587,1605]],[[64544,64544],"mapped",[1589,1581]],[[64545,64545],"mapped",[1589,1605]],[[64546,64546],"mapped",[1590,1580]],[[64547,64547],"mapped",[1590,1581]],[[64548,64548],"mapped",[1590,1582]],[[64549,64549],"mapped",[1590,1605]],[[64550,64550],"mapped",[1591,1581]],[[64551,64551],"mapped",[1591,1605]],[[64552,64552],"mapped",[1592,1605]],[[64553,64553],"mapped",[1593,1580]],[[64554,64554],"mapped",[1593,1605]],[[64555,64555],"mapped",[1594,1580]],[[64556,64556],"mapped",[1594,1605]],[[64557,64557],"mapped",[1601,1580]],[[64558,64558],"mapped",[1601,1581]],[[64559,64559],"mapped",[1601,1582]],[[64560,64560],"mapped",[1601,1605]],[[64561,64561],"mapped",[1601,1609]],[[64562,64562],"mapped",[1601,1610]],[[64563,64563],"mapped",[1602,1581]],[[64564,64564],"mapped",[1602,1605]],[[64565,64565],"mapped",[1602,1609]],[[64566,64566],"mapped",[1602,1610]],[[64567,64567],"mapped",[1603,1575]],[[64568,64568],"mapped",[1603,1580]],[[64569,64569],"mapped",[1603,1581]],[[64570,64570],"mapped",[1603,1582]],[[64571,64571],"mapped",[1603,1604]],[[64572,64572],"mapped",[1603,1605]],[[64573,64573],"mapped",[1603,1609]],[[64574,64574],"mapped",[1603,1610]],[[64575,64575],"mapped",[1604,1580]],[[64576,64576],"mapped",[1604,1581]],[[64577,64577],"mapped",[1604,1582]],[[64578,64578],"mapped",[1604,1605]],[[64579,64579],"mapped",[1604,1609]],[[64580,64580],"mapped",[1604,1610]],[[64581,64581],"mapped",[1605,1580]],[[64582,64582],"mapped",[1605,1581]],[[64583,64583],"mapped",[1605,1582]],[[64584,64584],"mapped",[1605,1605]],[[64585,64585],"mapped",[1605,1609]],[[64586,64586],"mapped",[1605,1610]],[[64587,64587],"mapped",[1606,1580]],[[64588,64588],"mapped",[1606,1581]],[[64589,64589],"mapped",[1606,1582]],[[64590,64590],"mapped",[1606,1605]],[[64591,64591],"mapped",[1606,1609]],[[64592,64592],"mapped",[1606,1610]],[[64593,64593],"mapped",[1607,1580]],[[64594,64594],"mapped",[1607,1605]],[[64595,64595],"mapped",[1607,1609]],[[64596,64596],"mapped",[1607,1610]],[[64597,64597],"mapped",[1610,1580]],[[64598,64598],"mapped",[1610,1581]],[[64599,64599],"mapped",[1610,1582]],[[64600,64600],"mapped",[1610,1605]],[[64601,64601],"mapped",[1610,1609]],[[64602,64602],"mapped",[1610,1610]],[[64603,64603],"mapped",[1584,1648]],[[64604,64604],"mapped",[1585,1648]],[[64605,64605],"mapped",[1609,1648]],[[64606,64606],"disallowed_STD3_mapped",[32,1612,1617]],[[64607,64607],"disallowed_STD3_mapped",[32,1613,1617]],[[64608,64608],"disallowed_STD3_mapped",[32,1614,1617]],[[64609,64609],"disallowed_STD3_mapped",[32,1615,1617]],[[64610,64610],"disallowed_STD3_mapped",[32,1616,1617]],[[64611,64611],"disallowed_STD3_mapped",[32,1617,1648]],[[64612,64612],"mapped",[1574,1585]],[[64613,64613],"mapped",[1574,1586]],[[64614,64614],"mapped",[1574,1605]],[[64615,64615],"mapped",[1574,1606]],[[64616,64616],"mapped",[1574,1609]],[[64617,64617],"mapped",[1574,1610]],[[64618,64618],"mapped",[1576,1585]],[[64619,64619],"mapped",[1576,1586]],[[64620,64620],"mapped",[1576,1605]],[[64621,64621],"mapped",[1576,1606]],[[64622,64622],"mapped",[1576,1609]],[[64623,64623],"mapped",[1576,1610]],[[64624,64624],"mapped",[1578,1585]],[[64625,64625],"mapped",[1578,1586]],[[64626,64626],"mapped",[1578,1605]],[[64627,64627],"mapped",[1578,1606]],[[64628,64628],"mapped",[1578,1609]],[[64629,64629],"mapped",[1578,1610]],[[64630,64630],"mapped",[1579,1585]],[[64631,64631],"mapped",[1579,1586]],[[64632,64632],"mapped",[1579,1605]],[[64633,64633],"mapped",[1579,1606]],[[64634,64634],"mapped",[1579,1609]],[[64635,64635],"mapped",[1579,1610]],[[64636,64636],"mapped",[1601,1609]],[[64637,64637],"mapped",[1601,1610]],[[64638,64638],"mapped",[1602,1609]],[[64639,64639],"mapped",[1602,1610]],[[64640,64640],"mapped",[1603,1575]],[[64641,64641],"mapped",[1603,1604]],[[64642,64642],"mapped",[1603,1605]],[[64643,64643],"mapped",[1603,1609]],[[64644,64644],"mapped",[1603,1610]],[[64645,64645],"mapped",[1604,1605]],[[64646,64646],"mapped",[1604,1609]],[[64647,64647],"mapped",[1604,1610]],[[64648,64648],"mapped",[1605,1575]],[[64649,64649],"mapped",[1605,1605]],[[64650,64650],"mapped",[1606,1585]],[[64651,64651],"mapped",[1606,1586]],[[64652,64652],"mapped",[1606,1605]],[[64653,64653],"mapped",[1606,1606]],[[64654,64654],"mapped",[1606,1609]],[[64655,64655],"mapped",[1606,1610]],[[64656,64656],"mapped",[1609,1648]],[[64657,64657],"mapped",[1610,1585]],[[64658,64658],"mapped",[1610,1586]],[[64659,64659],"mapped",[1610,1605]],[[64660,64660],"mapped",[1610,1606]],[[64661,64661],"mapped",[1610,1609]],[[64662,64662],"mapped",[1610,1610]],[[64663,64663],"mapped",[1574,1580]],[[64664,64664],"mapped",[1574,1581]],[[64665,64665],"mapped",[1574,1582]],[[64666,64666],"mapped",[1574,1605]],[[64667,64667],"mapped",[1574,1607]],[[64668,64668],"mapped",[1576,1580]],[[64669,64669],"mapped",[1576,1581]],[[64670,64670],"mapped",[1576,1582]],[[64671,64671],"mapped",[1576,1605]],[[64672,64672],"mapped",[1576,1607]],[[64673,64673],"mapped",[1578,1580]],[[64674,64674],"mapped",[1578,1581]],[[64675,64675],"mapped",[1578,1582]],[[64676,64676],"mapped",[1578,1605]],[[64677,64677],"mapped",[1578,1607]],[[64678,64678],"mapped",[1579,1605]],[[64679,64679],"mapped",[1580,1581]],[[64680,64680],"mapped",[1580,1605]],[[64681,64681],"mapped",[1581,1580]],[[64682,64682],"mapped",[1581,1605]],[[64683,64683],"mapped",[1582,1580]],[[64684,64684],"mapped",[1582,1605]],[[64685,64685],"mapped",[1587,1580]],[[64686,64686],"mapped",[1587,1581]],[[64687,64687],"mapped",[1587,1582]],[[64688,64688],"mapped",[1587,1605]],[[64689,64689],"mapped",[1589,1581]],[[64690,64690],"mapped",[1589,1582]],[[64691,64691],"mapped",[1589,1605]],[[64692,64692],"mapped",[1590,1580]],[[64693,64693],"mapped",[1590,1581]],[[64694,64694],"mapped",[1590,1582]],[[64695,64695],"mapped",[1590,1605]],[[64696,64696],"mapped",[1591,1581]],[[64697,64697],"mapped",[1592,1605]],[[64698,64698],"mapped",[1593,1580]],[[64699,64699],"mapped",[1593,1605]],[[64700,64700],"mapped",[1594,1580]],[[64701,64701],"mapped",[1594,1605]],[[64702,64702],"mapped",[1601,1580]],[[64703,64703],"mapped",[1601,1581]],[[64704,64704],"mapped",[1601,1582]],[[64705,64705],"mapped",[1601,1605]],[[64706,64706],"mapped",[1602,1581]],[[64707,64707],"mapped",[1602,1605]],[[64708,64708],"mapped",[1603,1580]],[[64709,64709],"mapped",[1603,1581]],[[64710,64710],"mapped",[1603,1582]],[[64711,64711],"mapped",[1603,1604]],[[64712,64712],"mapped",[1603,1605]],[[64713,64713],"mapped",[1604,1580]],[[64714,64714],"mapped",[1604,1581]],[[64715,64715],"mapped",[1604,1582]],[[64716,64716],"mapped",[1604,1605]],[[64717,64717],"mapped",[1604,1607]],[[64718,64718],"mapped",[1605,1580]],[[64719,64719],"mapped",[1605,1581]],[[64720,64720],"mapped",[1605,1582]],[[64721,64721],"mapped",[1605,1605]],[[64722,64722],"mapped",[1606,1580]],[[64723,64723],"mapped",[1606,1581]],[[64724,64724],"mapped",[1606,1582]],[[64725,64725],"mapped",[1606,1605]],[[64726,64726],"mapped",[1606,1607]],[[64727,64727],"mapped",[1607,1580]],[[64728,64728],"mapped",[1607,1605]],[[64729,64729],"mapped",[1607,1648]],[[64730,64730],"mapped",[1610,1580]],[[64731,64731],"mapped",[1610,1581]],[[64732,64732],"mapped",[1610,1582]],[[64733,64733],"mapped",[1610,1605]],[[64734,64734],"mapped",[1610,1607]],[[64735,64735],"mapped",[1574,1605]],[[64736,64736],"mapped",[1574,1607]],[[64737,64737],"mapped",[1576,1605]],[[64738,64738],"mapped",[1576,1607]],[[64739,64739],"mapped",[1578,1605]],[[64740,64740],"mapped",[1578,1607]],[[64741,64741],"mapped",[1579,1605]],[[64742,64742],"mapped",[1579,1607]],[[64743,64743],"mapped",[1587,1605]],[[64744,64744],"mapped",[1587,1607]],[[64745,64745],"mapped",[1588,1605]],[[64746,64746],"mapped",[1588,1607]],[[64747,64747],"mapped",[1603,1604]],[[64748,64748],"mapped",[1603,1605]],[[64749,64749],"mapped",[1604,1605]],[[64750,64750],"mapped",[1606,1605]],[[64751,64751],"mapped",[1606,1607]],[[64752,64752],"mapped",[1610,1605]],[[64753,64753],"mapped",[1610,1607]],[[64754,64754],"mapped",[1600,1614,1617]],[[64755,64755],"mapped",[1600,1615,1617]],[[64756,64756],"mapped",[1600,1616,1617]],[[64757,64757],"mapped",[1591,1609]],[[64758,64758],"mapped",[1591,1610]],[[64759,64759],"mapped",[1593,1609]],[[64760,64760],"mapped",[1593,1610]],[[64761,64761],"mapped",[1594,1609]],[[64762,64762],"mapped",[1594,1610]],[[64763,64763],"mapped",[1587,1609]],[[64764,64764],"mapped",[1587,1610]],[[64765,64765],"mapped",[1588,1609]],[[64766,64766],"mapped",[1588,1610]],[[64767,64767],"mapped",[1581,1609]],[[64768,64768],"mapped",[1581,1610]],[[64769,64769],"mapped",[1580,1609]],[[64770,64770],"mapped",[1580,1610]],[[64771,64771],"mapped",[1582,1609]],[[64772,64772],"mapped",[1582,1610]],[[64773,64773],"mapped",[1589,1609]],[[64774,64774],"mapped",[1589,1610]],[[64775,64775],"mapped",[1590,1609]],[[64776,64776],"mapped",[1590,1610]],[[64777,64777],"mapped",[1588,1580]],[[64778,64778],"mapped",[1588,1581]],[[64779,64779],"mapped",[1588,1582]],[[64780,64780],"mapped",[1588,1605]],[[64781,64781],"mapped",[1588,1585]],[[64782,64782],"mapped",[1587,1585]],[[64783,64783],"mapped",[1589,1585]],[[64784,64784],"mapped",[1590,1585]],[[64785,64785],"mapped",[1591,1609]],[[64786,64786],"mapped",[1591,1610]],[[64787,64787],"mapped",[1593,1609]],[[64788,64788],"mapped",[1593,1610]],[[64789,64789],"mapped",[1594,1609]],[[64790,64790],"mapped",[1594,1610]],[[64791,64791],"mapped",[1587,1609]],[[64792,64792],"mapped",[1587,1610]],[[64793,64793],"mapped",[1588,1609]],[[64794,64794],"mapped",[1588,1610]],[[64795,64795],"mapped",[1581,1609]],[[64796,64796],"mapped",[1581,1610]],[[64797,64797],"mapped",[1580,1609]],[[64798,64798],"mapped",[1580,1610]],[[64799,64799],"mapped",[1582,1609]],[[64800,64800],"mapped",[1582,1610]],[[64801,64801],"mapped",[1589,1609]],[[64802,64802],"mapped",[1589,1610]],[[64803,64803],"mapped",[1590,1609]],[[64804,64804],"mapped",[1590,1610]],[[64805,64805],"mapped",[1588,1580]],[[64806,64806],"mapped",[1588,1581]],[[64807,64807],"mapped",[1588,1582]],[[64808,64808],"mapped",[1588,1605]],[[64809,64809],"mapped",[1588,1585]],[[64810,64810],"mapped",[1587,1585]],[[64811,64811],"mapped",[1589,1585]],[[64812,64812],"mapped",[1590,1585]],[[64813,64813],"mapped",[1588,1580]],[[64814,64814],"mapped",[1588,1581]],[[64815,64815],"mapped",[1588,1582]],[[64816,64816],"mapped",[1588,1605]],[[64817,64817],"mapped",[1587,1607]],[[64818,64818],"mapped",[1588,1607]],[[64819,64819],"mapped",[1591,1605]],[[64820,64820],"mapped",[1587,1580]],[[64821,64821],"mapped",[1587,1581]],[[64822,64822],"mapped",[1587,1582]],[[64823,64823],"mapped",[1588,1580]],[[64824,64824],"mapped",[1588,1581]],[[64825,64825],"mapped",[1588,1582]],[[64826,64826],"mapped",[1591,1605]],[[64827,64827],"mapped",[1592,1605]],[[64828,64829],"mapped",[1575,1611]],[[64830,64831],"valid",[],"NV8"],[[64832,64847],"disallowed"],[[64848,64848],"mapped",[1578,1580,1605]],[[64849,64850],"mapped",[1578,1581,1580]],[[64851,64851],"mapped",[1578,1581,1605]],[[64852,64852],"mapped",[1578,1582,1605]],[[64853,64853],"mapped",[1578,1605,1580]],[[64854,64854],"mapped",[1578,1605,1581]],[[64855,64855],"mapped",[1578,1605,1582]],[[64856,64857],"mapped",[1580,1605,1581]],[[64858,64858],"mapped",[1581,1605,1610]],[[64859,64859],"mapped",[1581,1605,1609]],[[64860,64860],"mapped",[1587,1581,1580]],[[64861,64861],"mapped",[1587,1580,1581]],[[64862,64862],"mapped",[1587,1580,1609]],[[64863,64864],"mapped",[1587,1605,1581]],[[64865,64865],"mapped",[1587,1605,1580]],[[64866,64867],"mapped",[1587,1605,1605]],[[64868,64869],"mapped",[1589,1581,1581]],[[64870,64870],"mapped",[1589,1605,1605]],[[64871,64872],"mapped",[1588,1581,1605]],[[64873,64873],"mapped",[1588,1580,1610]],[[64874,64875],"mapped",[1588,1605,1582]],[[64876,64877],"mapped",[1588,1605,1605]],[[64878,64878],"mapped",[1590,1581,1609]],[[64879,64880],"mapped",[1590,1582,1605]],[[64881,64882],"mapped",[1591,1605,1581]],[[64883,64883],"mapped",[1591,1605,1605]],[[64884,64884],"mapped",[1591,1605,1610]],[[64885,64885],"mapped",[1593,1580,1605]],[[64886,64887],"mapped",[1593,1605,1605]],[[64888,64888],"mapped",[1593,1605,1609]],[[64889,64889],"mapped",[1594,1605,1605]],[[64890,64890],"mapped",[1594,1605,1610]],[[64891,64891],"mapped",[1594,1605,1609]],[[64892,64893],"mapped",[1601,1582,1605]],[[64894,64894],"mapped",[1602,1605,1581]],[[64895,64895],"mapped",[1602,1605,1605]],[[64896,64896],"mapped",[1604,1581,1605]],[[64897,64897],"mapped",[1604,1581,1610]],[[64898,64898],"mapped",[1604,1581,1609]],[[64899,64900],"mapped",[1604,1580,1580]],[[64901,64902],"mapped",[1604,1582,1605]],[[64903,64904],"mapped",[1604,1605,1581]],[[64905,64905],"mapped",[1605,1581,1580]],[[64906,64906],"mapped",[1605,1581,1605]],[[64907,64907],"mapped",[1605,1581,1610]],[[64908,64908],"mapped",[1605,1580,1581]],[[64909,64909],"mapped",[1605,1580,1605]],[[64910,64910],"mapped",[1605,1582,1580]],[[64911,64911],"mapped",[1605,1582,1605]],[[64912,64913],"disallowed"],[[64914,64914],"mapped",[1605,1580,1582]],[[64915,64915],"mapped",[1607,1605,1580]],[[64916,64916],"mapped",[1607,1605,1605]],[[64917,64917],"mapped",[1606,1581,1605]],[[64918,64918],"mapped",[1606,1581,1609]],[[64919,64920],"mapped",[1606,1580,1605]],[[64921,64921],"mapped",[1606,1580,1609]],[[64922,64922],"mapped",[1606,1605,1610]],[[64923,64923],"mapped",[1606,1605,1609]],[[64924,64925],"mapped",[1610,1605,1605]],[[64926,64926],"mapped",[1576,1582,1610]],[[64927,64927],"mapped",[1578,1580,1610]],[[64928,64928],"mapped",[1578,1580,1609]],[[64929,64929],"mapped",[1578,1582,1610]],[[64930,64930],"mapped",[1578,1582,1609]],[[64931,64931],"mapped",[1578,1605,1610]],[[64932,64932],"mapped",[1578,1605,1609]],[[64933,64933],"mapped",[1580,1605,1610]],[[64934,64934],"mapped",[1580,1581,1609]],[[64935,64935],"mapped",[1580,1605,1609]],[[64936,64936],"mapped",[1587,1582,1609]],[[64937,64937],"mapped",[1589,1581,1610]],[[64938,64938],"mapped",[1588,1581,1610]],[[64939,64939],"mapped",[1590,1581,1610]],[[64940,64940],"mapped",[1604,1580,1610]],[[64941,64941],"mapped",[1604,1605,1610]],[[64942,64942],"mapped",[1610,1581,1610]],[[64943,64943],"mapped",[1610,1580,1610]],[[64944,64944],"mapped",[1610,1605,1610]],[[64945,64945],"mapped",[1605,1605,1610]],[[64946,64946],"mapped",[1602,1605,1610]],[[64947,64947],"mapped",[1606,1581,1610]],[[64948,64948],"mapped",[1602,1605,1581]],[[64949,64949],"mapped",[1604,1581,1605]],[[64950,64950],"mapped",[1593,1605,1610]],[[64951,64951],"mapped",[1603,1605,1610]],[[64952,64952],"mapped",[1606,1580,1581]],[[64953,64953],"mapped",[1605,1582,1610]],[[64954,64954],"mapped",[1604,1580,1605]],[[64955,64955],"mapped",[1603,1605,1605]],[[64956,64956],"mapped",[1604,1580,1605]],[[64957,64957],"mapped",[1606,1580,1581]],[[64958,64958],"mapped",[1580,1581,1610]],[[64959,64959],"mapped",[1581,1580,1610]],[[64960,64960],"mapped",[1605,1580,1610]],[[64961,64961],"mapped",[1601,1605,1610]],[[64962,64962],"mapped",[1576,1581,1610]],[[64963,64963],"mapped",[1603,1605,1605]],[[64964,64964],"mapped",[1593,1580,1605]],[[64965,64965],"mapped",[1589,1605,1605]],[[64966,64966],"mapped",[1587,1582,1610]],[[64967,64967],"mapped",[1606,1580,1610]],[[64968,64975],"disallowed"],[[64976,65007],"disallowed"],[[65008,65008],"mapped",[1589,1604,1746]],[[65009,65009],"mapped",[1602,1604,1746]],[[65010,65010],"mapped",[1575,1604,1604,1607]],[[65011,65011],"mapped",[1575,1603,1576,1585]],[[65012,65012],"mapped",[1605,1581,1605,1583]],[[65013,65013],"mapped",[1589,1604,1593,1605]],[[65014,65014],"mapped",[1585,1587,1608,1604]],[[65015,65015],"mapped",[1593,1604,1610,1607]],[[65016,65016],"mapped",[1608,1587,1604,1605]],[[65017,65017],"mapped",[1589,1604,1609]],[[65018,65018],"disallowed_STD3_mapped",[1589,1604,1609,32,1575,1604,1604,1607,32,1593,1604,1610,1607,32,1608,1587,1604,1605]],[[65019,65019],"disallowed_STD3_mapped",[1580,1604,32,1580,1604,1575,1604,1607]],[[65020,65020],"mapped",[1585,1740,1575,1604]],[[65021,65021],"valid",[],"NV8"],[[65022,65023],"disallowed"],[[65024,65039],"ignored"],[[65040,65040],"disallowed_STD3_mapped",[44]],[[65041,65041],"mapped",[12289]],[[65042,65042],"disallowed"],[[65043,65043],"disallowed_STD3_mapped",[58]],[[65044,65044],"disallowed_STD3_mapped",[59]],[[65045,65045],"disallowed_STD3_mapped",[33]],[[65046,65046],"disallowed_STD3_mapped",[63]],[[65047,65047],"mapped",[12310]],[[65048,65048],"mapped",[12311]],[[65049,65049],"disallowed"],[[65050,65055],"disallowed"],[[65056,65059],"valid"],[[65060,65062],"valid"],[[65063,65069],"valid"],[[65070,65071],"valid"],[[65072,65072],"disallowed"],[[65073,65073],"mapped",[8212]],[[65074,65074],"mapped",[8211]],[[65075,65076],"disallowed_STD3_mapped",[95]],[[65077,65077],"disallowed_STD3_mapped",[40]],[[65078,65078],"disallowed_STD3_mapped",[41]],[[65079,65079],"disallowed_STD3_mapped",[123]],[[65080,65080],"disallowed_STD3_mapped",[125]],[[65081,65081],"mapped",[12308]],[[65082,65082],"mapped",[12309]],[[65083,65083],"mapped",[12304]],[[65084,65084],"mapped",[12305]],[[65085,65085],"mapped",[12298]],[[65086,65086],"mapped",[12299]],[[65087,65087],"mapped",[12296]],[[65088,65088],"mapped",[12297]],[[65089,65089],"mapped",[12300]],[[65090,65090],"mapped",[12301]],[[65091,65091],"mapped",[12302]],[[65092,65092],"mapped",[12303]],[[65093,65094],"valid",[],"NV8"],[[65095,65095],"disallowed_STD3_mapped",[91]],[[65096,65096],"disallowed_STD3_mapped",[93]],[[65097,65100],"disallowed_STD3_mapped",[32,773]],[[65101,65103],"disallowed_STD3_mapped",[95]],[[65104,65104],"disallowed_STD3_mapped",[44]],[[65105,65105],"mapped",[12289]],[[65106,65106],"disallowed"],[[65107,65107],"disallowed"],[[65108,65108],"disallowed_STD3_mapped",[59]],[[65109,65109],"disallowed_STD3_mapped",[58]],[[65110,65110],"disallowed_STD3_mapped",[63]],[[65111,65111],"disallowed_STD3_mapped",[33]],[[65112,65112],"mapped",[8212]],[[65113,65113],"disallowed_STD3_mapped",[40]],[[65114,65114],"disallowed_STD3_mapped",[41]],[[65115,65115],"disallowed_STD3_mapped",[123]],[[65116,65116],"disallowed_STD3_mapped",[125]],[[65117,65117],"mapped",[12308]],[[65118,65118],"mapped",[12309]],[[65119,65119],"disallowed_STD3_mapped",[35]],[[65120,65120],"disallowed_STD3_mapped",[38]],[[65121,65121],"disallowed_STD3_mapped",[42]],[[65122,65122],"disallowed_STD3_mapped",[43]],[[65123,65123],"mapped",[45]],[[65124,65124],"disallowed_STD3_mapped",[60]],[[65125,65125],"disallowed_STD3_mapped",[62]],[[65126,65126],"disallowed_STD3_mapped",[61]],[[65127,65127],"disallowed"],[[65128,65128],"disallowed_STD3_mapped",[92]],[[65129,65129],"disallowed_STD3_mapped",[36]],[[65130,65130],"disallowed_STD3_mapped",[37]],[[65131,65131],"disallowed_STD3_mapped",[64]],[[65132,65135],"disallowed"],[[65136,65136],"disallowed_STD3_mapped",[32,1611]],[[65137,65137],"mapped",[1600,1611]],[[65138,65138],"disallowed_STD3_mapped",[32,1612]],[[65139,65139],"valid"],[[65140,65140],"disallowed_STD3_mapped",[32,1613]],[[65141,65141],"disallowed"],[[65142,65142],"disallowed_STD3_mapped",[32,1614]],[[65143,65143],"mapped",[1600,1614]],[[65144,65144],"disallowed_STD3_mapped",[32,1615]],[[65145,65145],"mapped",[1600,1615]],[[65146,65146],"disallowed_STD3_mapped",[32,1616]],[[65147,65147],"mapped",[1600,1616]],[[65148,65148],"disallowed_STD3_mapped",[32,1617]],[[65149,65149],"mapped",[1600,1617]],[[65150,65150],"disallowed_STD3_mapped",[32,1618]],[[65151,65151],"mapped",[1600,1618]],[[65152,65152],"mapped",[1569]],[[65153,65154],"mapped",[1570]],[[65155,65156],"mapped",[1571]],[[65157,65158],"mapped",[1572]],[[65159,65160],"mapped",[1573]],[[65161,65164],"mapped",[1574]],[[65165,65166],"mapped",[1575]],[[65167,65170],"mapped",[1576]],[[65171,65172],"mapped",[1577]],[[65173,65176],"mapped",[1578]],[[65177,65180],"mapped",[1579]],[[65181,65184],"mapped",[1580]],[[65185,65188],"mapped",[1581]],[[65189,65192],"mapped",[1582]],[[65193,65194],"mapped",[1583]],[[65195,65196],"mapped",[1584]],[[65197,65198],"mapped",[1585]],[[65199,65200],"mapped",[1586]],[[65201,65204],"mapped",[1587]],[[65205,65208],"mapped",[1588]],[[65209,65212],"mapped",[1589]],[[65213,65216],"mapped",[1590]],[[65217,65220],"mapped",[1591]],[[65221,65224],"mapped",[1592]],[[65225,65228],"mapped",[1593]],[[65229,65232],"mapped",[1594]],[[65233,65236],"mapped",[1601]],[[65237,65240],"mapped",[1602]],[[65241,65244],"mapped",[1603]],[[65245,65248],"mapped",[1604]],[[65249,65252],"mapped",[1605]],[[65253,65256],"mapped",[1606]],[[65257,65260],"mapped",[1607]],[[65261,65262],"mapped",[1608]],[[65263,65264],"mapped",[1609]],[[65265,65268],"mapped",[1610]],[[65269,65270],"mapped",[1604,1570]],[[65271,65272],"mapped",[1604,1571]],[[65273,65274],"mapped",[1604,1573]],[[65275,65276],"mapped",[1604,1575]],[[65277,65278],"disallowed"],[[65279,65279],"ignored"],[[65280,65280],"disallowed"],[[65281,65281],"disallowed_STD3_mapped",[33]],[[65282,65282],"disallowed_STD3_mapped",[34]],[[65283,65283],"disallowed_STD3_mapped",[35]],[[65284,65284],"disallowed_STD3_mapped",[36]],[[65285,65285],"disallowed_STD3_mapped",[37]],[[65286,65286],"disallowed_STD3_mapped",[38]],[[65287,65287],"disallowed_STD3_mapped",[39]],[[65288,65288],"disallowed_STD3_mapped",[40]],[[65289,65289],"disallowed_STD3_mapped",[41]],[[65290,65290],"disallowed_STD3_mapped",[42]],[[65291,65291],"disallowed_STD3_mapped",[43]],[[65292,65292],"disallowed_STD3_mapped",[44]],[[65293,65293],"mapped",[45]],[[65294,65294],"mapped",[46]],[[65295,65295],"disallowed_STD3_mapped",[47]],[[65296,65296],"mapped",[48]],[[65297,65297],"mapped",[49]],[[65298,65298],"mapped",[50]],[[65299,65299],"mapped",[51]],[[65300,65300],"mapped",[52]],[[65301,65301],"mapped",[53]],[[65302,65302],"mapped",[54]],[[65303,65303],"mapped",[55]],[[65304,65304],"mapped",[56]],[[65305,65305],"mapped",[57]],[[65306,65306],"disallowed_STD3_mapped",[58]],[[65307,65307],"disallowed_STD3_mapped",[59]],[[65308,65308],"disallowed_STD3_mapped",[60]],[[65309,65309],"disallowed_STD3_mapped",[61]],[[65310,65310],"disallowed_STD3_mapped",[62]],[[65311,65311],"disallowed_STD3_mapped",[63]],[[65312,65312],"disallowed_STD3_mapped",[64]],[[65313,65313],"mapped",[97]],[[65314,65314],"mapped",[98]],[[65315,65315],"mapped",[99]],[[65316,65316],"mapped",[100]],[[65317,65317],"mapped",[101]],[[65318,65318],"mapped",[102]],[[65319,65319],"mapped",[103]],[[65320,65320],"mapped",[104]],[[65321,65321],"mapped",[105]],[[65322,65322],"mapped",[106]],[[65323,65323],"mapped",[107]],[[65324,65324],"mapped",[108]],[[65325,65325],"mapped",[109]],[[65326,65326],"mapped",[110]],[[65327,65327],"mapped",[111]],[[65328,65328],"mapped",[112]],[[65329,65329],"mapped",[113]],[[65330,65330],"mapped",[114]],[[65331,65331],"mapped",[115]],[[65332,65332],"mapped",[116]],[[65333,65333],"mapped",[117]],[[65334,65334],"mapped",[118]],[[65335,65335],"mapped",[119]],[[65336,65336],"mapped",[120]],[[65337,65337],"mapped",[121]],[[65338,65338],"mapped",[122]],[[65339,65339],"disallowed_STD3_mapped",[91]],[[65340,65340],"disallowed_STD3_mapped",[92]],[[65341,65341],"disallowed_STD3_mapped",[93]],[[65342,65342],"disallowed_STD3_mapped",[94]],[[65343,65343],"disallowed_STD3_mapped",[95]],[[65344,65344],"disallowed_STD3_mapped",[96]],[[65345,65345],"mapped",[97]],[[65346,65346],"mapped",[98]],[[65347,65347],"mapped",[99]],[[65348,65348],"mapped",[100]],[[65349,65349],"mapped",[101]],[[65350,65350],"mapped",[102]],[[65351,65351],"mapped",[103]],[[65352,65352],"mapped",[104]],[[65353,65353],"mapped",[105]],[[65354,65354],"mapped",[106]],[[65355,65355],"mapped",[107]],[[65356,65356],"mapped",[108]],[[65357,65357],"mapped",[109]],[[65358,65358],"mapped",[110]],[[65359,65359],"mapped",[111]],[[65360,65360],"mapped",[112]],[[65361,65361],"mapped",[113]],[[65362,65362],"mapped",[114]],[[65363,65363],"mapped",[115]],[[65364,65364],"mapped",[116]],[[65365,65365],"mapped",[117]],[[65366,65366],"mapped",[118]],[[65367,65367],"mapped",[119]],[[65368,65368],"mapped",[120]],[[65369,65369],"mapped",[121]],[[65370,65370],"mapped",[122]],[[65371,65371],"disallowed_STD3_mapped",[123]],[[65372,65372],"disallowed_STD3_mapped",[124]],[[65373,65373],"disallowed_STD3_mapped",[125]],[[65374,65374],"disallowed_STD3_mapped",[126]],[[65375,65375],"mapped",[10629]],[[65376,65376],"mapped",[10630]],[[65377,65377],"mapped",[46]],[[65378,65378],"mapped",[12300]],[[65379,65379],"mapped",[12301]],[[65380,65380],"mapped",[12289]],[[65381,65381],"mapped",[12539]],[[65382,65382],"mapped",[12530]],[[65383,65383],"mapped",[12449]],[[65384,65384],"mapped",[12451]],[[65385,65385],"mapped",[12453]],[[65386,65386],"mapped",[12455]],[[65387,65387],"mapped",[12457]],[[65388,65388],"mapped",[12515]],[[65389,65389],"mapped",[12517]],[[65390,65390],"mapped",[12519]],[[65391,65391],"mapped",[12483]],[[65392,65392],"mapped",[12540]],[[65393,65393],"mapped",[12450]],[[65394,65394],"mapped",[12452]],[[65395,65395],"mapped",[12454]],[[65396,65396],"mapped",[12456]],[[65397,65397],"mapped",[12458]],[[65398,65398],"mapped",[12459]],[[65399,65399],"mapped",[12461]],[[65400,65400],"mapped",[12463]],[[65401,65401],"mapped",[12465]],[[65402,65402],"mapped",[12467]],[[65403,65403],"mapped",[12469]],[[65404,65404],"mapped",[12471]],[[65405,65405],"mapped",[12473]],[[65406,65406],"mapped",[12475]],[[65407,65407],"mapped",[12477]],[[65408,65408],"mapped",[12479]],[[65409,65409],"mapped",[12481]],[[65410,65410],"mapped",[12484]],[[65411,65411],"mapped",[12486]],[[65412,65412],"mapped",[12488]],[[65413,65413],"mapped",[12490]],[[65414,65414],"mapped",[12491]],[[65415,65415],"mapped",[12492]],[[65416,65416],"mapped",[12493]],[[65417,65417],"mapped",[12494]],[[65418,65418],"mapped",[12495]],[[65419,65419],"mapped",[12498]],[[65420,65420],"mapped",[12501]],[[65421,65421],"mapped",[12504]],[[65422,65422],"mapped",[12507]],[[65423,65423],"mapped",[12510]],[[65424,65424],"mapped",[12511]],[[65425,65425],"mapped",[12512]],[[65426,65426],"mapped",[12513]],[[65427,65427],"mapped",[12514]],[[65428,65428],"mapped",[12516]],[[65429,65429],"mapped",[12518]],[[65430,65430],"mapped",[12520]],[[65431,65431],"mapped",[12521]],[[65432,65432],"mapped",[12522]],[[65433,65433],"mapped",[12523]],[[65434,65434],"mapped",[12524]],[[65435,65435],"mapped",[12525]],[[65436,65436],"mapped",[12527]],[[65437,65437],"mapped",[12531]],[[65438,65438],"mapped",[12441]],[[65439,65439],"mapped",[12442]],[[65440,65440],"disallowed"],[[65441,65441],"mapped",[4352]],[[65442,65442],"mapped",[4353]],[[65443,65443],"mapped",[4522]],[[65444,65444],"mapped",[4354]],[[65445,65445],"mapped",[4524]],[[65446,65446],"mapped",[4525]],[[65447,65447],"mapped",[4355]],[[65448,65448],"mapped",[4356]],[[65449,65449],"mapped",[4357]],[[65450,65450],"mapped",[4528]],[[65451,65451],"mapped",[4529]],[[65452,65452],"mapped",[4530]],[[65453,65453],"mapped",[4531]],[[65454,65454],"mapped",[4532]],[[65455,65455],"mapped",[4533]],[[65456,65456],"mapped",[4378]],[[65457,65457],"mapped",[4358]],[[65458,65458],"mapped",[4359]],[[65459,65459],"mapped",[4360]],[[65460,65460],"mapped",[4385]],[[65461,65461],"mapped",[4361]],[[65462,65462],"mapped",[4362]],[[65463,65463],"mapped",[4363]],[[65464,65464],"mapped",[4364]],[[65465,65465],"mapped",[4365]],[[65466,65466],"mapped",[4366]],[[65467,65467],"mapped",[4367]],[[65468,65468],"mapped",[4368]],[[65469,65469],"mapped",[4369]],[[65470,65470],"mapped",[4370]],[[65471,65473],"disallowed"],[[65474,65474],"mapped",[4449]],[[65475,65475],"mapped",[4450]],[[65476,65476],"mapped",[4451]],[[65477,65477],"mapped",[4452]],[[65478,65478],"mapped",[4453]],[[65479,65479],"mapped",[4454]],[[65480,65481],"disallowed"],[[65482,65482],"mapped",[4455]],[[65483,65483],"mapped",[4456]],[[65484,65484],"mapped",[4457]],[[65485,65485],"mapped",[4458]],[[65486,65486],"mapped",[4459]],[[65487,65487],"mapped",[4460]],[[65488,65489],"disallowed"],[[65490,65490],"mapped",[4461]],[[65491,65491],"mapped",[4462]],[[65492,65492],"mapped",[4463]],[[65493,65493],"mapped",[4464]],[[65494,65494],"mapped",[4465]],[[65495,65495],"mapped",[4466]],[[65496,65497],"disallowed"],[[65498,65498],"mapped",[4467]],[[65499,65499],"mapped",[4468]],[[65500,65500],"mapped",[4469]],[[65501,65503],"disallowed"],[[65504,65504],"mapped",[162]],[[65505,65505],"mapped",[163]],[[65506,65506],"mapped",[172]],[[65507,65507],"disallowed_STD3_mapped",[32,772]],[[65508,65508],"mapped",[166]],[[65509,65509],"mapped",[165]],[[65510,65510],"mapped",[8361]],[[65511,65511],"disallowed"],[[65512,65512],"mapped",[9474]],[[65513,65513],"mapped",[8592]],[[65514,65514],"mapped",[8593]],[[65515,65515],"mapped",[8594]],[[65516,65516],"mapped",[8595]],[[65517,65517],"mapped",[9632]],[[65518,65518],"mapped",[9675]],[[65519,65528],"disallowed"],[[65529,65531],"disallowed"],[[65532,65532],"disallowed"],[[65533,65533],"disallowed"],[[65534,65535],"disallowed"],[[65536,65547],"valid"],[[65548,65548],"disallowed"],[[65549,65574],"valid"],[[65575,65575],"disallowed"],[[65576,65594],"valid"],[[65595,65595],"disallowed"],[[65596,65597],"valid"],[[65598,65598],"disallowed"],[[65599,65613],"valid"],[[65614,65615],"disallowed"],[[65616,65629],"valid"],[[65630,65663],"disallowed"],[[65664,65786],"valid"],[[65787,65791],"disallowed"],[[65792,65794],"valid",[],"NV8"],[[65795,65798],"disallowed"],[[65799,65843],"valid",[],"NV8"],[[65844,65846],"disallowed"],[[65847,65855],"valid",[],"NV8"],[[65856,65930],"valid",[],"NV8"],[[65931,65932],"valid",[],"NV8"],[[65933,65935],"disallowed"],[[65936,65947],"valid",[],"NV8"],[[65948,65951],"disallowed"],[[65952,65952],"valid",[],"NV8"],[[65953,65999],"disallowed"],[[66000,66044],"valid",[],"NV8"],[[66045,66045],"valid"],[[66046,66175],"disallowed"],[[66176,66204],"valid"],[[66205,66207],"disallowed"],[[66208,66256],"valid"],[[66257,66271],"disallowed"],[[66272,66272],"valid"],[[66273,66299],"valid",[],"NV8"],[[66300,66303],"disallowed"],[[66304,66334],"valid"],[[66335,66335],"valid"],[[66336,66339],"valid",[],"NV8"],[[66340,66351],"disallowed"],[[66352,66368],"valid"],[[66369,66369],"valid",[],"NV8"],[[66370,66377],"valid"],[[66378,66378],"valid",[],"NV8"],[[66379,66383],"disallowed"],[[66384,66426],"valid"],[[66427,66431],"disallowed"],[[66432,66461],"valid"],[[66462,66462],"disallowed"],[[66463,66463],"valid",[],"NV8"],[[66464,66499],"valid"],[[66500,66503],"disallowed"],[[66504,66511],"valid"],[[66512,66517],"valid",[],"NV8"],[[66518,66559],"disallowed"],[[66560,66560],"mapped",[66600]],[[66561,66561],"mapped",[66601]],[[66562,66562],"mapped",[66602]],[[66563,66563],"mapped",[66603]],[[66564,66564],"mapped",[66604]],[[66565,66565],"mapped",[66605]],[[66566,66566],"mapped",[66606]],[[66567,66567],"mapped",[66607]],[[66568,66568],"mapped",[66608]],[[66569,66569],"mapped",[66609]],[[66570,66570],"mapped",[66610]],[[66571,66571],"mapped",[66611]],[[66572,66572],"mapped",[66612]],[[66573,66573],"mapped",[66613]],[[66574,66574],"mapped",[66614]],[[66575,66575],"mapped",[66615]],[[66576,66576],"mapped",[66616]],[[66577,66577],"mapped",[66617]],[[66578,66578],"mapped",[66618]],[[66579,66579],"mapped",[66619]],[[66580,66580],"mapped",[66620]],[[66581,66581],"mapped",[66621]],[[66582,66582],"mapped",[66622]],[[66583,66583],"mapped",[66623]],[[66584,66584],"mapped",[66624]],[[66585,66585],"mapped",[66625]],[[66586,66586],"mapped",[66626]],[[66587,66587],"mapped",[66627]],[[66588,66588],"mapped",[66628]],[[66589,66589],"mapped",[66629]],[[66590,66590],"mapped",[66630]],[[66591,66591],"mapped",[66631]],[[66592,66592],"mapped",[66632]],[[66593,66593],"mapped",[66633]],[[66594,66594],"mapped",[66634]],[[66595,66595],"mapped",[66635]],[[66596,66596],"mapped",[66636]],[[66597,66597],"mapped",[66637]],[[66598,66598],"mapped",[66638]],[[66599,66599],"mapped",[66639]],[[66600,66637],"valid"],[[66638,66717],"valid"],[[66718,66719],"disallowed"],[[66720,66729],"valid"],[[66730,66815],"disallowed"],[[66816,66855],"valid"],[[66856,66863],"disallowed"],[[66864,66915],"valid"],[[66916,66926],"disallowed"],[[66927,66927],"valid",[],"NV8"],[[66928,67071],"disallowed"],[[67072,67382],"valid"],[[67383,67391],"disallowed"],[[67392,67413],"valid"],[[67414,67423],"disallowed"],[[67424,67431],"valid"],[[67432,67583],"disallowed"],[[67584,67589],"valid"],[[67590,67591],"disallowed"],[[67592,67592],"valid"],[[67593,67593],"disallowed"],[[67594,67637],"valid"],[[67638,67638],"disallowed"],[[67639,67640],"valid"],[[67641,67643],"disallowed"],[[67644,67644],"valid"],[[67645,67646],"disallowed"],[[67647,67647],"valid"],[[67648,67669],"valid"],[[67670,67670],"disallowed"],[[67671,67679],"valid",[],"NV8"],[[67680,67702],"valid"],[[67703,67711],"valid",[],"NV8"],[[67712,67742],"valid"],[[67743,67750],"disallowed"],[[67751,67759],"valid",[],"NV8"],[[67760,67807],"disallowed"],[[67808,67826],"valid"],[[67827,67827],"disallowed"],[[67828,67829],"valid"],[[67830,67834],"disallowed"],[[67835,67839],"valid",[],"NV8"],[[67840,67861],"valid"],[[67862,67865],"valid",[],"NV8"],[[67866,67867],"valid",[],"NV8"],[[67868,67870],"disallowed"],[[67871,67871],"valid",[],"NV8"],[[67872,67897],"valid"],[[67898,67902],"disallowed"],[[67903,67903],"valid",[],"NV8"],[[67904,67967],"disallowed"],[[67968,68023],"valid"],[[68024,68027],"disallowed"],[[68028,68029],"valid",[],"NV8"],[[68030,68031],"valid"],[[68032,68047],"valid",[],"NV8"],[[68048,68049],"disallowed"],[[68050,68095],"valid",[],"NV8"],[[68096,68099],"valid"],[[68100,68100],"disallowed"],[[68101,68102],"valid"],[[68103,68107],"disallowed"],[[68108,68115],"valid"],[[68116,68116],"disallowed"],[[68117,68119],"valid"],[[68120,68120],"disallowed"],[[68121,68147],"valid"],[[68148,68151],"disallowed"],[[68152,68154],"valid"],[[68155,68158],"disallowed"],[[68159,68159],"valid"],[[68160,68167],"valid",[],"NV8"],[[68168,68175],"disallowed"],[[68176,68184],"valid",[],"NV8"],[[68185,68191],"disallowed"],[[68192,68220],"valid"],[[68221,68223],"valid",[],"NV8"],[[68224,68252],"valid"],[[68253,68255],"valid",[],"NV8"],[[68256,68287],"disallowed"],[[68288,68295],"valid"],[[68296,68296],"valid",[],"NV8"],[[68297,68326],"valid"],[[68327,68330],"disallowed"],[[68331,68342],"valid",[],"NV8"],[[68343,68351],"disallowed"],[[68352,68405],"valid"],[[68406,68408],"disallowed"],[[68409,68415],"valid",[],"NV8"],[[68416,68437],"valid"],[[68438,68439],"disallowed"],[[68440,68447],"valid",[],"NV8"],[[68448,68466],"valid"],[[68467,68471],"disallowed"],[[68472,68479],"valid",[],"NV8"],[[68480,68497],"valid"],[[68498,68504],"disallowed"],[[68505,68508],"valid",[],"NV8"],[[68509,68520],"disallowed"],[[68521,68527],"valid",[],"NV8"],[[68528,68607],"disallowed"],[[68608,68680],"valid"],[[68681,68735],"disallowed"],[[68736,68736],"mapped",[68800]],[[68737,68737],"mapped",[68801]],[[68738,68738],"mapped",[68802]],[[68739,68739],"mapped",[68803]],[[68740,68740],"mapped",[68804]],[[68741,68741],"mapped",[68805]],[[68742,68742],"mapped",[68806]],[[68743,68743],"mapped",[68807]],[[68744,68744],"mapped",[68808]],[[68745,68745],"mapped",[68809]],[[68746,68746],"mapped",[68810]],[[68747,68747],"mapped",[68811]],[[68748,68748],"mapped",[68812]],[[68749,68749],"mapped",[68813]],[[68750,68750],"mapped",[68814]],[[68751,68751],"mapped",[68815]],[[68752,68752],"mapped",[68816]],[[68753,68753],"mapped",[68817]],[[68754,68754],"mapped",[68818]],[[68755,68755],"mapped",[68819]],[[68756,68756],"mapped",[68820]],[[68757,68757],"mapped",[68821]],[[68758,68758],"mapped",[68822]],[[68759,68759],"mapped",[68823]],[[68760,68760],"mapped",[68824]],[[68761,68761],"mapped",[68825]],[[68762,68762],"mapped",[68826]],[[68763,68763],"mapped",[68827]],[[68764,68764],"mapped",[68828]],[[68765,68765],"mapped",[68829]],[[68766,68766],"mapped",[68830]],[[68767,68767],"mapped",[68831]],[[68768,68768],"mapped",[68832]],[[68769,68769],"mapped",[68833]],[[68770,68770],"mapped",[68834]],[[68771,68771],"mapped",[68835]],[[68772,68772],"mapped",[68836]],[[68773,68773],"mapped",[68837]],[[68774,68774],"mapped",[68838]],[[68775,68775],"mapped",[68839]],[[68776,68776],"mapped",[68840]],[[68777,68777],"mapped",[68841]],[[68778,68778],"mapped",[68842]],[[68779,68779],"mapped",[68843]],[[68780,68780],"mapped",[68844]],[[68781,68781],"mapped",[68845]],[[68782,68782],"mapped",[68846]],[[68783,68783],"mapped",[68847]],[[68784,68784],"mapped",[68848]],[[68785,68785],"mapped",[68849]],[[68786,68786],"mapped",[68850]],[[68787,68799],"disallowed"],[[68800,68850],"valid"],[[68851,68857],"disallowed"],[[68858,68863],"valid",[],"NV8"],[[68864,69215],"disallowed"],[[69216,69246],"valid",[],"NV8"],[[69247,69631],"disallowed"],[[69632,69702],"valid"],[[69703,69709],"valid",[],"NV8"],[[69710,69713],"disallowed"],[[69714,69733],"valid",[],"NV8"],[[69734,69743],"valid"],[[69744,69758],"disallowed"],[[69759,69759],"valid"],[[69760,69818],"valid"],[[69819,69820],"valid",[],"NV8"],[[69821,69821],"disallowed"],[[69822,69825],"valid",[],"NV8"],[[69826,69839],"disallowed"],[[69840,69864],"valid"],[[69865,69871],"disallowed"],[[69872,69881],"valid"],[[69882,69887],"disallowed"],[[69888,69940],"valid"],[[69941,69941],"disallowed"],[[69942,69951],"valid"],[[69952,69955],"valid",[],"NV8"],[[69956,69967],"disallowed"],[[69968,70003],"valid"],[[70004,70005],"valid",[],"NV8"],[[70006,70006],"valid"],[[70007,70015],"disallowed"],[[70016,70084],"valid"],[[70085,70088],"valid",[],"NV8"],[[70089,70089],"valid",[],"NV8"],[[70090,70092],"valid"],[[70093,70093],"valid",[],"NV8"],[[70094,70095],"disallowed"],[[70096,70105],"valid"],[[70106,70106],"valid"],[[70107,70107],"valid",[],"NV8"],[[70108,70108],"valid"],[[70109,70111],"valid",[],"NV8"],[[70112,70112],"disallowed"],[[70113,70132],"valid",[],"NV8"],[[70133,70143],"disallowed"],[[70144,70161],"valid"],[[70162,70162],"disallowed"],[[70163,70199],"valid"],[[70200,70205],"valid",[],"NV8"],[[70206,70271],"disallowed"],[[70272,70278],"valid"],[[70279,70279],"disallowed"],[[70280,70280],"valid"],[[70281,70281],"disallowed"],[[70282,70285],"valid"],[[70286,70286],"disallowed"],[[70287,70301],"valid"],[[70302,70302],"disallowed"],[[70303,70312],"valid"],[[70313,70313],"valid",[],"NV8"],[[70314,70319],"disallowed"],[[70320,70378],"valid"],[[70379,70383],"disallowed"],[[70384,70393],"valid"],[[70394,70399],"disallowed"],[[70400,70400],"valid"],[[70401,70403],"valid"],[[70404,70404],"disallowed"],[[70405,70412],"valid"],[[70413,70414],"disallowed"],[[70415,70416],"valid"],[[70417,70418],"disallowed"],[[70419,70440],"valid"],[[70441,70441],"disallowed"],[[70442,70448],"valid"],[[70449,70449],"disallowed"],[[70450,70451],"valid"],[[70452,70452],"disallowed"],[[70453,70457],"valid"],[[70458,70459],"disallowed"],[[70460,70468],"valid"],[[70469,70470],"disallowed"],[[70471,70472],"valid"],[[70473,70474],"disallowed"],[[70475,70477],"valid"],[[70478,70479],"disallowed"],[[70480,70480],"valid"],[[70481,70486],"disallowed"],[[70487,70487],"valid"],[[70488,70492],"disallowed"],[[70493,70499],"valid"],[[70500,70501],"disallowed"],[[70502,70508],"valid"],[[70509,70511],"disallowed"],[[70512,70516],"valid"],[[70517,70783],"disallowed"],[[70784,70853],"valid"],[[70854,70854],"valid",[],"NV8"],[[70855,70855],"valid"],[[70856,70863],"disallowed"],[[70864,70873],"valid"],[[70874,71039],"disallowed"],[[71040,71093],"valid"],[[71094,71095],"disallowed"],[[71096,71104],"valid"],[[71105,71113],"valid",[],"NV8"],[[71114,71127],"valid",[],"NV8"],[[71128,71133],"valid"],[[71134,71167],"disallowed"],[[71168,71232],"valid"],[[71233,71235],"valid",[],"NV8"],[[71236,71236],"valid"],[[71237,71247],"disallowed"],[[71248,71257],"valid"],[[71258,71295],"disallowed"],[[71296,71351],"valid"],[[71352,71359],"disallowed"],[[71360,71369],"valid"],[[71370,71423],"disallowed"],[[71424,71449],"valid"],[[71450,71452],"disallowed"],[[71453,71467],"valid"],[[71468,71471],"disallowed"],[[71472,71481],"valid"],[[71482,71487],"valid",[],"NV8"],[[71488,71839],"disallowed"],[[71840,71840],"mapped",[71872]],[[71841,71841],"mapped",[71873]],[[71842,71842],"mapped",[71874]],[[71843,71843],"mapped",[71875]],[[71844,71844],"mapped",[71876]],[[71845,71845],"mapped",[71877]],[[71846,71846],"mapped",[71878]],[[71847,71847],"mapped",[71879]],[[71848,71848],"mapped",[71880]],[[71849,71849],"mapped",[71881]],[[71850,71850],"mapped",[71882]],[[71851,71851],"mapped",[71883]],[[71852,71852],"mapped",[71884]],[[71853,71853],"mapped",[71885]],[[71854,71854],"mapped",[71886]],[[71855,71855],"mapped",[71887]],[[71856,71856],"mapped",[71888]],[[71857,71857],"mapped",[71889]],[[71858,71858],"mapped",[71890]],[[71859,71859],"mapped",[71891]],[[71860,71860],"mapped",[71892]],[[71861,71861],"mapped",[71893]],[[71862,71862],"mapped",[71894]],[[71863,71863],"mapped",[71895]],[[71864,71864],"mapped",[71896]],[[71865,71865],"mapped",[71897]],[[71866,71866],"mapped",[71898]],[[71867,71867],"mapped",[71899]],[[71868,71868],"mapped",[71900]],[[71869,71869],"mapped",[71901]],[[71870,71870],"mapped",[71902]],[[71871,71871],"mapped",[71903]],[[71872,71913],"valid"],[[71914,71922],"valid",[],"NV8"],[[71923,71934],"disallowed"],[[71935,71935],"valid"],[[71936,72383],"disallowed"],[[72384,72440],"valid"],[[72441,73727],"disallowed"],[[73728,74606],"valid"],[[74607,74648],"valid"],[[74649,74649],"valid"],[[74650,74751],"disallowed"],[[74752,74850],"valid",[],"NV8"],[[74851,74862],"valid",[],"NV8"],[[74863,74863],"disallowed"],[[74864,74867],"valid",[],"NV8"],[[74868,74868],"valid",[],"NV8"],[[74869,74879],"disallowed"],[[74880,75075],"valid"],[[75076,77823],"disallowed"],[[77824,78894],"valid"],[[78895,82943],"disallowed"],[[82944,83526],"valid"],[[83527,92159],"disallowed"],[[92160,92728],"valid"],[[92729,92735],"disallowed"],[[92736,92766],"valid"],[[92767,92767],"disallowed"],[[92768,92777],"valid"],[[92778,92781],"disallowed"],[[92782,92783],"valid",[],"NV8"],[[92784,92879],"disallowed"],[[92880,92909],"valid"],[[92910,92911],"disallowed"],[[92912,92916],"valid"],[[92917,92917],"valid",[],"NV8"],[[92918,92927],"disallowed"],[[92928,92982],"valid"],[[92983,92991],"valid",[],"NV8"],[[92992,92995],"valid"],[[92996,92997],"valid",[],"NV8"],[[92998,93007],"disallowed"],[[93008,93017],"valid"],[[93018,93018],"disallowed"],[[93019,93025],"valid",[],"NV8"],[[93026,93026],"disallowed"],[[93027,93047],"valid"],[[93048,93052],"disallowed"],[[93053,93071],"valid"],[[93072,93951],"disallowed"],[[93952,94020],"valid"],[[94021,94031],"disallowed"],[[94032,94078],"valid"],[[94079,94094],"disallowed"],[[94095,94111],"valid"],[[94112,110591],"disallowed"],[[110592,110593],"valid"],[[110594,113663],"disallowed"],[[113664,113770],"valid"],[[113771,113775],"disallowed"],[[113776,113788],"valid"],[[113789,113791],"disallowed"],[[113792,113800],"valid"],[[113801,113807],"disallowed"],[[113808,113817],"valid"],[[113818,113819],"disallowed"],[[113820,113820],"valid",[],"NV8"],[[113821,113822],"valid"],[[113823,113823],"valid",[],"NV8"],[[113824,113827],"ignored"],[[113828,118783],"disallowed"],[[118784,119029],"valid",[],"NV8"],[[119030,119039],"disallowed"],[[119040,119078],"valid",[],"NV8"],[[119079,119080],"disallowed"],[[119081,119081],"valid",[],"NV8"],[[119082,119133],"valid",[],"NV8"],[[119134,119134],"mapped",[119127,119141]],[[119135,119135],"mapped",[119128,119141]],[[119136,119136],"mapped",[119128,119141,119150]],[[119137,119137],"mapped",[119128,119141,119151]],[[119138,119138],"mapped",[119128,119141,119152]],[[119139,119139],"mapped",[119128,119141,119153]],[[119140,119140],"mapped",[119128,119141,119154]],[[119141,119154],"valid",[],"NV8"],[[119155,119162],"disallowed"],[[119163,119226],"valid",[],"NV8"],[[119227,119227],"mapped",[119225,119141]],[[119228,119228],"mapped",[119226,119141]],[[119229,119229],"mapped",[119225,119141,119150]],[[119230,119230],"mapped",[119226,119141,119150]],[[119231,119231],"mapped",[119225,119141,119151]],[[119232,119232],"mapped",[119226,119141,119151]],[[119233,119261],"valid",[],"NV8"],[[119262,119272],"valid",[],"NV8"],[[119273,119295],"disallowed"],[[119296,119365],"valid",[],"NV8"],[[119366,119551],"disallowed"],[[119552,119638],"valid",[],"NV8"],[[119639,119647],"disallowed"],[[119648,119665],"valid",[],"NV8"],[[119666,119807],"disallowed"],[[119808,119808],"mapped",[97]],[[119809,119809],"mapped",[98]],[[119810,119810],"mapped",[99]],[[119811,119811],"mapped",[100]],[[119812,119812],"mapped",[101]],[[119813,119813],"mapped",[102]],[[119814,119814],"mapped",[103]],[[119815,119815],"mapped",[104]],[[119816,119816],"mapped",[105]],[[119817,119817],"mapped",[106]],[[119818,119818],"mapped",[107]],[[119819,119819],"mapped",[108]],[[119820,119820],"mapped",[109]],[[119821,119821],"mapped",[110]],[[119822,119822],"mapped",[111]],[[119823,119823],"mapped",[112]],[[119824,119824],"mapped",[113]],[[119825,119825],"mapped",[114]],[[119826,119826],"mapped",[115]],[[119827,119827],"mapped",[116]],[[119828,119828],"mapped",[117]],[[119829,119829],"mapped",[118]],[[119830,119830],"mapped",[119]],[[119831,119831],"mapped",[120]],[[119832,119832],"mapped",[121]],[[119833,119833],"mapped",[122]],[[119834,119834],"mapped",[97]],[[119835,119835],"mapped",[98]],[[119836,119836],"mapped",[99]],[[119837,119837],"mapped",[100]],[[119838,119838],"mapped",[101]],[[119839,119839],"mapped",[102]],[[119840,119840],"mapped",[103]],[[119841,119841],"mapped",[104]],[[119842,119842],"mapped",[105]],[[119843,119843],"mapped",[106]],[[119844,119844],"mapped",[107]],[[119845,119845],"mapped",[108]],[[119846,119846],"mapped",[109]],[[119847,119847],"mapped",[110]],[[119848,119848],"mapped",[111]],[[119849,119849],"mapped",[112]],[[119850,119850],"mapped",[113]],[[119851,119851],"mapped",[114]],[[119852,119852],"mapped",[115]],[[119853,119853],"mapped",[116]],[[119854,119854],"mapped",[117]],[[119855,119855],"mapped",[118]],[[119856,119856],"mapped",[119]],[[119857,119857],"mapped",[120]],[[119858,119858],"mapped",[121]],[[119859,119859],"mapped",[122]],[[119860,119860],"mapped",[97]],[[119861,119861],"mapped",[98]],[[119862,119862],"mapped",[99]],[[119863,119863],"mapped",[100]],[[119864,119864],"mapped",[101]],[[119865,119865],"mapped",[102]],[[119866,119866],"mapped",[103]],[[119867,119867],"mapped",[104]],[[119868,119868],"mapped",[105]],[[119869,119869],"mapped",[106]],[[119870,119870],"mapped",[107]],[[119871,119871],"mapped",[108]],[[119872,119872],"mapped",[109]],[[119873,119873],"mapped",[110]],[[119874,119874],"mapped",[111]],[[119875,119875],"mapped",[112]],[[119876,119876],"mapped",[113]],[[119877,119877],"mapped",[114]],[[119878,119878],"mapped",[115]],[[119879,119879],"mapped",[116]],[[119880,119880],"mapped",[117]],[[119881,119881],"mapped",[118]],[[119882,119882],"mapped",[119]],[[119883,119883],"mapped",[120]],[[119884,119884],"mapped",[121]],[[119885,119885],"mapped",[122]],[[119886,119886],"mapped",[97]],[[119887,119887],"mapped",[98]],[[119888,119888],"mapped",[99]],[[119889,119889],"mapped",[100]],[[119890,119890],"mapped",[101]],[[119891,119891],"mapped",[102]],[[119892,119892],"mapped",[103]],[[119893,119893],"disallowed"],[[119894,119894],"mapped",[105]],[[119895,119895],"mapped",[106]],[[119896,119896],"mapped",[107]],[[119897,119897],"mapped",[108]],[[119898,119898],"mapped",[109]],[[119899,119899],"mapped",[110]],[[119900,119900],"mapped",[111]],[[119901,119901],"mapped",[112]],[[119902,119902],"mapped",[113]],[[119903,119903],"mapped",[114]],[[119904,119904],"mapped",[115]],[[119905,119905],"mapped",[116]],[[119906,119906],"mapped",[117]],[[119907,119907],"mapped",[118]],[[119908,119908],"mapped",[119]],[[119909,119909],"mapped",[120]],[[119910,119910],"mapped",[121]],[[119911,119911],"mapped",[122]],[[119912,119912],"mapped",[97]],[[119913,119913],"mapped",[98]],[[119914,119914],"mapped",[99]],[[119915,119915],"mapped",[100]],[[119916,119916],"mapped",[101]],[[119917,119917],"mapped",[102]],[[119918,119918],"mapped",[103]],[[119919,119919],"mapped",[104]],[[119920,119920],"mapped",[105]],[[119921,119921],"mapped",[106]],[[119922,119922],"mapped",[107]],[[119923,119923],"mapped",[108]],[[119924,119924],"mapped",[109]],[[119925,119925],"mapped",[110]],[[119926,119926],"mapped",[111]],[[119927,119927],"mapped",[112]],[[119928,119928],"mapped",[113]],[[119929,119929],"mapped",[114]],[[119930,119930],"mapped",[115]],[[119931,119931],"mapped",[116]],[[119932,119932],"mapped",[117]],[[119933,119933],"mapped",[118]],[[119934,119934],"mapped",[119]],[[119935,119935],"mapped",[120]],[[119936,119936],"mapped",[121]],[[119937,119937],"mapped",[122]],[[119938,119938],"mapped",[97]],[[119939,119939],"mapped",[98]],[[119940,119940],"mapped",[99]],[[119941,119941],"mapped",[100]],[[119942,119942],"mapped",[101]],[[119943,119943],"mapped",[102]],[[119944,119944],"mapped",[103]],[[119945,119945],"mapped",[104]],[[119946,119946],"mapped",[105]],[[119947,119947],"mapped",[106]],[[119948,119948],"mapped",[107]],[[119949,119949],"mapped",[108]],[[119950,119950],"mapped",[109]],[[119951,119951],"mapped",[110]],[[119952,119952],"mapped",[111]],[[119953,119953],"mapped",[112]],[[119954,119954],"mapped",[113]],[[119955,119955],"mapped",[114]],[[119956,119956],"mapped",[115]],[[119957,119957],"mapped",[116]],[[119958,119958],"mapped",[117]],[[119959,119959],"mapped",[118]],[[119960,119960],"mapped",[119]],[[119961,119961],"mapped",[120]],[[119962,119962],"mapped",[121]],[[119963,119963],"mapped",[122]],[[119964,119964],"mapped",[97]],[[119965,119965],"disallowed"],[[119966,119966],"mapped",[99]],[[119967,119967],"mapped",[100]],[[119968,119969],"disallowed"],[[119970,119970],"mapped",[103]],[[119971,119972],"disallowed"],[[119973,119973],"mapped",[106]],[[119974,119974],"mapped",[107]],[[119975,119976],"disallowed"],[[119977,119977],"mapped",[110]],[[119978,119978],"mapped",[111]],[[119979,119979],"mapped",[112]],[[119980,119980],"mapped",[113]],[[119981,119981],"disallowed"],[[119982,119982],"mapped",[115]],[[119983,119983],"mapped",[116]],[[119984,119984],"mapped",[117]],[[119985,119985],"mapped",[118]],[[119986,119986],"mapped",[119]],[[119987,119987],"mapped",[120]],[[119988,119988],"mapped",[121]],[[119989,119989],"mapped",[122]],[[119990,119990],"mapped",[97]],[[119991,119991],"mapped",[98]],[[119992,119992],"mapped",[99]],[[119993,119993],"mapped",[100]],[[119994,119994],"disallowed"],[[119995,119995],"mapped",[102]],[[119996,119996],"disallowed"],[[119997,119997],"mapped",[104]],[[119998,119998],"mapped",[105]],[[119999,119999],"mapped",[106]],[[120000,120000],"mapped",[107]],[[120001,120001],"mapped",[108]],[[120002,120002],"mapped",[109]],[[120003,120003],"mapped",[110]],[[120004,120004],"disallowed"],[[120005,120005],"mapped",[112]],[[120006,120006],"mapped",[113]],[[120007,120007],"mapped",[114]],[[120008,120008],"mapped",[115]],[[120009,120009],"mapped",[116]],[[120010,120010],"mapped",[117]],[[120011,120011],"mapped",[118]],[[120012,120012],"mapped",[119]],[[120013,120013],"mapped",[120]],[[120014,120014],"mapped",[121]],[[120015,120015],"mapped",[122]],[[120016,120016],"mapped",[97]],[[120017,120017],"mapped",[98]],[[120018,120018],"mapped",[99]],[[120019,120019],"mapped",[100]],[[120020,120020],"mapped",[101]],[[120021,120021],"mapped",[102]],[[120022,120022],"mapped",[103]],[[120023,120023],"mapped",[104]],[[120024,120024],"mapped",[105]],[[120025,120025],"mapped",[106]],[[120026,120026],"mapped",[107]],[[120027,120027],"mapped",[108]],[[120028,120028],"mapped",[109]],[[120029,120029],"mapped",[110]],[[120030,120030],"mapped",[111]],[[120031,120031],"mapped",[112]],[[120032,120032],"mapped",[113]],[[120033,120033],"mapped",[114]],[[120034,120034],"mapped",[115]],[[120035,120035],"mapped",[116]],[[120036,120036],"mapped",[117]],[[120037,120037],"mapped",[118]],[[120038,120038],"mapped",[119]],[[120039,120039],"mapped",[120]],[[120040,120040],"mapped",[121]],[[120041,120041],"mapped",[122]],[[120042,120042],"mapped",[97]],[[120043,120043],"mapped",[98]],[[120044,120044],"mapped",[99]],[[120045,120045],"mapped",[100]],[[120046,120046],"mapped",[101]],[[120047,120047],"mapped",[102]],[[120048,120048],"mapped",[103]],[[120049,120049],"mapped",[104]],[[120050,120050],"mapped",[105]],[[120051,120051],"mapped",[106]],[[120052,120052],"mapped",[107]],[[120053,120053],"mapped",[108]],[[120054,120054],"mapped",[109]],[[120055,120055],"mapped",[110]],[[120056,120056],"mapped",[111]],[[120057,120057],"mapped",[112]],[[120058,120058],"mapped",[113]],[[120059,120059],"mapped",[114]],[[120060,120060],"mapped",[115]],[[120061,120061],"mapped",[116]],[[120062,120062],"mapped",[117]],[[120063,120063],"mapped",[118]],[[120064,120064],"mapped",[119]],[[120065,120065],"mapped",[120]],[[120066,120066],"mapped",[121]],[[120067,120067],"mapped",[122]],[[120068,120068],"mapped",[97]],[[120069,120069],"mapped",[98]],[[120070,120070],"disallowed"],[[120071,120071],"mapped",[100]],[[120072,120072],"mapped",[101]],[[120073,120073],"mapped",[102]],[[120074,120074],"mapped",[103]],[[120075,120076],"disallowed"],[[120077,120077],"mapped",[106]],[[120078,120078],"mapped",[107]],[[120079,120079],"mapped",[108]],[[120080,120080],"mapped",[109]],[[120081,120081],"mapped",[110]],[[120082,120082],"mapped",[111]],[[120083,120083],"mapped",[112]],[[120084,120084],"mapped",[113]],[[120085,120085],"disallowed"],[[120086,120086],"mapped",[115]],[[120087,120087],"mapped",[116]],[[120088,120088],"mapped",[117]],[[120089,120089],"mapped",[118]],[[120090,120090],"mapped",[119]],[[120091,120091],"mapped",[120]],[[120092,120092],"mapped",[121]],[[120093,120093],"disallowed"],[[120094,120094],"mapped",[97]],[[120095,120095],"mapped",[98]],[[120096,120096],"mapped",[99]],[[120097,120097],"mapped",[100]],[[120098,120098],"mapped",[101]],[[120099,120099],"mapped",[102]],[[120100,120100],"mapped",[103]],[[120101,120101],"mapped",[104]],[[120102,120102],"mapped",[105]],[[120103,120103],"mapped",[106]],[[120104,120104],"mapped",[107]],[[120105,120105],"mapped",[108]],[[120106,120106],"mapped",[109]],[[120107,120107],"mapped",[110]],[[120108,120108],"mapped",[111]],[[120109,120109],"mapped",[112]],[[120110,120110],"mapped",[113]],[[120111,120111],"mapped",[114]],[[120112,120112],"mapped",[115]],[[120113,120113],"mapped",[116]],[[120114,120114],"mapped",[117]],[[120115,120115],"mapped",[118]],[[120116,120116],"mapped",[119]],[[120117,120117],"mapped",[120]],[[120118,120118],"mapped",[121]],[[120119,120119],"mapped",[122]],[[120120,120120],"mapped",[97]],[[120121,120121],"mapped",[98]],[[120122,120122],"disallowed"],[[120123,120123],"mapped",[100]],[[120124,120124],"mapped",[101]],[[120125,120125],"mapped",[102]],[[120126,120126],"mapped",[103]],[[120127,120127],"disallowed"],[[120128,120128],"mapped",[105]],[[120129,120129],"mapped",[106]],[[120130,120130],"mapped",[107]],[[120131,120131],"mapped",[108]],[[120132,120132],"mapped",[109]],[[120133,120133],"disallowed"],[[120134,120134],"mapped",[111]],[[120135,120137],"disallowed"],[[120138,120138],"mapped",[115]],[[120139,120139],"mapped",[116]],[[120140,120140],"mapped",[117]],[[120141,120141],"mapped",[118]],[[120142,120142],"mapped",[119]],[[120143,120143],"mapped",[120]],[[120144,120144],"mapped",[121]],[[120145,120145],"disallowed"],[[120146,120146],"mapped",[97]],[[120147,120147],"mapped",[98]],[[120148,120148],"mapped",[99]],[[120149,120149],"mapped",[100]],[[120150,120150],"mapped",[101]],[[120151,120151],"mapped",[102]],[[120152,120152],"mapped",[103]],[[120153,120153],"mapped",[104]],[[120154,120154],"mapped",[105]],[[120155,120155],"mapped",[106]],[[120156,120156],"mapped",[107]],[[120157,120157],"mapped",[108]],[[120158,120158],"mapped",[109]],[[120159,120159],"mapped",[110]],[[120160,120160],"mapped",[111]],[[120161,120161],"mapped",[112]],[[120162,120162],"mapped",[113]],[[120163,120163],"mapped",[114]],[[120164,120164],"mapped",[115]],[[120165,120165],"mapped",[116]],[[120166,120166],"mapped",[117]],[[120167,120167],"mapped",[118]],[[120168,120168],"mapped",[119]],[[120169,120169],"mapped",[120]],[[120170,120170],"mapped",[121]],[[120171,120171],"mapped",[122]],[[120172,120172],"mapped",[97]],[[120173,120173],"mapped",[98]],[[120174,120174],"mapped",[99]],[[120175,120175],"mapped",[100]],[[120176,120176],"mapped",[101]],[[120177,120177],"mapped",[102]],[[120178,120178],"mapped",[103]],[[120179,120179],"mapped",[104]],[[120180,120180],"mapped",[105]],[[120181,120181],"mapped",[106]],[[120182,120182],"mapped",[107]],[[120183,120183],"mapped",[108]],[[120184,120184],"mapped",[109]],[[120185,120185],"mapped",[110]],[[120186,120186],"mapped",[111]],[[120187,120187],"mapped",[112]],[[120188,120188],"mapped",[113]],[[120189,120189],"mapped",[114]],[[120190,120190],"mapped",[115]],[[120191,120191],"mapped",[116]],[[120192,120192],"mapped",[117]],[[120193,120193],"mapped",[118]],[[120194,120194],"mapped",[119]],[[120195,120195],"mapped",[120]],[[120196,120196],"mapped",[121]],[[120197,120197],"mapped",[122]],[[120198,120198],"mapped",[97]],[[120199,120199],"mapped",[98]],[[120200,120200],"mapped",[99]],[[120201,120201],"mapped",[100]],[[120202,120202],"mapped",[101]],[[120203,120203],"mapped",[102]],[[120204,120204],"mapped",[103]],[[120205,120205],"mapped",[104]],[[120206,120206],"mapped",[105]],[[120207,120207],"mapped",[106]],[[120208,120208],"mapped",[107]],[[120209,120209],"mapped",[108]],[[120210,120210],"mapped",[109]],[[120211,120211],"mapped",[110]],[[120212,120212],"mapped",[111]],[[120213,120213],"mapped",[112]],[[120214,120214],"mapped",[113]],[[120215,120215],"mapped",[114]],[[120216,120216],"mapped",[115]],[[120217,120217],"mapped",[116]],[[120218,120218],"mapped",[117]],[[120219,120219],"mapped",[118]],[[120220,120220],"mapped",[119]],[[120221,120221],"mapped",[120]],[[120222,120222],"mapped",[121]],[[120223,120223],"mapped",[122]],[[120224,120224],"mapped",[97]],[[120225,120225],"mapped",[98]],[[120226,120226],"mapped",[99]],[[120227,120227],"mapped",[100]],[[120228,120228],"mapped",[101]],[[120229,120229],"mapped",[102]],[[120230,120230],"mapped",[103]],[[120231,120231],"mapped",[104]],[[120232,120232],"mapped",[105]],[[120233,120233],"mapped",[106]],[[120234,120234],"mapped",[107]],[[120235,120235],"mapped",[108]],[[120236,120236],"mapped",[109]],[[120237,120237],"mapped",[110]],[[120238,120238],"mapped",[111]],[[120239,120239],"mapped",[112]],[[120240,120240],"mapped",[113]],[[120241,120241],"mapped",[114]],[[120242,120242],"mapped",[115]],[[120243,120243],"mapped",[116]],[[120244,120244],"mapped",[117]],[[120245,120245],"mapped",[118]],[[120246,120246],"mapped",[119]],[[120247,120247],"mapped",[120]],[[120248,120248],"mapped",[121]],[[120249,120249],"mapped",[122]],[[120250,120250],"mapped",[97]],[[120251,120251],"mapped",[98]],[[120252,120252],"mapped",[99]],[[120253,120253],"mapped",[100]],[[120254,120254],"mapped",[101]],[[120255,120255],"mapped",[102]],[[120256,120256],"mapped",[103]],[[120257,120257],"mapped",[104]],[[120258,120258],"mapped",[105]],[[120259,120259],"mapped",[106]],[[120260,120260],"mapped",[107]],[[120261,120261],"mapped",[108]],[[120262,120262],"mapped",[109]],[[120263,120263],"mapped",[110]],[[120264,120264],"mapped",[111]],[[120265,120265],"mapped",[112]],[[120266,120266],"mapped",[113]],[[120267,120267],"mapped",[114]],[[120268,120268],"mapped",[115]],[[120269,120269],"mapped",[116]],[[120270,120270],"mapped",[117]],[[120271,120271],"mapped",[118]],[[120272,120272],"mapped",[119]],[[120273,120273],"mapped",[120]],[[120274,120274],"mapped",[121]],[[120275,120275],"mapped",[122]],[[120276,120276],"mapped",[97]],[[120277,120277],"mapped",[98]],[[120278,120278],"mapped",[99]],[[120279,120279],"mapped",[100]],[[120280,120280],"mapped",[101]],[[120281,120281],"mapped",[102]],[[120282,120282],"mapped",[103]],[[120283,120283],"mapped",[104]],[[120284,120284],"mapped",[105]],[[120285,120285],"mapped",[106]],[[120286,120286],"mapped",[107]],[[120287,120287],"mapped",[108]],[[120288,120288],"mapped",[109]],[[120289,120289],"mapped",[110]],[[120290,120290],"mapped",[111]],[[120291,120291],"mapped",[112]],[[120292,120292],"mapped",[113]],[[120293,120293],"mapped",[114]],[[120294,120294],"mapped",[115]],[[120295,120295],"mapped",[116]],[[120296,120296],"mapped",[117]],[[120297,120297],"mapped",[118]],[[120298,120298],"mapped",[119]],[[120299,120299],"mapped",[120]],[[120300,120300],"mapped",[121]],[[120301,120301],"mapped",[122]],[[120302,120302],"mapped",[97]],[[120303,120303],"mapped",[98]],[[120304,120304],"mapped",[99]],[[120305,120305],"mapped",[100]],[[120306,120306],"mapped",[101]],[[120307,120307],"mapped",[102]],[[120308,120308],"mapped",[103]],[[120309,120309],"mapped",[104]],[[120310,120310],"mapped",[105]],[[120311,120311],"mapped",[106]],[[120312,120312],"mapped",[107]],[[120313,120313],"mapped",[108]],[[120314,120314],"mapped",[109]],[[120315,120315],"mapped",[110]],[[120316,120316],"mapped",[111]],[[120317,120317],"mapped",[112]],[[120318,120318],"mapped",[113]],[[120319,120319],"mapped",[114]],[[120320,120320],"mapped",[115]],[[120321,120321],"mapped",[116]],[[120322,120322],"mapped",[117]],[[120323,120323],"mapped",[118]],[[120324,120324],"mapped",[119]],[[120325,120325],"mapped",[120]],[[120326,120326],"mapped",[121]],[[120327,120327],"mapped",[122]],[[120328,120328],"mapped",[97]],[[120329,120329],"mapped",[98]],[[120330,120330],"mapped",[99]],[[120331,120331],"mapped",[100]],[[120332,120332],"mapped",[101]],[[120333,120333],"mapped",[102]],[[120334,120334],"mapped",[103]],[[120335,120335],"mapped",[104]],[[120336,120336],"mapped",[105]],[[120337,120337],"mapped",[106]],[[120338,120338],"mapped",[107]],[[120339,120339],"mapped",[108]],[[120340,120340],"mapped",[109]],[[120341,120341],"mapped",[110]],[[120342,120342],"mapped",[111]],[[120343,120343],"mapped",[112]],[[120344,120344],"mapped",[113]],[[120345,120345],"mapped",[114]],[[120346,120346],"mapped",[115]],[[120347,120347],"mapped",[116]],[[120348,120348],"mapped",[117]],[[120349,120349],"mapped",[118]],[[120350,120350],"mapped",[119]],[[120351,120351],"mapped",[120]],[[120352,120352],"mapped",[121]],[[120353,120353],"mapped",[122]],[[120354,120354],"mapped",[97]],[[120355,120355],"mapped",[98]],[[120356,120356],"mapped",[99]],[[120357,120357],"mapped",[100]],[[120358,120358],"mapped",[101]],[[120359,120359],"mapped",[102]],[[120360,120360],"mapped",[103]],[[120361,120361],"mapped",[104]],[[120362,120362],"mapped",[105]],[[120363,120363],"mapped",[106]],[[120364,120364],"mapped",[107]],[[120365,120365],"mapped",[108]],[[120366,120366],"mapped",[109]],[[120367,120367],"mapped",[110]],[[120368,120368],"mapped",[111]],[[120369,120369],"mapped",[112]],[[120370,120370],"mapped",[113]],[[120371,120371],"mapped",[114]],[[120372,120372],"mapped",[115]],[[120373,120373],"mapped",[116]],[[120374,120374],"mapped",[117]],[[120375,120375],"mapped",[118]],[[120376,120376],"mapped",[119]],[[120377,120377],"mapped",[120]],[[120378,120378],"mapped",[121]],[[120379,120379],"mapped",[122]],[[120380,120380],"mapped",[97]],[[120381,120381],"mapped",[98]],[[120382,120382],"mapped",[99]],[[120383,120383],"mapped",[100]],[[120384,120384],"mapped",[101]],[[120385,120385],"mapped",[102]],[[120386,120386],"mapped",[103]],[[120387,120387],"mapped",[104]],[[120388,120388],"mapped",[105]],[[120389,120389],"mapped",[106]],[[120390,120390],"mapped",[107]],[[120391,120391],"mapped",[108]],[[120392,120392],"mapped",[109]],[[120393,120393],"mapped",[110]],[[120394,120394],"mapped",[111]],[[120395,120395],"mapped",[112]],[[120396,120396],"mapped",[113]],[[120397,120397],"mapped",[114]],[[120398,120398],"mapped",[115]],[[120399,120399],"mapped",[116]],[[120400,120400],"mapped",[117]],[[120401,120401],"mapped",[118]],[[120402,120402],"mapped",[119]],[[120403,120403],"mapped",[120]],[[120404,120404],"mapped",[121]],[[120405,120405],"mapped",[122]],[[120406,120406],"mapped",[97]],[[120407,120407],"mapped",[98]],[[120408,120408],"mapped",[99]],[[120409,120409],"mapped",[100]],[[120410,120410],"mapped",[101]],[[120411,120411],"mapped",[102]],[[120412,120412],"mapped",[103]],[[120413,120413],"mapped",[104]],[[120414,120414],"mapped",[105]],[[120415,120415],"mapped",[106]],[[120416,120416],"mapped",[107]],[[120417,120417],"mapped",[108]],[[120418,120418],"mapped",[109]],[[120419,120419],"mapped",[110]],[[120420,120420],"mapped",[111]],[[120421,120421],"mapped",[112]],[[120422,120422],"mapped",[113]],[[120423,120423],"mapped",[114]],[[120424,120424],"mapped",[115]],[[120425,120425],"mapped",[116]],[[120426,120426],"mapped",[117]],[[120427,120427],"mapped",[118]],[[120428,120428],"mapped",[119]],[[120429,120429],"mapped",[120]],[[120430,120430],"mapped",[121]],[[120431,120431],"mapped",[122]],[[120432,120432],"mapped",[97]],[[120433,120433],"mapped",[98]],[[120434,120434],"mapped",[99]],[[120435,120435],"mapped",[100]],[[120436,120436],"mapped",[101]],[[120437,120437],"mapped",[102]],[[120438,120438],"mapped",[103]],[[120439,120439],"mapped",[104]],[[120440,120440],"mapped",[105]],[[120441,120441],"mapped",[106]],[[120442,120442],"mapped",[107]],[[120443,120443],"mapped",[108]],[[120444,120444],"mapped",[109]],[[120445,120445],"mapped",[110]],[[120446,120446],"mapped",[111]],[[120447,120447],"mapped",[112]],[[120448,120448],"mapped",[113]],[[120449,120449],"mapped",[114]],[[120450,120450],"mapped",[115]],[[120451,120451],"mapped",[116]],[[120452,120452],"mapped",[117]],[[120453,120453],"mapped",[118]],[[120454,120454],"mapped",[119]],[[120455,120455],"mapped",[120]],[[120456,120456],"mapped",[121]],[[120457,120457],"mapped",[122]],[[120458,120458],"mapped",[97]],[[120459,120459],"mapped",[98]],[[120460,120460],"mapped",[99]],[[120461,120461],"mapped",[100]],[[120462,120462],"mapped",[101]],[[120463,120463],"mapped",[102]],[[120464,120464],"mapped",[103]],[[120465,120465],"mapped",[104]],[[120466,120466],"mapped",[105]],[[120467,120467],"mapped",[106]],[[120468,120468],"mapped",[107]],[[120469,120469],"mapped",[108]],[[120470,120470],"mapped",[109]],[[120471,120471],"mapped",[110]],[[120472,120472],"mapped",[111]],[[120473,120473],"mapped",[112]],[[120474,120474],"mapped",[113]],[[120475,120475],"mapped",[114]],[[120476,120476],"mapped",[115]],[[120477,120477],"mapped",[116]],[[120478,120478],"mapped",[117]],[[120479,120479],"mapped",[118]],[[120480,120480],"mapped",[119]],[[120481,120481],"mapped",[120]],[[120482,120482],"mapped",[121]],[[120483,120483],"mapped",[122]],[[120484,120484],"mapped",[305]],[[120485,120485],"mapped",[567]],[[120486,120487],"disallowed"],[[120488,120488],"mapped",[945]],[[120489,120489],"mapped",[946]],[[120490,120490],"mapped",[947]],[[120491,120491],"mapped",[948]],[[120492,120492],"mapped",[949]],[[120493,120493],"mapped",[950]],[[120494,120494],"mapped",[951]],[[120495,120495],"mapped",[952]],[[120496,120496],"mapped",[953]],[[120497,120497],"mapped",[954]],[[120498,120498],"mapped",[955]],[[120499,120499],"mapped",[956]],[[120500,120500],"mapped",[957]],[[120501,120501],"mapped",[958]],[[120502,120502],"mapped",[959]],[[120503,120503],"mapped",[960]],[[120504,120504],"mapped",[961]],[[120505,120505],"mapped",[952]],[[120506,120506],"mapped",[963]],[[120507,120507],"mapped",[964]],[[120508,120508],"mapped",[965]],[[120509,120509],"mapped",[966]],[[120510,120510],"mapped",[967]],[[120511,120511],"mapped",[968]],[[120512,120512],"mapped",[969]],[[120513,120513],"mapped",[8711]],[[120514,120514],"mapped",[945]],[[120515,120515],"mapped",[946]],[[120516,120516],"mapped",[947]],[[120517,120517],"mapped",[948]],[[120518,120518],"mapped",[949]],[[120519,120519],"mapped",[950]],[[120520,120520],"mapped",[951]],[[120521,120521],"mapped",[952]],[[120522,120522],"mapped",[953]],[[120523,120523],"mapped",[954]],[[120524,120524],"mapped",[955]],[[120525,120525],"mapped",[956]],[[120526,120526],"mapped",[957]],[[120527,120527],"mapped",[958]],[[120528,120528],"mapped",[959]],[[120529,120529],"mapped",[960]],[[120530,120530],"mapped",[961]],[[120531,120532],"mapped",[963]],[[120533,120533],"mapped",[964]],[[120534,120534],"mapped",[965]],[[120535,120535],"mapped",[966]],[[120536,120536],"mapped",[967]],[[120537,120537],"mapped",[968]],[[120538,120538],"mapped",[969]],[[120539,120539],"mapped",[8706]],[[120540,120540],"mapped",[949]],[[120541,120541],"mapped",[952]],[[120542,120542],"mapped",[954]],[[120543,120543],"mapped",[966]],[[120544,120544],"mapped",[961]],[[120545,120545],"mapped",[960]],[[120546,120546],"mapped",[945]],[[120547,120547],"mapped",[946]],[[120548,120548],"mapped",[947]],[[120549,120549],"mapped",[948]],[[120550,120550],"mapped",[949]],[[120551,120551],"mapped",[950]],[[120552,120552],"mapped",[951]],[[120553,120553],"mapped",[952]],[[120554,120554],"mapped",[953]],[[120555,120555],"mapped",[954]],[[120556,120556],"mapped",[955]],[[120557,120557],"mapped",[956]],[[120558,120558],"mapped",[957]],[[120559,120559],"mapped",[958]],[[120560,120560],"mapped",[959]],[[120561,120561],"mapped",[960]],[[120562,120562],"mapped",[961]],[[120563,120563],"mapped",[952]],[[120564,120564],"mapped",[963]],[[120565,120565],"mapped",[964]],[[120566,120566],"mapped",[965]],[[120567,120567],"mapped",[966]],[[120568,120568],"mapped",[967]],[[120569,120569],"mapped",[968]],[[120570,120570],"mapped",[969]],[[120571,120571],"mapped",[8711]],[[120572,120572],"mapped",[945]],[[120573,120573],"mapped",[946]],[[120574,120574],"mapped",[947]],[[120575,120575],"mapped",[948]],[[120576,120576],"mapped",[949]],[[120577,120577],"mapped",[950]],[[120578,120578],"mapped",[951]],[[120579,120579],"mapped",[952]],[[120580,120580],"mapped",[953]],[[120581,120581],"mapped",[954]],[[120582,120582],"mapped",[955]],[[120583,120583],"mapped",[956]],[[120584,120584],"mapped",[957]],[[120585,120585],"mapped",[958]],[[120586,120586],"mapped",[959]],[[120587,120587],"mapped",[960]],[[120588,120588],"mapped",[961]],[[120589,120590],"mapped",[963]],[[120591,120591],"mapped",[964]],[[120592,120592],"mapped",[965]],[[120593,120593],"mapped",[966]],[[120594,120594],"mapped",[967]],[[120595,120595],"mapped",[968]],[[120596,120596],"mapped",[969]],[[120597,120597],"mapped",[8706]],[[120598,120598],"mapped",[949]],[[120599,120599],"mapped",[952]],[[120600,120600],"mapped",[954]],[[120601,120601],"mapped",[966]],[[120602,120602],"mapped",[961]],[[120603,120603],"mapped",[960]],[[120604,120604],"mapped",[945]],[[120605,120605],"mapped",[946]],[[120606,120606],"mapped",[947]],[[120607,120607],"mapped",[948]],[[120608,120608],"mapped",[949]],[[120609,120609],"mapped",[950]],[[120610,120610],"mapped",[951]],[[120611,120611],"mapped",[952]],[[120612,120612],"mapped",[953]],[[120613,120613],"mapped",[954]],[[120614,120614],"mapped",[955]],[[120615,120615],"mapped",[956]],[[120616,120616],"mapped",[957]],[[120617,120617],"mapped",[958]],[[120618,120618],"mapped",[959]],[[120619,120619],"mapped",[960]],[[120620,120620],"mapped",[961]],[[120621,120621],"mapped",[952]],[[120622,120622],"mapped",[963]],[[120623,120623],"mapped",[964]],[[120624,120624],"mapped",[965]],[[120625,120625],"mapped",[966]],[[120626,120626],"mapped",[967]],[[120627,120627],"mapped",[968]],[[120628,120628],"mapped",[969]],[[120629,120629],"mapped",[8711]],[[120630,120630],"mapped",[945]],[[120631,120631],"mapped",[946]],[[120632,120632],"mapped",[947]],[[120633,120633],"mapped",[948]],[[120634,120634],"mapped",[949]],[[120635,120635],"mapped",[950]],[[120636,120636],"mapped",[951]],[[120637,120637],"mapped",[952]],[[120638,120638],"mapped",[953]],[[120639,120639],"mapped",[954]],[[120640,120640],"mapped",[955]],[[120641,120641],"mapped",[956]],[[120642,120642],"mapped",[957]],[[120643,120643],"mapped",[958]],[[120644,120644],"mapped",[959]],[[120645,120645],"mapped",[960]],[[120646,120646],"mapped",[961]],[[120647,120648],"mapped",[963]],[[120649,120649],"mapped",[964]],[[120650,120650],"mapped",[965]],[[120651,120651],"mapped",[966]],[[120652,120652],"mapped",[967]],[[120653,120653],"mapped",[968]],[[120654,120654],"mapped",[969]],[[120655,120655],"mapped",[8706]],[[120656,120656],"mapped",[949]],[[120657,120657],"mapped",[952]],[[120658,120658],"mapped",[954]],[[120659,120659],"mapped",[966]],[[120660,120660],"mapped",[961]],[[120661,120661],"mapped",[960]],[[120662,120662],"mapped",[945]],[[120663,120663],"mapped",[946]],[[120664,120664],"mapped",[947]],[[120665,120665],"mapped",[948]],[[120666,120666],"mapped",[949]],[[120667,120667],"mapped",[950]],[[120668,120668],"mapped",[951]],[[120669,120669],"mapped",[952]],[[120670,120670],"mapped",[953]],[[120671,120671],"mapped",[954]],[[120672,120672],"mapped",[955]],[[120673,120673],"mapped",[956]],[[120674,120674],"mapped",[957]],[[120675,120675],"mapped",[958]],[[120676,120676],"mapped",[959]],[[120677,120677],"mapped",[960]],[[120678,120678],"mapped",[961]],[[120679,120679],"mapped",[952]],[[120680,120680],"mapped",[963]],[[120681,120681],"mapped",[964]],[[120682,120682],"mapped",[965]],[[120683,120683],"mapped",[966]],[[120684,120684],"mapped",[967]],[[120685,120685],"mapped",[968]],[[120686,120686],"mapped",[969]],[[120687,120687],"mapped",[8711]],[[120688,120688],"mapped",[945]],[[120689,120689],"mapped",[946]],[[120690,120690],"mapped",[947]],[[120691,120691],"mapped",[948]],[[120692,120692],"mapped",[949]],[[120693,120693],"mapped",[950]],[[120694,120694],"mapped",[951]],[[120695,120695],"mapped",[952]],[[120696,120696],"mapped",[953]],[[120697,120697],"mapped",[954]],[[120698,120698],"mapped",[955]],[[120699,120699],"mapped",[956]],[[120700,120700],"mapped",[957]],[[120701,120701],"mapped",[958]],[[120702,120702],"mapped",[959]],[[120703,120703],"mapped",[960]],[[120704,120704],"mapped",[961]],[[120705,120706],"mapped",[963]],[[120707,120707],"mapped",[964]],[[120708,120708],"mapped",[965]],[[120709,120709],"mapped",[966]],[[120710,120710],"mapped",[967]],[[120711,120711],"mapped",[968]],[[120712,120712],"mapped",[969]],[[120713,120713],"mapped",[8706]],[[120714,120714],"mapped",[949]],[[120715,120715],"mapped",[952]],[[120716,120716],"mapped",[954]],[[120717,120717],"mapped",[966]],[[120718,120718],"mapped",[961]],[[120719,120719],"mapped",[960]],[[120720,120720],"mapped",[945]],[[120721,120721],"mapped",[946]],[[120722,120722],"mapped",[947]],[[120723,120723],"mapped",[948]],[[120724,120724],"mapped",[949]],[[120725,120725],"mapped",[950]],[[120726,120726],"mapped",[951]],[[120727,120727],"mapped",[952]],[[120728,120728],"mapped",[953]],[[120729,120729],"mapped",[954]],[[120730,120730],"mapped",[955]],[[120731,120731],"mapped",[956]],[[120732,120732],"mapped",[957]],[[120733,120733],"mapped",[958]],[[120734,120734],"mapped",[959]],[[120735,120735],"mapped",[960]],[[120736,120736],"mapped",[961]],[[120737,120737],"mapped",[952]],[[120738,120738],"mapped",[963]],[[120739,120739],"mapped",[964]],[[120740,120740],"mapped",[965]],[[120741,120741],"mapped",[966]],[[120742,120742],"mapped",[967]],[[120743,120743],"mapped",[968]],[[120744,120744],"mapped",[969]],[[120745,120745],"mapped",[8711]],[[120746,120746],"mapped",[945]],[[120747,120747],"mapped",[946]],[[120748,120748],"mapped",[947]],[[120749,120749],"mapped",[948]],[[120750,120750],"mapped",[949]],[[120751,120751],"mapped",[950]],[[120752,120752],"mapped",[951]],[[120753,120753],"mapped",[952]],[[120754,120754],"mapped",[953]],[[120755,120755],"mapped",[954]],[[120756,120756],"mapped",[955]],[[120757,120757],"mapped",[956]],[[120758,120758],"mapped",[957]],[[120759,120759],"mapped",[958]],[[120760,120760],"mapped",[959]],[[120761,120761],"mapped",[960]],[[120762,120762],"mapped",[961]],[[120763,120764],"mapped",[963]],[[120765,120765],"mapped",[964]],[[120766,120766],"mapped",[965]],[[120767,120767],"mapped",[966]],[[120768,120768],"mapped",[967]],[[120769,120769],"mapped",[968]],[[120770,120770],"mapped",[969]],[[120771,120771],"mapped",[8706]],[[120772,120772],"mapped",[949]],[[120773,120773],"mapped",[952]],[[120774,120774],"mapped",[954]],[[120775,120775],"mapped",[966]],[[120776,120776],"mapped",[961]],[[120777,120777],"mapped",[960]],[[120778,120779],"mapped",[989]],[[120780,120781],"disallowed"],[[120782,120782],"mapped",[48]],[[120783,120783],"mapped",[49]],[[120784,120784],"mapped",[50]],[[120785,120785],"mapped",[51]],[[120786,120786],"mapped",[52]],[[120787,120787],"mapped",[53]],[[120788,120788],"mapped",[54]],[[120789,120789],"mapped",[55]],[[120790,120790],"mapped",[56]],[[120791,120791],"mapped",[57]],[[120792,120792],"mapped",[48]],[[120793,120793],"mapped",[49]],[[120794,120794],"mapped",[50]],[[120795,120795],"mapped",[51]],[[120796,120796],"mapped",[52]],[[120797,120797],"mapped",[53]],[[120798,120798],"mapped",[54]],[[120799,120799],"mapped",[55]],[[120800,120800],"mapped",[56]],[[120801,120801],"mapped",[57]],[[120802,120802],"mapped",[48]],[[120803,120803],"mapped",[49]],[[120804,120804],"mapped",[50]],[[120805,120805],"mapped",[51]],[[120806,120806],"mapped",[52]],[[120807,120807],"mapped",[53]],[[120808,120808],"mapped",[54]],[[120809,120809],"mapped",[55]],[[120810,120810],"mapped",[56]],[[120811,120811],"mapped",[57]],[[120812,120812],"mapped",[48]],[[120813,120813],"mapped",[49]],[[120814,120814],"mapped",[50]],[[120815,120815],"mapped",[51]],[[120816,120816],"mapped",[52]],[[120817,120817],"mapped",[53]],[[120818,120818],"mapped",[54]],[[120819,120819],"mapped",[55]],[[120820,120820],"mapped",[56]],[[120821,120821],"mapped",[57]],[[120822,120822],"mapped",[48]],[[120823,120823],"mapped",[49]],[[120824,120824],"mapped",[50]],[[120825,120825],"mapped",[51]],[[120826,120826],"mapped",[52]],[[120827,120827],"mapped",[53]],[[120828,120828],"mapped",[54]],[[120829,120829],"mapped",[55]],[[120830,120830],"mapped",[56]],[[120831,120831],"mapped",[57]],[[120832,121343],"valid",[],"NV8"],[[121344,121398],"valid"],[[121399,121402],"valid",[],"NV8"],[[121403,121452],"valid"],[[121453,121460],"valid",[],"NV8"],[[121461,121461],"valid"],[[121462,121475],"valid",[],"NV8"],[[121476,121476],"valid"],[[121477,121483],"valid",[],"NV8"],[[121484,121498],"disallowed"],[[121499,121503],"valid"],[[121504,121504],"disallowed"],[[121505,121519],"valid"],[[121520,124927],"disallowed"],[[124928,125124],"valid"],[[125125,125126],"disallowed"],[[125127,125135],"valid",[],"NV8"],[[125136,125142],"valid"],[[125143,126463],"disallowed"],[[126464,126464],"mapped",[1575]],[[126465,126465],"mapped",[1576]],[[126466,126466],"mapped",[1580]],[[126467,126467],"mapped",[1583]],[[126468,126468],"disallowed"],[[126469,126469],"mapped",[1608]],[[126470,126470],"mapped",[1586]],[[126471,126471],"mapped",[1581]],[[126472,126472],"mapped",[1591]],[[126473,126473],"mapped",[1610]],[[126474,126474],"mapped",[1603]],[[126475,126475],"mapped",[1604]],[[126476,126476],"mapped",[1605]],[[126477,126477],"mapped",[1606]],[[126478,126478],"mapped",[1587]],[[126479,126479],"mapped",[1593]],[[126480,126480],"mapped",[1601]],[[126481,126481],"mapped",[1589]],[[126482,126482],"mapped",[1602]],[[126483,126483],"mapped",[1585]],[[126484,126484],"mapped",[1588]],[[126485,126485],"mapped",[1578]],[[126486,126486],"mapped",[1579]],[[126487,126487],"mapped",[1582]],[[126488,126488],"mapped",[1584]],[[126489,126489],"mapped",[1590]],[[126490,126490],"mapped",[1592]],[[126491,126491],"mapped",[1594]],[[126492,126492],"mapped",[1646]],[[126493,126493],"mapped",[1722]],[[126494,126494],"mapped",[1697]],[[126495,126495],"mapped",[1647]],[[126496,126496],"disallowed"],[[126497,126497],"mapped",[1576]],[[126498,126498],"mapped",[1580]],[[126499,126499],"disallowed"],[[126500,126500],"mapped",[1607]],[[126501,126502],"disallowed"],[[126503,126503],"mapped",[1581]],[[126504,126504],"disallowed"],[[126505,126505],"mapped",[1610]],[[126506,126506],"mapped",[1603]],[[126507,126507],"mapped",[1604]],[[126508,126508],"mapped",[1605]],[[126509,126509],"mapped",[1606]],[[126510,126510],"mapped",[1587]],[[126511,126511],"mapped",[1593]],[[126512,126512],"mapped",[1601]],[[126513,126513],"mapped",[1589]],[[126514,126514],"mapped",[1602]],[[126515,126515],"disallowed"],[[126516,126516],"mapped",[1588]],[[126517,126517],"mapped",[1578]],[[126518,126518],"mapped",[1579]],[[126519,126519],"mapped",[1582]],[[126520,126520],"disallowed"],[[126521,126521],"mapped",[1590]],[[126522,126522],"disallowed"],[[126523,126523],"mapped",[1594]],[[126524,126529],"disallowed"],[[126530,126530],"mapped",[1580]],[[126531,126534],"disallowed"],[[126535,126535],"mapped",[1581]],[[126536,126536],"disallowed"],[[126537,126537],"mapped",[1610]],[[126538,126538],"disallowed"],[[126539,126539],"mapped",[1604]],[[126540,126540],"disallowed"],[[126541,126541],"mapped",[1606]],[[126542,126542],"mapped",[1587]],[[126543,126543],"mapped",[1593]],[[126544,126544],"disallowed"],[[126545,126545],"mapped",[1589]],[[126546,126546],"mapped",[1602]],[[126547,126547],"disallowed"],[[126548,126548],"mapped",[1588]],[[126549,126550],"disallowed"],[[126551,126551],"mapped",[1582]],[[126552,126552],"disallowed"],[[126553,126553],"mapped",[1590]],[[126554,126554],"disallowed"],[[126555,126555],"mapped",[1594]],[[126556,126556],"disallowed"],[[126557,126557],"mapped",[1722]],[[126558,126558],"disallowed"],[[126559,126559],"mapped",[1647]],[[126560,126560],"disallowed"],[[126561,126561],"mapped",[1576]],[[126562,126562],"mapped",[1580]],[[126563,126563],"disallowed"],[[126564,126564],"mapped",[1607]],[[126565,126566],"disallowed"],[[126567,126567],"mapped",[1581]],[[126568,126568],"mapped",[1591]],[[126569,126569],"mapped",[1610]],[[126570,126570],"mapped",[1603]],[[126571,126571],"disallowed"],[[126572,126572],"mapped",[1605]],[[126573,126573],"mapped",[1606]],[[126574,126574],"mapped",[1587]],[[126575,126575],"mapped",[1593]],[[126576,126576],"mapped",[1601]],[[126577,126577],"mapped",[1589]],[[126578,126578],"mapped",[1602]],[[126579,126579],"disallowed"],[[126580,126580],"mapped",[1588]],[[126581,126581],"mapped",[1578]],[[126582,126582],"mapped",[1579]],[[126583,126583],"mapped",[1582]],[[126584,126584],"disallowed"],[[126585,126585],"mapped",[1590]],[[126586,126586],"mapped",[1592]],[[126587,126587],"mapped",[1594]],[[126588,126588],"mapped",[1646]],[[126589,126589],"disallowed"],[[126590,126590],"mapped",[1697]],[[126591,126591],"disallowed"],[[126592,126592],"mapped",[1575]],[[126593,126593],"mapped",[1576]],[[126594,126594],"mapped",[1580]],[[126595,126595],"mapped",[1583]],[[126596,126596],"mapped",[1607]],[[126597,126597],"mapped",[1608]],[[126598,126598],"mapped",[1586]],[[126599,126599],"mapped",[1581]],[[126600,126600],"mapped",[1591]],[[126601,126601],"mapped",[1610]],[[126602,126602],"disallowed"],[[126603,126603],"mapped",[1604]],[[126604,126604],"mapped",[1605]],[[126605,126605],"mapped",[1606]],[[126606,126606],"mapped",[1587]],[[126607,126607],"mapped",[1593]],[[126608,126608],"mapped",[1601]],[[126609,126609],"mapped",[1589]],[[126610,126610],"mapped",[1602]],[[126611,126611],"mapped",[1585]],[[126612,126612],"mapped",[1588]],[[126613,126613],"mapped",[1578]],[[126614,126614],"mapped",[1579]],[[126615,126615],"mapped",[1582]],[[126616,126616],"mapped",[1584]],[[126617,126617],"mapped",[1590]],[[126618,126618],"mapped",[1592]],[[126619,126619],"mapped",[1594]],[[126620,126624],"disallowed"],[[126625,126625],"mapped",[1576]],[[126626,126626],"mapped",[1580]],[[126627,126627],"mapped",[1583]],[[126628,126628],"disallowed"],[[126629,126629],"mapped",[1608]],[[126630,126630],"mapped",[1586]],[[126631,126631],"mapped",[1581]],[[126632,126632],"mapped",[1591]],[[126633,126633],"mapped",[1610]],[[126634,126634],"disallowed"],[[126635,126635],"mapped",[1604]],[[126636,126636],"mapped",[1605]],[[126637,126637],"mapped",[1606]],[[126638,126638],"mapped",[1587]],[[126639,126639],"mapped",[1593]],[[126640,126640],"mapped",[1601]],[[126641,126641],"mapped",[1589]],[[126642,126642],"mapped",[1602]],[[126643,126643],"mapped",[1585]],[[126644,126644],"mapped",[1588]],[[126645,126645],"mapped",[1578]],[[126646,126646],"mapped",[1579]],[[126647,126647],"mapped",[1582]],[[126648,126648],"mapped",[1584]],[[126649,126649],"mapped",[1590]],[[126650,126650],"mapped",[1592]],[[126651,126651],"mapped",[1594]],[[126652,126703],"disallowed"],[[126704,126705],"valid",[],"NV8"],[[126706,126975],"disallowed"],[[126976,127019],"valid",[],"NV8"],[[127020,127023],"disallowed"],[[127024,127123],"valid",[],"NV8"],[[127124,127135],"disallowed"],[[127136,127150],"valid",[],"NV8"],[[127151,127152],"disallowed"],[[127153,127166],"valid",[],"NV8"],[[127167,127167],"valid",[],"NV8"],[[127168,127168],"disallowed"],[[127169,127183],"valid",[],"NV8"],[[127184,127184],"disallowed"],[[127185,127199],"valid",[],"NV8"],[[127200,127221],"valid",[],"NV8"],[[127222,127231],"disallowed"],[[127232,127232],"disallowed"],[[127233,127233],"disallowed_STD3_mapped",[48,44]],[[127234,127234],"disallowed_STD3_mapped",[49,44]],[[127235,127235],"disallowed_STD3_mapped",[50,44]],[[127236,127236],"disallowed_STD3_mapped",[51,44]],[[127237,127237],"disallowed_STD3_mapped",[52,44]],[[127238,127238],"disallowed_STD3_mapped",[53,44]],[[127239,127239],"disallowed_STD3_mapped",[54,44]],[[127240,127240],"disallowed_STD3_mapped",[55,44]],[[127241,127241],"disallowed_STD3_mapped",[56,44]],[[127242,127242],"disallowed_STD3_mapped",[57,44]],[[127243,127244],"valid",[],"NV8"],[[127245,127247],"disallowed"],[[127248,127248],"disallowed_STD3_mapped",[40,97,41]],[[127249,127249],"disallowed_STD3_mapped",[40,98,41]],[[127250,127250],"disallowed_STD3_mapped",[40,99,41]],[[127251,127251],"disallowed_STD3_mapped",[40,100,41]],[[127252,127252],"disallowed_STD3_mapped",[40,101,41]],[[127253,127253],"disallowed_STD3_mapped",[40,102,41]],[[127254,127254],"disallowed_STD3_mapped",[40,103,41]],[[127255,127255],"disallowed_STD3_mapped",[40,104,41]],[[127256,127256],"disallowed_STD3_mapped",[40,105,41]],[[127257,127257],"disallowed_STD3_mapped",[40,106,41]],[[127258,127258],"disallowed_STD3_mapped",[40,107,41]],[[127259,127259],"disallowed_STD3_mapped",[40,108,41]],[[127260,127260],"disallowed_STD3_mapped",[40,109,41]],[[127261,127261],"disallowed_STD3_mapped",[40,110,41]],[[127262,127262],"disallowed_STD3_mapped",[40,111,41]],[[127263,127263],"disallowed_STD3_mapped",[40,112,41]],[[127264,127264],"disallowed_STD3_mapped",[40,113,41]],[[127265,127265],"disallowed_STD3_mapped",[40,114,41]],[[127266,127266],"disallowed_STD3_mapped",[40,115,41]],[[127267,127267],"disallowed_STD3_mapped",[40,116,41]],[[127268,127268],"disallowed_STD3_mapped",[40,117,41]],[[127269,127269],"disallowed_STD3_mapped",[40,118,41]],[[127270,127270],"disallowed_STD3_mapped",[40,119,41]],[[127271,127271],"disallowed_STD3_mapped",[40,120,41]],[[127272,127272],"disallowed_STD3_mapped",[40,121,41]],[[127273,127273],"disallowed_STD3_mapped",[40,122,41]],[[127274,127274],"mapped",[12308,115,12309]],[[127275,127275],"mapped",[99]],[[127276,127276],"mapped",[114]],[[127277,127277],"mapped",[99,100]],[[127278,127278],"mapped",[119,122]],[[127279,127279],"disallowed"],[[127280,127280],"mapped",[97]],[[127281,127281],"mapped",[98]],[[127282,127282],"mapped",[99]],[[127283,127283],"mapped",[100]],[[127284,127284],"mapped",[101]],[[127285,127285],"mapped",[102]],[[127286,127286],"mapped",[103]],[[127287,127287],"mapped",[104]],[[127288,127288],"mapped",[105]],[[127289,127289],"mapped",[106]],[[127290,127290],"mapped",[107]],[[127291,127291],"mapped",[108]],[[127292,127292],"mapped",[109]],[[127293,127293],"mapped",[110]],[[127294,127294],"mapped",[111]],[[127295,127295],"mapped",[112]],[[127296,127296],"mapped",[113]],[[127297,127297],"mapped",[114]],[[127298,127298],"mapped",[115]],[[127299,127299],"mapped",[116]],[[127300,127300],"mapped",[117]],[[127301,127301],"mapped",[118]],[[127302,127302],"mapped",[119]],[[127303,127303],"mapped",[120]],[[127304,127304],"mapped",[121]],[[127305,127305],"mapped",[122]],[[127306,127306],"mapped",[104,118]],[[127307,127307],"mapped",[109,118]],[[127308,127308],"mapped",[115,100]],[[127309,127309],"mapped",[115,115]],[[127310,127310],"mapped",[112,112,118]],[[127311,127311],"mapped",[119,99]],[[127312,127318],"valid",[],"NV8"],[[127319,127319],"valid",[],"NV8"],[[127320,127326],"valid",[],"NV8"],[[127327,127327],"valid",[],"NV8"],[[127328,127337],"valid",[],"NV8"],[[127338,127338],"mapped",[109,99]],[[127339,127339],"mapped",[109,100]],[[127340,127343],"disallowed"],[[127344,127352],"valid",[],"NV8"],[[127353,127353],"valid",[],"NV8"],[[127354,127354],"valid",[],"NV8"],[[127355,127356],"valid",[],"NV8"],[[127357,127358],"valid",[],"NV8"],[[127359,127359],"valid",[],"NV8"],[[127360,127369],"valid",[],"NV8"],[[127370,127373],"valid",[],"NV8"],[[127374,127375],"valid",[],"NV8"],[[127376,127376],"mapped",[100,106]],[[127377,127386],"valid",[],"NV8"],[[127387,127461],"disallowed"],[[127462,127487],"valid",[],"NV8"],[[127488,127488],"mapped",[12411,12363]],[[127489,127489],"mapped",[12467,12467]],[[127490,127490],"mapped",[12469]],[[127491,127503],"disallowed"],[[127504,127504],"mapped",[25163]],[[127505,127505],"mapped",[23383]],[[127506,127506],"mapped",[21452]],[[127507,127507],"mapped",[12487]],[[127508,127508],"mapped",[20108]],[[127509,127509],"mapped",[22810]],[[127510,127510],"mapped",[35299]],[[127511,127511],"mapped",[22825]],[[127512,127512],"mapped",[20132]],[[127513,127513],"mapped",[26144]],[[127514,127514],"mapped",[28961]],[[127515,127515],"mapped",[26009]],[[127516,127516],"mapped",[21069]],[[127517,127517],"mapped",[24460]],[[127518,127518],"mapped",[20877]],[[127519,127519],"mapped",[26032]],[[127520,127520],"mapped",[21021]],[[127521,127521],"mapped",[32066]],[[127522,127522],"mapped",[29983]],[[127523,127523],"mapped",[36009]],[[127524,127524],"mapped",[22768]],[[127525,127525],"mapped",[21561]],[[127526,127526],"mapped",[28436]],[[127527,127527],"mapped",[25237]],[[127528,127528],"mapped",[25429]],[[127529,127529],"mapped",[19968]],[[127530,127530],"mapped",[19977]],[[127531,127531],"mapped",[36938]],[[127532,127532],"mapped",[24038]],[[127533,127533],"mapped",[20013]],[[127534,127534],"mapped",[21491]],[[127535,127535],"mapped",[25351]],[[127536,127536],"mapped",[36208]],[[127537,127537],"mapped",[25171]],[[127538,127538],"mapped",[31105]],[[127539,127539],"mapped",[31354]],[[127540,127540],"mapped",[21512]],[[127541,127541],"mapped",[28288]],[[127542,127542],"mapped",[26377]],[[127543,127543],"mapped",[26376]],[[127544,127544],"mapped",[30003]],[[127545,127545],"mapped",[21106]],[[127546,127546],"mapped",[21942]],[[127547,127551],"disallowed"],[[127552,127552],"mapped",[12308,26412,12309]],[[127553,127553],"mapped",[12308,19977,12309]],[[127554,127554],"mapped",[12308,20108,12309]],[[127555,127555],"mapped",[12308,23433,12309]],[[127556,127556],"mapped",[12308,28857,12309]],[[127557,127557],"mapped",[12308,25171,12309]],[[127558,127558],"mapped",[12308,30423,12309]],[[127559,127559],"mapped",[12308,21213,12309]],[[127560,127560],"mapped",[12308,25943,12309]],[[127561,127567],"disallowed"],[[127568,127568],"mapped",[24471]],[[127569,127569],"mapped",[21487]],[[127570,127743],"disallowed"],[[127744,127776],"valid",[],"NV8"],[[127777,127788],"valid",[],"NV8"],[[127789,127791],"valid",[],"NV8"],[[127792,127797],"valid",[],"NV8"],[[127798,127798],"valid",[],"NV8"],[[127799,127868],"valid",[],"NV8"],[[127869,127869],"valid",[],"NV8"],[[127870,127871],"valid",[],"NV8"],[[127872,127891],"valid",[],"NV8"],[[127892,127903],"valid",[],"NV8"],[[127904,127940],"valid",[],"NV8"],[[127941,127941],"valid",[],"NV8"],[[127942,127946],"valid",[],"NV8"],[[127947,127950],"valid",[],"NV8"],[[127951,127955],"valid",[],"NV8"],[[127956,127967],"valid",[],"NV8"],[[127968,127984],"valid",[],"NV8"],[[127985,127991],"valid",[],"NV8"],[[127992,127999],"valid",[],"NV8"],[[128000,128062],"valid",[],"NV8"],[[128063,128063],"valid",[],"NV8"],[[128064,128064],"valid",[],"NV8"],[[128065,128065],"valid",[],"NV8"],[[128066,128247],"valid",[],"NV8"],[[128248,128248],"valid",[],"NV8"],[[128249,128252],"valid",[],"NV8"],[[128253,128254],"valid",[],"NV8"],[[128255,128255],"valid",[],"NV8"],[[128256,128317],"valid",[],"NV8"],[[128318,128319],"valid",[],"NV8"],[[128320,128323],"valid",[],"NV8"],[[128324,128330],"valid",[],"NV8"],[[128331,128335],"valid",[],"NV8"],[[128336,128359],"valid",[],"NV8"],[[128360,128377],"valid",[],"NV8"],[[128378,128378],"disallowed"],[[128379,128419],"valid",[],"NV8"],[[128420,128420],"disallowed"],[[128421,128506],"valid",[],"NV8"],[[128507,128511],"valid",[],"NV8"],[[128512,128512],"valid",[],"NV8"],[[128513,128528],"valid",[],"NV8"],[[128529,128529],"valid",[],"NV8"],[[128530,128532],"valid",[],"NV8"],[[128533,128533],"valid",[],"NV8"],[[128534,128534],"valid",[],"NV8"],[[128535,128535],"valid",[],"NV8"],[[128536,128536],"valid",[],"NV8"],[[128537,128537],"valid",[],"NV8"],[[128538,128538],"valid",[],"NV8"],[[128539,128539],"valid",[],"NV8"],[[128540,128542],"valid",[],"NV8"],[[128543,128543],"valid",[],"NV8"],[[128544,128549],"valid",[],"NV8"],[[128550,128551],"valid",[],"NV8"],[[128552,128555],"valid",[],"NV8"],[[128556,128556],"valid",[],"NV8"],[[128557,128557],"valid",[],"NV8"],[[128558,128559],"valid",[],"NV8"],[[128560,128563],"valid",[],"NV8"],[[128564,128564],"valid",[],"NV8"],[[128565,128576],"valid",[],"NV8"],[[128577,128578],"valid",[],"NV8"],[[128579,128580],"valid",[],"NV8"],[[128581,128591],"valid",[],"NV8"],[[128592,128639],"valid",[],"NV8"],[[128640,128709],"valid",[],"NV8"],[[128710,128719],"valid",[],"NV8"],[[128720,128720],"valid",[],"NV8"],[[128721,128735],"disallowed"],[[128736,128748],"valid",[],"NV8"],[[128749,128751],"disallowed"],[[128752,128755],"valid",[],"NV8"],[[128756,128767],"disallowed"],[[128768,128883],"valid",[],"NV8"],[[128884,128895],"disallowed"],[[128896,128980],"valid",[],"NV8"],[[128981,129023],"disallowed"],[[129024,129035],"valid",[],"NV8"],[[129036,129039],"disallowed"],[[129040,129095],"valid",[],"NV8"],[[129096,129103],"disallowed"],[[129104,129113],"valid",[],"NV8"],[[129114,129119],"disallowed"],[[129120,129159],"valid",[],"NV8"],[[129160,129167],"disallowed"],[[129168,129197],"valid",[],"NV8"],[[129198,129295],"disallowed"],[[129296,129304],"valid",[],"NV8"],[[129305,129407],"disallowed"],[[129408,129412],"valid",[],"NV8"],[[129413,129471],"disallowed"],[[129472,129472],"valid",[],"NV8"],[[129473,131069],"disallowed"],[[131070,131071],"disallowed"],[[131072,173782],"valid"],[[173783,173823],"disallowed"],[[173824,177972],"valid"],[[177973,177983],"disallowed"],[[177984,178205],"valid"],[[178206,178207],"disallowed"],[[178208,183969],"valid"],[[183970,194559],"disallowed"],[[194560,194560],"mapped",[20029]],[[194561,194561],"mapped",[20024]],[[194562,194562],"mapped",[20033]],[[194563,194563],"mapped",[131362]],[[194564,194564],"mapped",[20320]],[[194565,194565],"mapped",[20398]],[[194566,194566],"mapped",[20411]],[[194567,194567],"mapped",[20482]],[[194568,194568],"mapped",[20602]],[[194569,194569],"mapped",[20633]],[[194570,194570],"mapped",[20711]],[[194571,194571],"mapped",[20687]],[[194572,194572],"mapped",[13470]],[[194573,194573],"mapped",[132666]],[[194574,194574],"mapped",[20813]],[[194575,194575],"mapped",[20820]],[[194576,194576],"mapped",[20836]],[[194577,194577],"mapped",[20855]],[[194578,194578],"mapped",[132380]],[[194579,194579],"mapped",[13497]],[[194580,194580],"mapped",[20839]],[[194581,194581],"mapped",[20877]],[[194582,194582],"mapped",[132427]],[[194583,194583],"mapped",[20887]],[[194584,194584],"mapped",[20900]],[[194585,194585],"mapped",[20172]],[[194586,194586],"mapped",[20908]],[[194587,194587],"mapped",[20917]],[[194588,194588],"mapped",[168415]],[[194589,194589],"mapped",[20981]],[[194590,194590],"mapped",[20995]],[[194591,194591],"mapped",[13535]],[[194592,194592],"mapped",[21051]],[[194593,194593],"mapped",[21062]],[[194594,194594],"mapped",[21106]],[[194595,194595],"mapped",[21111]],[[194596,194596],"mapped",[13589]],[[194597,194597],"mapped",[21191]],[[194598,194598],"mapped",[21193]],[[194599,194599],"mapped",[21220]],[[194600,194600],"mapped",[21242]],[[194601,194601],"mapped",[21253]],[[194602,194602],"mapped",[21254]],[[194603,194603],"mapped",[21271]],[[194604,194604],"mapped",[21321]],[[194605,194605],"mapped",[21329]],[[194606,194606],"mapped",[21338]],[[194607,194607],"mapped",[21363]],[[194608,194608],"mapped",[21373]],[[194609,194611],"mapped",[21375]],[[194612,194612],"mapped",[133676]],[[194613,194613],"mapped",[28784]],[[194614,194614],"mapped",[21450]],[[194615,194615],"mapped",[21471]],[[194616,194616],"mapped",[133987]],[[194617,194617],"mapped",[21483]],[[194618,194618],"mapped",[21489]],[[194619,194619],"mapped",[21510]],[[194620,194620],"mapped",[21662]],[[194621,194621],"mapped",[21560]],[[194622,194622],"mapped",[21576]],[[194623,194623],"mapped",[21608]],[[194624,194624],"mapped",[21666]],[[194625,194625],"mapped",[21750]],[[194626,194626],"mapped",[21776]],[[194627,194627],"mapped",[21843]],[[194628,194628],"mapped",[21859]],[[194629,194630],"mapped",[21892]],[[194631,194631],"mapped",[21913]],[[194632,194632],"mapped",[21931]],[[194633,194633],"mapped",[21939]],[[194634,194634],"mapped",[21954]],[[194635,194635],"mapped",[22294]],[[194636,194636],"mapped",[22022]],[[194637,194637],"mapped",[22295]],[[194638,194638],"mapped",[22097]],[[194639,194639],"mapped",[22132]],[[194640,194640],"mapped",[20999]],[[194641,194641],"mapped",[22766]],[[194642,194642],"mapped",[22478]],[[194643,194643],"mapped",[22516]],[[194644,194644],"mapped",[22541]],[[194645,194645],"mapped",[22411]],[[194646,194646],"mapped",[22578]],[[194647,194647],"mapped",[22577]],[[194648,194648],"mapped",[22700]],[[194649,194649],"mapped",[136420]],[[194650,194650],"mapped",[22770]],[[194651,194651],"mapped",[22775]],[[194652,194652],"mapped",[22790]],[[194653,194653],"mapped",[22810]],[[194654,194654],"mapped",[22818]],[[194655,194655],"mapped",[22882]],[[194656,194656],"mapped",[136872]],[[194657,194657],"mapped",[136938]],[[194658,194658],"mapped",[23020]],[[194659,194659],"mapped",[23067]],[[194660,194660],"mapped",[23079]],[[194661,194661],"mapped",[23000]],[[194662,194662],"mapped",[23142]],[[194663,194663],"mapped",[14062]],[[194664,194664],"disallowed"],[[194665,194665],"mapped",[23304]],[[194666,194667],"mapped",[23358]],[[194668,194668],"mapped",[137672]],[[194669,194669],"mapped",[23491]],[[194670,194670],"mapped",[23512]],[[194671,194671],"mapped",[23527]],[[194672,194672],"mapped",[23539]],[[194673,194673],"mapped",[138008]],[[194674,194674],"mapped",[23551]],[[194675,194675],"mapped",[23558]],[[194676,194676],"disallowed"],[[194677,194677],"mapped",[23586]],[[194678,194678],"mapped",[14209]],[[194679,194679],"mapped",[23648]],[[194680,194680],"mapped",[23662]],[[194681,194681],"mapped",[23744]],[[194682,194682],"mapped",[23693]],[[194683,194683],"mapped",[138724]],[[194684,194684],"mapped",[23875]],[[194685,194685],"mapped",[138726]],[[194686,194686],"mapped",[23918]],[[194687,194687],"mapped",[23915]],[[194688,194688],"mapped",[23932]],[[194689,194689],"mapped",[24033]],[[194690,194690],"mapped",[24034]],[[194691,194691],"mapped",[14383]],[[194692,194692],"mapped",[24061]],[[194693,194693],"mapped",[24104]],[[194694,194694],"mapped",[24125]],[[194695,194695],"mapped",[24169]],[[194696,194696],"mapped",[14434]],[[194697,194697],"mapped",[139651]],[[194698,194698],"mapped",[14460]],[[194699,194699],"mapped",[24240]],[[194700,194700],"mapped",[24243]],[[194701,194701],"mapped",[24246]],[[194702,194702],"mapped",[24266]],[[194703,194703],"mapped",[172946]],[[194704,194704],"mapped",[24318]],[[194705,194706],"mapped",[140081]],[[194707,194707],"mapped",[33281]],[[194708,194709],"mapped",[24354]],[[194710,194710],"mapped",[14535]],[[194711,194711],"mapped",[144056]],[[194712,194712],"mapped",[156122]],[[194713,194713],"mapped",[24418]],[[194714,194714],"mapped",[24427]],[[194715,194715],"mapped",[14563]],[[194716,194716],"mapped",[24474]],[[194717,194717],"mapped",[24525]],[[194718,194718],"mapped",[24535]],[[194719,194719],"mapped",[24569]],[[194720,194720],"mapped",[24705]],[[194721,194721],"mapped",[14650]],[[194722,194722],"mapped",[14620]],[[194723,194723],"mapped",[24724]],[[194724,194724],"mapped",[141012]],[[194725,194725],"mapped",[24775]],[[194726,194726],"mapped",[24904]],[[194727,194727],"mapped",[24908]],[[194728,194728],"mapped",[24910]],[[194729,194729],"mapped",[24908]],[[194730,194730],"mapped",[24954]],[[194731,194731],"mapped",[24974]],[[194732,194732],"mapped",[25010]],[[194733,194733],"mapped",[24996]],[[194734,194734],"mapped",[25007]],[[194735,194735],"mapped",[25054]],[[194736,194736],"mapped",[25074]],[[194737,194737],"mapped",[25078]],[[194738,194738],"mapped",[25104]],[[194739,194739],"mapped",[25115]],[[194740,194740],"mapped",[25181]],[[194741,194741],"mapped",[25265]],[[194742,194742],"mapped",[25300]],[[194743,194743],"mapped",[25424]],[[194744,194744],"mapped",[142092]],[[194745,194745],"mapped",[25405]],[[194746,194746],"mapped",[25340]],[[194747,194747],"mapped",[25448]],[[194748,194748],"mapped",[25475]],[[194749,194749],"mapped",[25572]],[[194750,194750],"mapped",[142321]],[[194751,194751],"mapped",[25634]],[[194752,194752],"mapped",[25541]],[[194753,194753],"mapped",[25513]],[[194754,194754],"mapped",[14894]],[[194755,194755],"mapped",[25705]],[[194756,194756],"mapped",[25726]],[[194757,194757],"mapped",[25757]],[[194758,194758],"mapped",[25719]],[[194759,194759],"mapped",[14956]],[[194760,194760],"mapped",[25935]],[[194761,194761],"mapped",[25964]],[[194762,194762],"mapped",[143370]],[[194763,194763],"mapped",[26083]],[[194764,194764],"mapped",[26360]],[[194765,194765],"mapped",[26185]],[[194766,194766],"mapped",[15129]],[[194767,194767],"mapped",[26257]],[[194768,194768],"mapped",[15112]],[[194769,194769],"mapped",[15076]],[[194770,194770],"mapped",[20882]],[[194771,194771],"mapped",[20885]],[[194772,194772],"mapped",[26368]],[[194773,194773],"mapped",[26268]],[[194774,194774],"mapped",[32941]],[[194775,194775],"mapped",[17369]],[[194776,194776],"mapped",[26391]],[[194777,194777],"mapped",[26395]],[[194778,194778],"mapped",[26401]],[[194779,194779],"mapped",[26462]],[[194780,194780],"mapped",[26451]],[[194781,194781],"mapped",[144323]],[[194782,194782],"mapped",[15177]],[[194783,194783],"mapped",[26618]],[[194784,194784],"mapped",[26501]],[[194785,194785],"mapped",[26706]],[[194786,194786],"mapped",[26757]],[[194787,194787],"mapped",[144493]],[[194788,194788],"mapped",[26766]],[[194789,194789],"mapped",[26655]],[[194790,194790],"mapped",[26900]],[[194791,194791],"mapped",[15261]],[[194792,194792],"mapped",[26946]],[[194793,194793],"mapped",[27043]],[[194794,194794],"mapped",[27114]],[[194795,194795],"mapped",[27304]],[[194796,194796],"mapped",[145059]],[[194797,194797],"mapped",[27355]],[[194798,194798],"mapped",[15384]],[[194799,194799],"mapped",[27425]],[[194800,194800],"mapped",[145575]],[[194801,194801],"mapped",[27476]],[[194802,194802],"mapped",[15438]],[[194803,194803],"mapped",[27506]],[[194804,194804],"mapped",[27551]],[[194805,194805],"mapped",[27578]],[[194806,194806],"mapped",[27579]],[[194807,194807],"mapped",[146061]],[[194808,194808],"mapped",[138507]],[[194809,194809],"mapped",[146170]],[[194810,194810],"mapped",[27726]],[[194811,194811],"mapped",[146620]],[[194812,194812],"mapped",[27839]],[[194813,194813],"mapped",[27853]],[[194814,194814],"mapped",[27751]],[[194815,194815],"mapped",[27926]],[[194816,194816],"mapped",[27966]],[[194817,194817],"mapped",[28023]],[[194818,194818],"mapped",[27969]],[[194819,194819],"mapped",[28009]],[[194820,194820],"mapped",[28024]],[[194821,194821],"mapped",[28037]],[[194822,194822],"mapped",[146718]],[[194823,194823],"mapped",[27956]],[[194824,194824],"mapped",[28207]],[[194825,194825],"mapped",[28270]],[[194826,194826],"mapped",[15667]],[[194827,194827],"mapped",[28363]],[[194828,194828],"mapped",[28359]],[[194829,194829],"mapped",[147153]],[[194830,194830],"mapped",[28153]],[[194831,194831],"mapped",[28526]],[[194832,194832],"mapped",[147294]],[[194833,194833],"mapped",[147342]],[[194834,194834],"mapped",[28614]],[[194835,194835],"mapped",[28729]],[[194836,194836],"mapped",[28702]],[[194837,194837],"mapped",[28699]],[[194838,194838],"mapped",[15766]],[[194839,194839],"mapped",[28746]],[[194840,194840],"mapped",[28797]],[[194841,194841],"mapped",[28791]],[[194842,194842],"mapped",[28845]],[[194843,194843],"mapped",[132389]],[[194844,194844],"mapped",[28997]],[[194845,194845],"mapped",[148067]],[[194846,194846],"mapped",[29084]],[[194847,194847],"disallowed"],[[194848,194848],"mapped",[29224]],[[194849,194849],"mapped",[29237]],[[194850,194850],"mapped",[29264]],[[194851,194851],"mapped",[149000]],[[194852,194852],"mapped",[29312]],[[194853,194853],"mapped",[29333]],[[194854,194854],"mapped",[149301]],[[194855,194855],"mapped",[149524]],[[194856,194856],"mapped",[29562]],[[194857,194857],"mapped",[29579]],[[194858,194858],"mapped",[16044]],[[194859,194859],"mapped",[29605]],[[194860,194861],"mapped",[16056]],[[194862,194862],"mapped",[29767]],[[194863,194863],"mapped",[29788]],[[194864,194864],"mapped",[29809]],[[194865,194865],"mapped",[29829]],[[194866,194866],"mapped",[29898]],[[194867,194867],"mapped",[16155]],[[194868,194868],"mapped",[29988]],[[194869,194869],"mapped",[150582]],[[194870,194870],"mapped",[30014]],[[194871,194871],"mapped",[150674]],[[194872,194872],"mapped",[30064]],[[194873,194873],"mapped",[139679]],[[194874,194874],"mapped",[30224]],[[194875,194875],"mapped",[151457]],[[194876,194876],"mapped",[151480]],[[194877,194877],"mapped",[151620]],[[194878,194878],"mapped",[16380]],[[194879,194879],"mapped",[16392]],[[194880,194880],"mapped",[30452]],[[194881,194881],"mapped",[151795]],[[194882,194882],"mapped",[151794]],[[194883,194883],"mapped",[151833]],[[194884,194884],"mapped",[151859]],[[194885,194885],"mapped",[30494]],[[194886,194887],"mapped",[30495]],[[194888,194888],"mapped",[30538]],[[194889,194889],"mapped",[16441]],[[194890,194890],"mapped",[30603]],[[194891,194891],"mapped",[16454]],[[194892,194892],"mapped",[16534]],[[194893,194893],"mapped",[152605]],[[194894,194894],"mapped",[30798]],[[194895,194895],"mapped",[30860]],[[194896,194896],"mapped",[30924]],[[194897,194897],"mapped",[16611]],[[194898,194898],"mapped",[153126]],[[194899,194899],"mapped",[31062]],[[194900,194900],"mapped",[153242]],[[194901,194901],"mapped",[153285]],[[194902,194902],"mapped",[31119]],[[194903,194903],"mapped",[31211]],[[194904,194904],"mapped",[16687]],[[194905,194905],"mapped",[31296]],[[194906,194906],"mapped",[31306]],[[194907,194907],"mapped",[31311]],[[194908,194908],"mapped",[153980]],[[194909,194910],"mapped",[154279]],[[194911,194911],"disallowed"],[[194912,194912],"mapped",[16898]],[[194913,194913],"mapped",[154539]],[[194914,194914],"mapped",[31686]],[[194915,194915],"mapped",[31689]],[[194916,194916],"mapped",[16935]],[[194917,194917],"mapped",[154752]],[[194918,194918],"mapped",[31954]],[[194919,194919],"mapped",[17056]],[[194920,194920],"mapped",[31976]],[[194921,194921],"mapped",[31971]],[[194922,194922],"mapped",[32000]],[[194923,194923],"mapped",[155526]],[[194924,194924],"mapped",[32099]],[[194925,194925],"mapped",[17153]],[[194926,194926],"mapped",[32199]],[[194927,194927],"mapped",[32258]],[[194928,194928],"mapped",[32325]],[[194929,194929],"mapped",[17204]],[[194930,194930],"mapped",[156200]],[[194931,194931],"mapped",[156231]],[[194932,194932],"mapped",[17241]],[[194933,194933],"mapped",[156377]],[[194934,194934],"mapped",[32634]],[[194935,194935],"mapped",[156478]],[[194936,194936],"mapped",[32661]],[[194937,194937],"mapped",[32762]],[[194938,194938],"mapped",[32773]],[[194939,194939],"mapped",[156890]],[[194940,194940],"mapped",[156963]],[[194941,194941],"mapped",[32864]],[[194942,194942],"mapped",[157096]],[[194943,194943],"mapped",[32880]],[[194944,194944],"mapped",[144223]],[[194945,194945],"mapped",[17365]],[[194946,194946],"mapped",[32946]],[[194947,194947],"mapped",[33027]],[[194948,194948],"mapped",[17419]],[[194949,194949],"mapped",[33086]],[[194950,194950],"mapped",[23221]],[[194951,194951],"mapped",[157607]],[[194952,194952],"mapped",[157621]],[[194953,194953],"mapped",[144275]],[[194954,194954],"mapped",[144284]],[[194955,194955],"mapped",[33281]],[[194956,194956],"mapped",[33284]],[[194957,194957],"mapped",[36766]],[[194958,194958],"mapped",[17515]],[[194959,194959],"mapped",[33425]],[[194960,194960],"mapped",[33419]],[[194961,194961],"mapped",[33437]],[[194962,194962],"mapped",[21171]],[[194963,194963],"mapped",[33457]],[[194964,194964],"mapped",[33459]],[[194965,194965],"mapped",[33469]],[[194966,194966],"mapped",[33510]],[[194967,194967],"mapped",[158524]],[[194968,194968],"mapped",[33509]],[[194969,194969],"mapped",[33565]],[[194970,194970],"mapped",[33635]],[[194971,194971],"mapped",[33709]],[[194972,194972],"mapped",[33571]],[[194973,194973],"mapped",[33725]],[[194974,194974],"mapped",[33767]],[[194975,194975],"mapped",[33879]],[[194976,194976],"mapped",[33619]],[[194977,194977],"mapped",[33738]],[[194978,194978],"mapped",[33740]],[[194979,194979],"mapped",[33756]],[[194980,194980],"mapped",[158774]],[[194981,194981],"mapped",[159083]],[[194982,194982],"mapped",[158933]],[[194983,194983],"mapped",[17707]],[[194984,194984],"mapped",[34033]],[[194985,194985],"mapped",[34035]],[[194986,194986],"mapped",[34070]],[[194987,194987],"mapped",[160714]],[[194988,194988],"mapped",[34148]],[[194989,194989],"mapped",[159532]],[[194990,194990],"mapped",[17757]],[[194991,194991],"mapped",[17761]],[[194992,194992],"mapped",[159665]],[[194993,194993],"mapped",[159954]],[[194994,194994],"mapped",[17771]],[[194995,194995],"mapped",[34384]],[[194996,194996],"mapped",[34396]],[[194997,194997],"mapped",[34407]],[[194998,194998],"mapped",[34409]],[[194999,194999],"mapped",[34473]],[[195000,195000],"mapped",[34440]],[[195001,195001],"mapped",[34574]],[[195002,195002],"mapped",[34530]],[[195003,195003],"mapped",[34681]],[[195004,195004],"mapped",[34600]],[[195005,195005],"mapped",[34667]],[[195006,195006],"mapped",[34694]],[[195007,195007],"disallowed"],[[195008,195008],"mapped",[34785]],[[195009,195009],"mapped",[34817]],[[195010,195010],"mapped",[17913]],[[195011,195011],"mapped",[34912]],[[195012,195012],"mapped",[34915]],[[195013,195013],"mapped",[161383]],[[195014,195014],"mapped",[35031]],[[195015,195015],"mapped",[35038]],[[195016,195016],"mapped",[17973]],[[195017,195017],"mapped",[35066]],[[195018,195018],"mapped",[13499]],[[195019,195019],"mapped",[161966]],[[195020,195020],"mapped",[162150]],[[195021,195021],"mapped",[18110]],[[195022,195022],"mapped",[18119]],[[195023,195023],"mapped",[35488]],[[195024,195024],"mapped",[35565]],[[195025,195025],"mapped",[35722]],[[195026,195026],"mapped",[35925]],[[195027,195027],"mapped",[162984]],[[195028,195028],"mapped",[36011]],[[195029,195029],"mapped",[36033]],[[195030,195030],"mapped",[36123]],[[195031,195031],"mapped",[36215]],[[195032,195032],"mapped",[163631]],[[195033,195033],"mapped",[133124]],[[195034,195034],"mapped",[36299]],[[195035,195035],"mapped",[36284]],[[195036,195036],"mapped",[36336]],[[195037,195037],"mapped",[133342]],[[195038,195038],"mapped",[36564]],[[195039,195039],"mapped",[36664]],[[195040,195040],"mapped",[165330]],[[195041,195041],"mapped",[165357]],[[195042,195042],"mapped",[37012]],[[195043,195043],"mapped",[37105]],[[195044,195044],"mapped",[37137]],[[195045,195045],"mapped",[165678]],[[195046,195046],"mapped",[37147]],[[195047,195047],"mapped",[37432]],[[195048,195048],"mapped",[37591]],[[195049,195049],"mapped",[37592]],[[195050,195050],"mapped",[37500]],[[195051,195051],"mapped",[37881]],[[195052,195052],"mapped",[37909]],[[195053,195053],"mapped",[166906]],[[195054,195054],"mapped",[38283]],[[195055,195055],"mapped",[18837]],[[195056,195056],"mapped",[38327]],[[195057,195057],"mapped",[167287]],[[195058,195058],"mapped",[18918]],[[195059,195059],"mapped",[38595]],[[195060,195060],"mapped",[23986]],[[195061,195061],"mapped",[38691]],[[195062,195062],"mapped",[168261]],[[195063,195063],"mapped",[168474]],[[195064,195064],"mapped",[19054]],[[195065,195065],"mapped",[19062]],[[195066,195066],"mapped",[38880]],[[195067,195067],"mapped",[168970]],[[195068,195068],"mapped",[19122]],[[195069,195069],"mapped",[169110]],[[195070,195071],"mapped",[38923]],[[195072,195072],"mapped",[38953]],[[195073,195073],"mapped",[169398]],[[195074,195074],"mapped",[39138]],[[195075,195075],"mapped",[19251]],[[195076,195076],"mapped",[39209]],[[195077,195077],"mapped",[39335]],[[195078,195078],"mapped",[39362]],[[195079,195079],"mapped",[39422]],[[195080,195080],"mapped",[19406]],[[195081,195081],"mapped",[170800]],[[195082,195082],"mapped",[39698]],[[195083,195083],"mapped",[40000]],[[195084,195084],"mapped",[40189]],[[195085,195085],"mapped",[19662]],[[195086,195086],"mapped",[19693]],[[195087,195087],"mapped",[40295]],[[195088,195088],"mapped",[172238]],[[195089,195089],"mapped",[19704]],[[195090,195090],"mapped",[172293]],[[195091,195091],"mapped",[172558]],[[195092,195092],"mapped",[172689]],[[195093,195093],"mapped",[40635]],[[195094,195094],"mapped",[19798]],[[195095,195095],"mapped",[40697]],[[195096,195096],"mapped",[40702]],[[195097,195097],"mapped",[40709]],[[195098,195098],"mapped",[40719]],[[195099,195099],"mapped",[40726]],[[195100,195100],"mapped",[40763]],[[195101,195101],"mapped",[173568]],[[195102,196605],"disallowed"],[[196606,196607],"disallowed"],[[196608,262141],"disallowed"],[[262142,262143],"disallowed"],[[262144,327677],"disallowed"],[[327678,327679],"disallowed"],[[327680,393213],"disallowed"],[[393214,393215],"disallowed"],[[393216,458749],"disallowed"],[[458750,458751],"disallowed"],[[458752,524285],"disallowed"],[[524286,524287],"disallowed"],[[524288,589821],"disallowed"],[[589822,589823],"disallowed"],[[589824,655357],"disallowed"],[[655358,655359],"disallowed"],[[655360,720893],"disallowed"],[[720894,720895],"disallowed"],[[720896,786429],"disallowed"],[[786430,786431],"disallowed"],[[786432,851965],"disallowed"],[[851966,851967],"disallowed"],[[851968,917501],"disallowed"],[[917502,917503],"disallowed"],[[917504,917504],"disallowed"],[[917505,917505],"disallowed"],[[917506,917535],"disallowed"],[[917536,917631],"disallowed"],[[917632,917759],"disallowed"],[[917760,917999],"ignored"],[[918000,983037],"disallowed"],[[983038,983039],"disallowed"],[[983040,1048573],"disallowed"],[[1048574,1048575],"disallowed"],[[1048576,1114109],"disallowed"],[[1114110,1114111],"disallowed"]]');

/***/ })

};
;
//# sourceMappingURL=154.index.js.map