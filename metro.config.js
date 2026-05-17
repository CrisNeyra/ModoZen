const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    assetExts: ['mp4', 'bmp', 'jpg', 'png', 'gif', 'webp', 'tiff', 'svg', 'psd', 'wbmp', 'heic', 'mov', 'avi', 'mkv', 'm4v'],
    sourceExts: ['js', 'json', 'ts', 'tsx', 'jsx', 'mjs', 'cjs'],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
