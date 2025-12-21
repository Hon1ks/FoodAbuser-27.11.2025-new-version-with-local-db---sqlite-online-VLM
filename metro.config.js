// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Добавляем поддержку дополнительных расширений как assets
// ПРИМЕЧАНИЕ: .bin файлы для TensorFlow модели все равно не будут работать через require()
// из-за ограничений Metro bundler. Модель будет использовать mock данные в MVP версии.
config.resolver.assetExts.push('bin', 'tflite', 'yaml');

module.exports = config;

