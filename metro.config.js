// METRO CONFIG - Expo's normal bundler settings, plus ONE change: two folders are ignored because they are
// separate projects with their own packages and are not part of the app:
//   video/    the Remotion project that makes the letter story videos (the app only uses assets/videos)
//   website/  the KidBuddy website

const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

function ignoreFolder(name) {
  const folder = path.resolve(__dirname, name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${folder}[\\\\/].*`);
}

config.resolver.blockList = [].concat(config.resolver.blockList || [], ignoreFolder('video'), ignoreFolder('website'));

module.exports = config;
