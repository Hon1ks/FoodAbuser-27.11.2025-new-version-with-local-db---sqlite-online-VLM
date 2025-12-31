// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Добавляем polyfill для buffer (нужен для react-native-svg)
config.resolver.extraNodeModules = {
  buffer: require.resolve('buffer'),
};

module.exports = config;

