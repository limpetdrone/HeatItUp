import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { test, expect, jest } from '@jest/globals';
import FeedbackForm from './FeedbackForm';
import ActionButton from './ActionButton';
import { TextInput } from 'react-native';
jest.mock('react-native-safe-area-context', () => ({ SafeAreaView: 'SafeAreaView' }));
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
test('empty reports can be sent; failed retries reuse the same ID', async () => {
  const warning = jest.spyOn(console, 'error').mockImplementation(message => { if (!String(message).includes('react-test-renderer is deprecated')) throw Error(String(message)); });
  const submit = jest.fn().mockRejectedValueOnce(Error('offline')).mockResolvedValueOnce();
  let tree;
  try {
    await act(async () => { tree = renderer.create(<FeedbackForm card={{ id: 'sample', kind: 'question', intensity: 1, text: 'Test' }} onClose={() => {}} submit={submit} />); });
    const send = () => tree.root.findAllByType(ActionButton).find(b => b.props.title === 'Beküldés').props.onPress();
    await act(async () => send());
    expect(submit.mock.calls[0][1].message).toBe('');
    await act(async () => send());
    expect(submit.mock.calls[1][0]).toBe(submit.mock.calls[0][0]);
    expect(tree.root.findAllByType(ActionButton).some(b => b.props.title === 'Beküldés')).toBe(false);
  } finally { if (tree) await act(async () => tree.unmount()); warning.mockRestore(); }
});
test('suggestions require a description and keep it after a failed request', async () => {
  const warning = jest.spyOn(console, 'error').mockImplementation(message => { if (!String(message).includes('react-test-renderer is deprecated')) throw Error(String(message)); });
  const submit = jest.fn().mockRejectedValue(Error('offline'));
  let tree;
  try {
    await act(async () => { tree = renderer.create(<FeedbackForm onClose={() => {}} submit={submit} />); });
    const button = () => tree.root.findAllByType(ActionButton).find(b => b.props.title === 'Beküldés');
    expect(button().props.disabled).toBe(true);
    await act(async () => tree.root.findByType(TextInput).props.onChangeText('A neutral game idea'));
    await act(async () => button().props.onPress());
    expect(tree.root.findByType(TextInput).props.value).toBe('A neutral game idea');
    expect(submit.mock.calls[0][1].type).toBe('suggestion');
  } finally { if (tree) await act(async () => tree.unmount()); warning.mockRestore(); }
});
