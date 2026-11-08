import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { test, expect, jest } from '@jest/globals';
import { Text as NativeText } from 'react-native';
import { LanguageProvider } from './context';
import { Text } from './ui';
import LanguageSettingsScreen from '../screens/LanguageSettingsScreen';
import ActionButton from '../components/ActionButton';
let mockSaved = 'auto';
let mockLocales = [{
  languageTag: 'de-AT'
}];
jest.mock('expo-localization', () => ({
  useLocales: () => mockLocales
}));
jest.mock('../storage/repository', () => ({
  keys: {
    language: 'language'
  },
  repository: {
    read: async () => mockSaved,
    write: async (key, value) => {
      mockSaved = value;
    }
  }
}));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: 'SafeAreaView'
}));
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
test('phone language, live override, restart persistence, and verbatim names', async () => {
  const warning = jest.spyOn(console, 'error').mockImplementation(message => {
    if (!String(message).includes('react-test-renderer is deprecated')) throw new Error(String(message));
  });
  let tree;
  const app = () => <LanguageProvider><LanguageSettingsScreen onBack={() => {}} /><Text verbatim>Nyelv</Text></LanguageProvider>;
  try {
    await act(async () => {
      tree = renderer.create(app());
    });
    const text = () => tree.root.findAllByType(NativeText).map(t => t.props.children).flat(Infinity).filter(t => typeof t === 'string');
    expect(text()).toContain('Sprache');
    expect(text()).toContain('Nyelv');
    await act(async () => tree.root.findAllByType(ActionButton).find(b => b.props.title === 'English').props.onPress());
    expect(mockSaved).toBe('en');
    expect(text()).toContain('Language');
    await act(async () => tree.unmount());
    await act(async () => {
      tree = renderer.create(app());
    });
    expect(text()).toContain('Language');
    mockLocales = [{
      languageTag: 'hu-HU'
    }];
    await act(async () => tree.update(app()));
    expect(text()).toContain('Language');
    await act(async () => tree.root.findAllByType(ActionButton).find(b => b.props.title === 'Telefon nyelve').props.onPress());
    expect(mockSaved).toBe('auto');
    expect(text()).not.toContain('Language');
  } finally {
    if (tree) await act(async () => tree.unmount());
    warning.mockRestore();
  }
});
