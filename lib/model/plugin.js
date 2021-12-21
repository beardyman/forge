

import config from '../config.js';
import path from 'path';
let plugin;

export const loadPluginFile = async () => {
  const Tmp = await import(path.resolve(config.pluginFile));
  plugin = new Tmp.default(config);
  return plugin;
};

export default function getPlugin() {
  return plugin;
}