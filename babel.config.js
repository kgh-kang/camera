module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // vision-camera frame processors (worklets-core)
      'react-native-worklets-core/plugin',
      // reanimated plugin must be listed LAST
      'react-native-reanimated/plugin',
    ],
  };
};
