

import { config } from '../config.js';
import { findUp } from "find-up";
let plugin;

export const loadPluginFile = async () => {
  const Tmp = await import( await findUp(config.pluginFile));
  plugin = new Tmp.default(config);
  return plugin;
};

export default function getPlugin() {
  return plugin;
}
