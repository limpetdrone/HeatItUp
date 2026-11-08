const { withPodfile } = require('expo/config-plugins');

// Keep pod targets unsigned; only the app receives the distribution identity.
module.exports = config => withPodfile(config, config => {
  const marker = '# HeatItUp: app-only distribution signing';
  if (config.modResults.contents.includes(marker)) return config;
  const hook = '  post_install do |installer|';
  if (!config.modResults.contents.includes(hook)) throw Error('Cannot find the generated iOS post_install hook.');
  const settings = `
    ${marker}
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |build_config|
        build_config.build_settings['CODE_SIGNING_ALLOWED'] = 'NO'
        build_config.build_settings['CODE_SIGNING_REQUIRED'] = 'NO'
        build_config.build_settings['EXPANDED_CODE_SIGN_IDENTITY'] = ''
      end
    end`;
  config.modResults.contents = config.modResults.contents.replace(hook, hook + settings);
  return config;
});
