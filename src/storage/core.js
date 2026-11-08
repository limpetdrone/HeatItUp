export function createRepository(store) {
  let queue = Promise.resolve();
  return {
    async read(key, validate, fallback) {
      const raw = await store.getItem(key);
      if (raw === null) return fallback;
      let value;
      try {
        value = JSON.parse(raw);
      } catch {
        throw new Error('A mentés sérült. Nem töltöttük be.');
      }
      if (!validate(value)) throw new Error('Ismeretlen vagy sérült mentés.');
      return value;
    },
    write(key, value) {
      const snapshot = JSON.stringify(value);
      const operation = queue.catch(() => {}).then(() => value === null ? store.removeItem(key) : store.setItem(key, snapshot));
      queue = operation;
      return operation;
    }
  };
}
