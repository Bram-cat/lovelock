const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add resolver configuration to handle React Native module resolution issues
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Add specific resolver for VirtualizeUtils issue
config.resolver.alias = {
  // Fix for VirtualizeUtils bundling error
  '@react-native/virtualized-lists': require.resolve('@react-native/virtualized-lists'),
};

// Ensure proper module resolution
config.resolver.nodeModulesPaths = [
  require('path').resolve(__dirname, 'node_modules'),
];

module.exports = config;
