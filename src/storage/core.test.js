import { test, expect } from '@jest/globals';
import { createRepository } from './core';
test('soros snapshot mentés, a későbbi állapot győz', async () => {
  const data = new Map();
  const repo = createRepository({
    getItem: async k => data.get(k) ?? null,
    setItem: async (k, v) => {
      await new Promise(r => setTimeout(r, 5));
      data.set(k, v);
    },
    removeItem: async k => data.delete(k)
  });
  const original = {
    n: 1
  };
  const first = repo.write('s', original);
  original.n = 100;
  const second = repo.write('s', {
    n: 2
  });
  await Promise.all([first, second]);
  expect(await repo.read('s', v => typeof v.n === 'number', null)).toEqual({
    n: 2
  });
  await repo.write('s', null);
  expect(await repo.read('s', () => true, null)).toBeNull();
});
test('íráshiba után is használható, sérült adat elutasítva', async () => {
  let fail = true;
  const repo = createRepository({
    getItem: async () => '{broken',
    setItem: async () => {
      if (fail) throw new Error('disk');
    },
    removeItem: async () => {}
  });
  await expect(repo.write('s', {})).rejects.toThrow();
  fail = false;
  await expect(repo.write('s', {})).resolves.toBeUndefined();
  await expect(repo.read('s', () => true, null)).rejects.toThrow();
});
