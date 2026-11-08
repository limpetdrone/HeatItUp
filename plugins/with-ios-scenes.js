const { withInfoPlist, withAppDelegate } = require('expo/config-plugins');

function migrateAppDelegate(source) {
  if (!source.includes('ExpoReactNativeFactoryProvider')) {
    if (!source.includes('class AppDelegate: ExpoAppDelegate {')) throw Error('Unexpected AppDelegate superclass; review scene migration.');
    source = source.replace('class AppDelegate: ExpoAppDelegate {', 'class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {');
  }
  const windowBlock = /#if os\(iOS\) \|\| os\(tvOS\)\s+window = UIWindow\(frame: UIScreen\.main\.bounds\)[\s\S]*?factory\.startReactNative\([\s\S]*?#endif/;
  source = source.replace(windowBlock, '// ExpoAppSceneDelegate creates the scene window and starts React Native.');
  if (source.includes('factory.startReactNative(')) throw Error('AppDelegate still starts React Native directly; scene migration needs review.');
  return source;
}

module.exports = config => {
  config = withInfoPlist(config, config => {
    config.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [{
          UISceneConfigurationName: 'Default Configuration',
          UISceneDelegateClassName: 'EXExpoAppSceneDelegate'
        }]
      }
    };
    return config;
  });
  return withAppDelegate(config, config => {
    if (config.modResults.language !== 'swift') throw Error('Scene migration expects the Expo Swift AppDelegate.');
    config.modResults.contents = migrateAppDelegate(config.modResults.contents);
    return config;
  });
};
module.exports.migrateAppDelegate = migrateAppDelegate;
