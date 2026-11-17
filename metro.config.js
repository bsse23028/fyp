// METRO CONFIG - Expo's normal bundler settings, plus ONE change: the video/ folder (the Remotion project
// that makes the letter story videos) is ignored, because it is a separate tool with its own packages and
// is not part of the app. Only the finished videos in assets/videos are used by the app.

const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const videoFolder = path.resolve(__dirname, 'video').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const ignoreVideo = new RegExp(`^${videoFolder}[\\\\/].*`);
config.resolver.blockList = [].concat(config.resolver.blockList || [], ignoreVideo);

module.exports = config;
