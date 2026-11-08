import AsyncStorage from '@react-native-async-storage/async-storage';
import { createRepository } from './core';
export const repository = createRepository(AsyncStorage);
export const keys = {
  content: 'heatitup.content.v1',
  language: 'heatitup.language.v1',
  presets: 'heatitup.presets.v1',
  session: 'heatitup.session.v2',
  music: 'heatitup.music.v1',
  catalog: 'heatitup.catalog.v1'
};
