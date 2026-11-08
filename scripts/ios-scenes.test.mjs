import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const plugin = require('../plugins/with-ios-scenes');
const old = `class AppDelegate: ExpoAppDelegate {
  var window: UIWindow?
  var reactNativeFactory: RCTReactNativeFactory?
#if os(iOS) || os(tvOS)
    window = UIWindow(frame: UIScreen.main.bounds)
    factory.startReactNative(withModuleName: "main", in: window, launchOptions: launchOptions)
#endif
}`;
test('scene migration transfers window startup to the Expo native scene delegate', () => {
  const result = plugin.migrateAppDelegate(old);
  assert.ok(result.includes('ExpoAppDelegate, ExpoReactNativeFactoryProvider'));
  assert.ok(!result.includes('factory.startReactNative('));
  assert.equal(plugin.migrateAppDelegate(result), result);
});
test('unexpected custom startup cannot be silently shipped', () => {
  assert.throws(() => plugin.migrateAppDelegate('class Different: UIResponder {}'));
  assert.throws(() => plugin.migrateAppDelegate('class AppDelegate: ExpoAppDelegate { factory.startReactNative() }'));
});
test('manifest points to the Objective-C name of the Expo scene delegate', async () => {
  const config = plugin({ name: 'HeatItUp', slug: 'heatitup' });
  const result = await config.mods.ios.infoPlist({ modResults: {}, modRequest: { platform: 'ios', modName: 'infoPlist', projectRoot: process.cwd(), introspect: false } });
  assert.equal(result.modResults.UIApplicationSceneManifest.UISceneConfigurations.UIWindowSceneSessionRoleApplication[0].UISceneDelegateClassName, 'EXExpoAppSceneDelegate');
});
