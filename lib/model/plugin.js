

import { config } from '../config.js';
import { findUp } from 'find-up';
let plugin;

/**
 * Finds and loads the migration state plugin.  It will attempt to load from a node module first,
 * then it will look by file path recursively looking up through parent directories.
 *
 * @returns {Promise<*>}
 */
export const loadPluginFile = async() => {
  let Tmp;
  try {
    // attempt to pull in a node module
    Tmp = await import( config.migrationStatePlugin );
  } catch ( error ) {
    if ( error.code === 'ERR_MODULE_NOT_FOUND' ) { // We only want to handle
      Tmp = await import( process.platform === 'win32' ?
        `file://${await findUp( config.migrationStatePlugin )}` :
        await findUp( config.migrationStatePlugin ));
    } else {
      throw error;
    }
  }

  // initialize the plugin
  plugin = new Tmp.default( config );
  return plugin;
};

/**
 * Gets the plugin after its loaded
 *
 * @returns {*}
 */
export default function getPlugin() {
  return plugin;
}
