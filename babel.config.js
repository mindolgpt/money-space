module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { nativewind: { env: process.env.NODE_ENV } }]],
    plugins: [
      ["module-resolver", {
        root: ["."],
        alias: {
          "@": "./src",
        },
      }],
      "react-native-reanimated/plugin",
    ],
  };
};
