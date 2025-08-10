"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/run/handlers/tags-handler.cts
var tags_handler_exports = {};
__export(tags_handler_exports, {
  getMostRecentTagRevalidationTimestamp: () => getMostRecentTagRevalidationTimestamp,
  isAnyTagStale: () => isAnyTagStale,
  markTagsAsStaleAndPurgeEdgeCache: () => markTagsAsStaleAndPurgeEdgeCache,
  purgeEdgeCache: () => purgeEdgeCache
});
module.exports = __toCommonJS(tags_handler_exports);

// node_modules/@netlify/functions/dist/main.js
var import_process = require("process");
var import_stream = require("stream");
var import_util = require("util");
var purgeCache = async (options = {}) => {
  if (globalThis.fetch === void 0) {
    throw new Error(
      "`fetch` is not available. Please ensure you're using Node.js version 18.0.0 or above. Refer to https://ntl.fyi/functions-runtime for more information."
    );
  }
  const payload = {
    cache_tags: options.tags,
    deploy_alias: options.deployAlias
  };
  const token = import_process.env.NETLIFY_PURGE_API_TOKEN || options.token;
  if (import_process.env.NETLIFY_LOCAL && !token) {
    const scope = options.tags?.length ? ` for tags ${options.tags?.join(", ")}` : "";
    console.log(`Skipping purgeCache${scope} in local development.`);
    return;
  }
  if ("siteSlug" in options) {
    payload.site_slug = options.siteSlug;
  } else if ("domain" in options) {
    payload.domain = options.domain;
  } else {
    const siteID = options.siteID || import_process.env.SITE_ID;
    if (!siteID) {
      throw new Error(
        "The Netlify site ID was not found in the execution environment. Please supply it manually using the `siteID` property."
      );
    }
    payload.site_id = siteID;
  }
  if (!token) {
    throw new Error(
      "The cache purge API token was not found in the execution environment. Please supply it manually using the `token` property."
    );
  }
  const headers = {
    "Content-Type": "application/json; charset=utf8",
    Authorization: `Bearer ${token}`
  };
  if (options.userAgent) {
    headers["user-agent"] = options.userAgent;
  }
  const apiURL = options.apiURL || "https://api.netlify.com";
  const response = await fetch(`${apiURL}/api/v1/purge`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error(`Cache purge API call returned an unexpected status code: ${response.status}`);
  }
};
var pipeline = (0, import_util.promisify)(import_stream.pipeline);

// package.json
var name = "@netlify/plugin-nextjs";
var version = "5.12.0";

// src/run/handlers/tags-handler.cts
var import_storage = require("../storage/storage.cjs");
var import_request_context = require("./request-context.cjs");
var purgeCacheUserAgent = `${name}@${version}`;
async function getTagRevalidatedAt(tag, cacheStore) {
  const tagManifest = await cacheStore.get(tag, "tagManifest.get");
  if (!tagManifest) {
    return null;
  }
  return tagManifest.revalidatedAt;
}
async function getMostRecentTagRevalidationTimestamp(tags) {
  if (tags.length === 0) {
    return 0;
  }
  const cacheStore = (0, import_storage.getMemoizedKeyValueStoreBackedByRegionalBlobStore)({ consistency: "strong" });
  const timestampsOrNulls = await Promise.all(
    tags.map((tag) => getTagRevalidatedAt(tag, cacheStore))
  );
  const timestamps = timestampsOrNulls.filter((timestamp) => timestamp !== null);
  if (timestamps.length === 0) {
    return 0;
  }
  return Math.max(...timestamps);
}
function isAnyTagStale(tags, timestamp) {
  if (tags.length === 0 || !timestamp) {
    return Promise.resolve(false);
  }
  const cacheStore = (0, import_storage.getMemoizedKeyValueStoreBackedByRegionalBlobStore)({ consistency: "strong" });
  return new Promise((resolve, reject) => {
    const tagManifestPromises = [];
    for (const tag of tags) {
      const lastRevalidationTimestampPromise = getTagRevalidatedAt(tag, cacheStore);
      tagManifestPromises.push(
        lastRevalidationTimestampPromise.then((lastRevalidationTimestamp) => {
          if (!lastRevalidationTimestamp) {
            return false;
          }
          const isStale = lastRevalidationTimestamp >= timestamp;
          if (isStale) {
            resolve(true);
            return true;
          }
          return false;
        })
      );
    }
    Promise.all(tagManifestPromises).then((tagManifestAreStale) => {
      resolve(tagManifestAreStale.some((tagIsStale) => tagIsStale));
    }).catch(reject);
  });
}
function getCacheTagsFromTagOrTags(tagOrTags) {
  return (Array.isArray(tagOrTags) ? tagOrTags : [tagOrTags]).flatMap((tag) => tag.split(/,|%2c/gi)).filter(Boolean);
}
function purgeEdgeCache(tagOrTags) {
  const tags = getCacheTagsFromTagOrTags(tagOrTags);
  if (tags.length === 0) {
    return Promise.resolve();
  }
  (0, import_request_context.getLogger)().debug(`[NextRuntime] Purging CDN cache for: [${tags}.join(', ')]`);
  return purgeCache({ tags, userAgent: purgeCacheUserAgent }).catch((error) => {
    (0, import_request_context.getLogger)().withError(error).error(`[NextRuntime] Purging the cache for tags [${tags.join(",")}] failed`);
  });
}
async function doRevalidateTagAndPurgeEdgeCache(tags) {
  (0, import_request_context.getLogger)().withFields({ tags }).debug("doRevalidateTagAndPurgeEdgeCache");
  if (tags.length === 0) {
    return;
  }
  const tagManifest = {
    revalidatedAt: Date.now()
  };
  const cacheStore = (0, import_storage.getMemoizedKeyValueStoreBackedByRegionalBlobStore)({ consistency: "strong" });
  await Promise.all(
    tags.map(async (tag) => {
      try {
        await cacheStore.set(tag, tagManifest, "tagManifest.set");
      } catch (error) {
        (0, import_request_context.getLogger)().withError(error).log(`[NextRuntime] Failed to update tag manifest for ${tag}`);
      }
    })
  );
  await purgeEdgeCache(tags);
}
function markTagsAsStaleAndPurgeEdgeCache(tagOrTags) {
  const tags = getCacheTagsFromTagOrTags(tagOrTags);
  const revalidateTagPromise = doRevalidateTagAndPurgeEdgeCache(tags);
  const requestContext = (0, import_request_context.getRequestContext)();
  if (requestContext) {
    requestContext.trackBackgroundWork(revalidateTagPromise);
  }
  return revalidateTagPromise;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getMostRecentTagRevalidationTimestamp,
  isAnyTagStale,
  markTagsAsStaleAndPurgeEdgeCache,
  purgeEdgeCache
});
