import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { test, expect, jest } from '@jest/globals';
import { MonitoringRoot, reportStartupError, useStartupInteractive, crashReportingConfigured } from '../../scripts/templates/observe.native';
const mockInteractive = jest.fn();
jest.mock('expo-observe', () => ({
  Observe: { configure: jest.fn(), reportError: jest.fn() },
  ObserveRoot: 'ObserveRoot',
  useObserve: () => ({ markInteractive: mockInteractive })
}), { virtual: true });
const { Observe, ObserveRoot } = jest.requireMock('expo-observe');
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

test('native adapter keeps crash events but disables unrelated performance dispatch', () => {
  expect(crashReportingConfigured).toBe(true);
  expect(Observe.configure).toHaveBeenCalledWith({ sampleRate: 0, errorSampleRate: 1, dispatchInDebug: false });
});
test('handled startup errors are reported once without attaching application state', () => {
  const error = Error('neutral startup test');
  reportStartupError(error);
  reportStartupError(error);
  expect(Observe.reportError).toHaveBeenCalledTimes(1);
  expect(Observe.reportError).toHaveBeenCalledWith(error);
  Observe.reportError.mockImplementationOnce(() => { throw Error('reporting unavailable'); });
  expect(() => reportStartupError(Error('another startup failure'))).not.toThrow();
});
test('root wraps the app and the hook marks actual readiness', async () => {
  const warning = jest.spyOn(console, 'error').mockImplementation(() => {});
  let tree;
  function Ready() {
    const markInteractive = useStartupInteractive();
    React.useEffect(() => { markInteractive(); }, [markInteractive]);
    return null;
  }
  try {
    await act(async () => { tree = renderer.create(<MonitoringRoot><Ready /></MonitoringRoot>); });
    expect(tree.root.findByType(ObserveRoot)).toBeTruthy();
    expect(mockInteractive).toHaveBeenCalledTimes(1);
  } finally {
    if (tree) await act(async () => tree.unmount());
    warning.mockRestore();
  }
});
