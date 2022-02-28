
import path from 'path';
import fs from 'fs/promises';
import _ from 'lodash';
import {findUp} from 'find-up';
import { config } from '../config.js';
import { log } from '../logger.js';
import { actionLookup } from '../actionTypes.js';

const model =  {};

/**
 * Splits a migration filename into parts.
 *
 * Filenames need to follow the following format:
 * `v1_XXXXX_XXXXXXXX.js`
 * Example:
 * `v1_create_user_table.js`
 *
 * @param filename
 */
model.parseFileName = ( filename ) => {
  const parts = filename.split( '_' );
  const version = _.pullAt( parts, [ 0 ])[0].slice( 1 ); // remove 'v' from version designation
  const name = _.join( parts, ' ' ).split( '.' )[0]; // remove the extension

  return {version, name, filename};
};

/**
 * Loads the migration file and returns the function for the action taking place.
 *
 * @param config
 * @param migrationFile
 * @param action
 * @returns {Function}
 */
model.loadAction = async( config, migrationFile, action ) => {
  let file = path.resolve( `${config.migrationsDirectory}/${migrationFile}` );


  // tesing file:// for all platforms
  // if ( process.platform === 'win32' ) {
  //   file = `file://${file}`;
  // }

  log.info({ msg: `Loading File: ${file}`, filename: migrationFile});
  const migrationActions = await import( `file://${file}` );
  return migrationActions[actionLookup( action )];
};

/**
 * Gets a list of migration files from the configured directory
 *
 * @returns {Promise<string[]>}
 */
model.getMigrationFiles = async() => {
  let directory = await findUp( config.migrationsDirectory, {type: 'directory'});

  if ( !directory ) {
    throw new Error( `Path configuration for 'migrationsDirectory' cannot be found. (value: ${config.migrationsDirectory})` );
  }

  let files = await fs.readdir( directory );
  files = _.filter( files, ( f ) => _.startsWith( f, 'v' ) && _.endsWith( f, '.js' ));
  return files;
};

export default model;
