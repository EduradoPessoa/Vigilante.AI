module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'react' }]],
    plugins: [
      'react-native-reanimated/plugin',
      ['transform-define', {
        'process.env.EXPO_ROUTER_APP_ROOT': './app',
        'process.env.EXPO_ROUTER_IMPORT_MODE': 'sync'
      }]
    ],
  };
};
