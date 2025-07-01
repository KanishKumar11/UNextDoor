module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // Add support for reanimated
      "react-native-reanimated/plugin",
      // Support for CommonJS modules
      ["@babel/plugin-transform-private-methods", { loose: true }],
    ],
  };
};
