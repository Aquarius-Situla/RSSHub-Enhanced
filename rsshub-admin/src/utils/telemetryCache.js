/* ============================================================================
 * telemetryCache.js -- Global SWR Telemetry & Status Cache
 * ============================================================================
 * COMMENTING STANDARDS:
 * 1. Block comments only. Inline comments are strictly prohibited.
 * 2. Section dividers use the === banner format.
 * 3. All prose is written in English.
 * ============================================================================ */

const STORAGE_KEY = 'rsshub_telemetry_cache_v1';

/* Safely load persisted telemetry from localStorage */
const loadPersistedCache = () => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    /* Ignore storage parsing errors */
  }
  return {};
};

const persisted = loadPersistedCache();

/* Global in-memory cache singleton initialized with persisted values */
const cacheStore = {
  systemStatus: persisted.systemStatus || null,
  proxyNodes: persisted.proxyNodes || null,
  bypassText: persisted.bypassText !== undefined ? persisted.bypassText : null,
  routeErrors: persisted.routeErrors || null,
  cookiecloud: persisted.cookiecloud || null
};

/* Listeners for reactive subscribers */
const listeners = new Set();

export const telemetryCache = {
  get(key) {
    return cacheStore[key] || null;
  },

  set(key, value) {
    cacheStore[key] = value;
    /* Persist to localStorage for zero-flicker reload */
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cacheStore));
      } catch (e) {
        /* Ignore quota errors */
      }
    }
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

      if (statusRes) telemetryCache.set('systemStatus', statusRes);
      if (nodesRes) telemetryCache.set('proxyNodes', nodesRes);
      if (bypassRes && bypassRes.content !== undefined) telemetryCache.set('bypassText', bypassRes.content);
      if (errorsRes && errorsRes.errors) telemetryCache.set('routeErrors', errorsRes.errors);
    } catch (e) {
      /* Warm-up silent fail */
    }
  }
};

export default telemetryCache;
