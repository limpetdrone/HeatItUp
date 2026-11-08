import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { test, expect, jest } from '@jest/globals';
import App from './App';
import ActionButton from './components/ActionButton';
import { TextInput, Switch } from 'react-native';
const mockData = new Map();
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: 'SafeAreaView'
}));
jest.mock('expo-audio',()=>({useAudioPlayer:()=>({seekTo:async()=>{},play:()=>{}})}));
jest.mock('./components/YouTubePlayer', () => 'YouTubePlayer');
jest.mock('./storage/repository', () => ({
  keys: {
    presets: 'presets',
    session: 'session',
    music: 'music',
    catalog: 'catalog'
  },
  repository: {
    read: async (key, valid, fallback) => mockData.has(key) ? JSON.parse(mockData.get(key)) : fallback,
    write: async (key, value) => {
      mockData.set(key, JSON.stringify(value));
    }
  }
}));
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
test('preset mentés, névsorváltozás, folytatás és preset elszigetelése a felületen', async () => {
  const warning = jest.spyOn(console, 'error').mockImplementation(message => {
    if (!String(message).includes('react-test-renderer is deprecated')) throw new Error(String(message));
  });
  let tree;
  const press = async title => {
    const button = tree.root.findAllByType(ActionButton).find(b => b.props.title === title || b.props.accessibilityLabel === title);
    expect(button).toBeTruthy();
    await act(async () => {
      await button.props.onPress();
    });
  };
  try {
    await act(async () => {
      tree = renderer.create(<App />);
    });
    await press('Kezdjük →');
    await act(async () => tree.root.findAllByType(TextInput).find(n => n.props.accessibilityLabel === 'Összeállítás neve').props.onChangeText('Esténk'));
    await press('Összeállítás mentése');
    const presetBefore = mockData.get('presets');
    expect(JSON.parse(presetBefore)[0].members).toHaveLength(2);
    await press('Tovább a játékosokhoz →');
    await press('Következő játékos →');
    await press('Játék indítása →');
    expect(JSON.parse(mockData.get('session')).sourcePresetId).toBe(JSON.parse(presetBefore)[0].id);
    expect(JSON.parse(mockData.get('session')).roster.every(p=>p.sourceMemberId)).toBe(true);
    await press('Felelsz');
    await press('Passz →');
    const saved = JSON.parse(mockData.get('session'));
    expect(saved.turns.some(t => t.status === 'passed')).toBe(true);
    await press('Játékosok');
    await press('Szünet');
    expect(JSON.parse(mockData.get('session')).roster[0].status).toBe('paused');
    expect(mockData.get('presets')).toBe(presetBefore);
    await press('Vissza a játékhoz');
    await act(async () => tree.unmount());
    await act(async () => {
      tree = renderer.create(<App />);
    });
    await press('Játék folytatása');
    expect(mockData.get('presets')).toBe(presetBefore);
    await press('Játék befejezése');
    expect(JSON.parse(mockData.get('session')).endReason).toBe('stopped');
  } finally {
    if (tree) await act(async () => tree.unmount());
    warning.mockRestore();
  }
});
