import { test, expect } from '@jest/globals';
import { musicDefaults, selectTrack, videoIdFromUrl } from './selectTrack';
const items = [{
  id: 'a',
  cardId: 'c',
  kind: 'mood',
  reviewed: true,
  explicit: false
}, {
  id: 'b',
  cardId: 'c',
  kind: 'lyric_joke',
  reviewed: true,
  explicit: false
}, {
  id: 'x',
  cardId: 'c',
  kind: 'mood',
  reviewed: false,
  explicit: false
}];
test('determinista választás, mód, stílus és ellenőrzött kapcsolatok', () => {
  const m = {
    ...musicDefaults,
    mode: 'task',
    matchStyle: 'lyric_joke'
  };
  expect(selectTrack(items, 'c', m, 'key').id).toBe('b');
  expect(selectTrack(items, 'c', m, 'key')).toEqual(selectTrack(items, 'c', m, 'key'));
  expect(selectTrack(items, 'c', musicDefaults, 'key')).toBeNull();
  expect(selectTrack(items, 'missing', m, 'key')).toBeNull();
  expect(selectTrack(items, 'c', {
    ...m,
    matchStyle: 'mixed'
  }, 's:turn:1').kind).toBe('lyric_joke');
  expect(selectTrack(items, 'c', {
    ...m,
    matchStyle: 'mixed'
  }, 's:turn:2').kind).toBe('mood');
  expect(selectTrack(items.map(t => ({
    ...t,
    explicit: true
  })), 'c', m, 'key')).toBeNull();
});
test('csak HTTPS szolgáltatói dal-linkből lesz videóazonosító', () => {
  expect(videoIdFromUrl('https://music.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  expect(videoIdFromUrl('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  expect(videoIdFromUrl('https://evil.com/watch?v=dQw4w9WgXcQ')).toBeNull();
  expect(videoIdFromUrl('javascript:alert(1)')).toBeNull();
});
