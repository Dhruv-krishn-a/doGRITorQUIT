const { withProjectBuildGradle } = require('@expo/config-plugins');

const withKotlinVersion = (config, version) => {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      config.modResults.contents = config.modResults.contents.replace(
        /kotlinVersion = .*/,
        `kotlinVersion = "${version}"`
      );
    }
    return config;
  });
};

module.exports = withKotlinVersion;
