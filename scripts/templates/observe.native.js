import React from 'react';
import { Observe, ObserveRoot, useObserve } from 'expo-observe';

// Keep all installations' errors while omitting non-error performance events.
Observe.configure({ sampleRate: 0, errorSampleRate: 1, dispatchInDebug: false });
export const crashReportingConfigured = true;
const reported = new WeakSet();

export function MonitoringRoot({ children }) {
  return <ObserveRoot>{children}</ObserveRoot>;
}

export function reportStartupError(error) {
  if (error && typeof error === 'object') {
    if (reported.has(error)) return;
    reported.add(error);
  }
  try {
    // No roster, answers, task text or application state is attached.
    Observe.reportError(error);
  } catch {
    // Reporting must not prevent the local diagnostic screen from rendering.
  }
}

export function useStartupInteractive() {
  return useObserve().markInteractive;
}
