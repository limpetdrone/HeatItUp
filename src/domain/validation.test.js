import { describe, test, expect } from '@jest/globals';
import { validateSettings } from './validation';
const base = {
  players: ['Anna', 'Béla'],
  maxIntensity: 1,
  rounds: 3
};
describe('beállítások', () => {
  test.each([0, 1, 9])('%i játékos érvénytelen', count => expect(validateSettings({
    ...base,
    players: Array.from({
      length: count
    }, (_, i) => `Név ${i}`)
  }).ok).toBe(false));
  test.each([2, 8])('%i játékos érvényes', count => expect(validateSettings({
    ...base,
    players: Array.from({
      length: count
    }, (_, i) => `Név ${i}`)
  }).ok).toBe(true));
  test.each(['', '  ', 'a'.repeat(21), '😀'.repeat(21)])('hibás név: %s', name => expect(validateSettings({
    ...base,
    players: [name, 'Other']
  }).ok).toBe(false));
  test.each(['a'.repeat(20), '😀'.repeat(20)])('20 kódpont megengedett', name => expect(validateSettings({
    ...base,
    players: [name, 'Other']
  }).ok).toBe(true));
  test('trim, magyar kisbetűsítés és duplikátum', () => expect(validateSettings({
    ...base,
    players: [' ÁGI ', 'ági']
  }).ok).toBe(false));
  test('új másolatot ad, belső szóközt megtart', () => {
    const input = Object.freeze({
      ...base,
      players: Object.freeze(['  Anna  Mária  ', 'Béla'])
    });
    expect(validateSettings(input).settings.players).toEqual(['Anna  Mária', 'Béla']);
    expect(input.players[0]).toBe('  Anna  Mária  ');
  });
  test.each([{
    maxIntensity: 0
  }, {
    maxIntensity: 6
  }, {
    rounds: 4
  }, {
    rounds: '3'
  }])('hibás enum', change => expect(validateSettings({
    ...base,
    ...change
  }).ok).toBe(false));
});
