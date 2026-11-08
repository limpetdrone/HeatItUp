// Native monitoring is activated by npm run setup:crash-reporting after SDK installation.
import React from 'react';
export const crashReportingConfigured = false;
export function MonitoringRoot({ children }) { return <React.Fragment>{children}</React.Fragment>; }
export function reportStartupError() {}
const markInteractive = () => {};
export function useStartupInteractive() { return markInteractive; }
