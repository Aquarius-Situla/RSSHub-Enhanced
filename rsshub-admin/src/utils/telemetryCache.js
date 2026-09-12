/* ============================================================================
 * telemetryCache.js — Global SWR Telemetry & Status Cache
 * ============================================================================
 * COMMENTING STANDARDS:
 * 1. Block comments only. Inline comments are strictly prohibited.
 * 2. Section dividers use the === banner format.
 * 3. All prose is written in English.
 * ============================================================================ */

/* Global in-memory cache singleton */
const cacheStore = {
  systemStatus: null,
  proxyNodes: null,
  bypassText: null,
  routeErrors: null,
  cookiecloud: null
};

/* Listeners for reactive subscribers */
const listeners = new Set();

export const telemetryCache = {
  get(key) {
    return cacheStore[key] || null;
  },

  set(key, value) {
    cacheStore[key] = value;
    listeners.forEach(fn => {
      try {
        fn(key, value);
      } catch (e) {
        /* Ignore listener errors */
      }
    });
  },

  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  /* Pre-fetch common dashboard telemetry */
  async warmUp() {
    try {
      const [statusRes, nodesRes, bypassRes, errorsRes] = await Promise.all([
        fetch('api/system/status').then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('api/nodes').then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('api/bypass').then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('api/routes/errors').then(r => r.ok ? r.json() : null).catch(() => null)
      ]);

      if (statusRes) cacheStore.systemStatus = statusRes;
      if (nodesRes) cacheStore.proxyNodes = nodesRes;
      if (bypassRes && bypassRes.content) cacheStore.bypassText = bypassRes.content;
      if (errorsRes && errorsRes.errors) cacheStore.routeErrors = errorsRes.errors;
    } catch (e) {
      /* Warm-up silent fail */
    }
  }
};

export default telemetryCache;
