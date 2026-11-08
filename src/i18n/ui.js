import React, { forwardRef } from 'react';
import { Text as NativeText, TextInput as NativeTextInput, Switch as NativeSwitch } from 'react-native';
import { useTranslation } from './context';
export const Text = forwardRef(function Text({
  children,
  verbatim,
  ...props
}, ref) {
  const t = useTranslation();
  return <NativeText ref={ref} {...props}>{verbatim ? children : React.Children.map(children, child => typeof child === 'string' ? t(child) : child)}</NativeText>;
});
export const TextInput = forwardRef(function TextInput(props, ref) {
  const t = useTranslation();
  return <NativeTextInput {...props} ref={ref} placeholder={t(props.placeholder)} accessibilityLabel={t(props.accessibilityLabel)} />;
});
export function Switch(props) {
  const t = useTranslation();
  return <NativeSwitch {...props} accessibilityLabel={t(props.accessibilityLabel)} />;
}
