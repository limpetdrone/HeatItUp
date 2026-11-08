import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { test, expect, jest } from '@jest/globals';
import { Text } from 'react-native';
import Startup from '../Startup';
import { reportStartupError } from './monitoring/observe';
jest.mock('./monitoring/observe', () => ({
  MonitoringRoot: ({ children }) => children, reportStartupError: jest.fn()
}));
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
test('module initialization failure is shown instead of aborting startup', async () => {
  const warning = jest.spyOn(console, 'error').mockImplementation(() => {});
  let tree;
  try {
    await act(async () => { tree = renderer.create(<Startup loadApp={() => { throw Error('startup-module-test'); }} />); });
    expect(JSON.stringify(tree.toJSON())).toContain('The app could not start');
    await act(async () => tree.root.findAll(node => node.props.accessibilityRole === 'button' && typeof node.props.onPress === 'function')[0].props.onPress());
    expect(JSON.stringify(tree.toJSON())).toContain('startup-module-test');
    expect(reportStartupError.mock.calls.some(([error]) => error.message === 'startup-module-test')).toBe(true);
  } finally { if (tree) await act(async () => tree.unmount()); warning.mockRestore(); }
});
test('render errors are contained and successful startup renders the app', async () => {
  const warning = jest.spyOn(console, 'error').mockImplementation(() => {});
  const Broken = () => { throw Error('render-test'); };
  let tree;
  try {
    await act(async () => { tree = renderer.create(<Startup loadApp={() => Broken} />); });
    expect(JSON.stringify(tree.toJSON())).toContain('The app could not start');
    await act(async () => tree.unmount());
    function Ready() { return <Text>App ready</Text>; }
    await act(async () => { tree = renderer.create(<Startup loadApp={() => Ready} />); });
    expect(JSON.stringify(tree.toJSON())).toContain('App ready');
  } finally { if (tree) await act(async () => tree.unmount()); warning.mockRestore(); }
});
