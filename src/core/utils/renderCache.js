const DEFAULT_MAX_ENTRIES = 200;

const store = new Map();

function pruneExpired() {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.expiresAt <= now) {
      store.delete(key);
    }
  }
}

function pruneIfFull() {
  if (store.size <= DEFAULT_MAX_ENTRIES) {
    return;
  }

  const overflow = store.size - DEFAULT_MAX_ENTRIES;
  let removed = 0;

  for (const key of store.keys()) {
    if (removed >= overflow) {
      break;
    }
    store.delete(key);
    removed += 1;
  }
}

export const renderCache = {
  get(key) {
    const entry = store.get(key);

    if (!entry) {
      return null;
    }

    if (entry.expiresAt <= Date.now()) {
      store.delete(key);
      return null;
    }

    store.delete(key);
    store.set(key, entry);
    return entry.value;
  },

  set(key, value, ttlSeconds) {
    store.delete(key);
    store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000
    });
    pruneExpired();
    pruneIfFull();
  },

  flush() {
    store.clear();
  },

  get size() {
    return store.size;
  }
};
