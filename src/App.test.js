import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { test, expect, jest } from '@jest/globals';
import App from './App';
import ActionButton from './components/ActionButton';
import TaskTimer from './components/TaskTimer';
import SetupScreen from './screens/SetupScreen';
import SettingsScreen from './screens/SettingsScreen';
import { startSession, chooseCardKind, currentTurn } from './domain/session';
import { validateContent } from './domain/content';
import { TextInput, TouchableOpacity } from 'react-native';
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
    catalog: 'catalog',
    content: 'content'
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

test('settings round-trip keeps unsaved setup names and the current player page', async () => {
  mockData.clear();
  const warning = jest.spyOn(console, 'error').mockImplementation(message => {
    if (!String(message).includes('react-test-renderer is deprecated')) throw Error(String(message));
  });
  let tree;
  const press = async title => act(async () => tree.root.findAllByType(ActionButton).find(b => b.props.title === title).props.onPress());
  try {
    await act(async () => { tree = renderer.create(<App />); });
    await press('Kezdjük →');
    await press('Tovább a játékosokhoz →');
    await act(async () => tree.root.findAllByType(TextInput).find(input => input.props.accessibilityLabel === 'Név').props.onChangeText('Alicia'));
    await act(async () => tree.root.findByType(SetupScreen).props.onSettings());
    await act(async () => tree.root.findByType(SettingsScreen).props.onBack());
    expect(tree.root.findAllByType(TextInput).find(input => input.props.accessibilityLabel === 'Név').props.value).toBe('Alicia');
  } finally {
    if (tree) await act(async () => tree.unmount());
    warning.mockRestore();
  }
});

test('timer adjustment reaches the saved session through the UI', async () => {
  mockData.clear();
  const content = { schemaVersion: 1, cards: [{ id: 'timer-review', kind: 'challenge', intensity: 1, minPlayers: 2, participantCount: 2, durationSeconds: 60, text: { hu: 'Időzítő teszt', en: 'Timer test', de: 'Timerprüfung' } }] };
  const cards = validateContent(content).cards;
  const initial = startSession('timer-ui', { rounds: 3, maxIntensity: 1 }, [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }], cards).session;
  const session = chooseCardKind(initial, { turnId: currentTurn(initial).id, kind: 'challenge' }, cards).session;
  mockData.set('session', JSON.stringify(session));
  mockData.set('content', JSON.stringify(content));
  const warning = jest.spyOn(console, 'error').mockImplementation(message => {
    if (!String(message).includes('react-test-renderer is deprecated')) throw Error(String(message));
  });
  let tree;
  try {
    await act(async () => { tree = renderer.create(<App />); });
    await act(async () => tree.root.findAllByType(ActionButton).find(b => b.props.title === 'Játék folytatása').props.onPress());
    expect(tree.root.findByType(TaskTimer)).toBeTruthy();
    await act(async () => tree.root.findAllByType(TouchableOpacity).find(b => b.props.accessibilityLabel === 'Időzítő beállítások').props.onPress());
    await act(async () => tree.root.findAllByType(ActionButton).find(b => b.props.title === '+30s').props.onPress());
    expect(currentTurn(JSON.parse(mockData.get('session'))).durationSeconds).toBe(90);
  } finally {
    if (tree) await act(async () => tree.unmount());
    warning.mockRestore();
  }
});
