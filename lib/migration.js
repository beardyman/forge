
import _ from 'lodash';
import {config} from './config.js';
import migrationState from './model/migrationState.js';
import {log} from './logger.js';
import path from 'path';
import Promise from 'bluebird';
import actionTypes, {actionLookup} from './actionTypes.js';
import migrations from './model/migrations.js';

export const initializeMigrationTable = migrationState.initialize;

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
const parseFileName = (filename) => {
  const parts = filename.split('_');
  const version = _.pullAt(parts, [0])[0].slice(1); // remove 'v' from version designation
  const name = _.join(parts, ' ').split('.')[0]; // remove the extension

  return {version, name, filename};
};

/**
 *
 * @param version
 * @returns {exports<(string|string|T|*)[]>}
 */
export const getMigrationFilesBeforeVersion = async (version) => {
  // load migrations
  const migrationFiles = await migrations.getMigrationFiles();
  const migrationFileConfigs = _.sortBy(migrationFiles.map((file)=>parseFileName(file)), 'version');
  log.debug({migrationFileConfigs});

  // get previously ran migrations
  const currentState = _.sortBy(await migrationState.getCurrentState(), 'version');
  log.debug({currentState});

  // determine any new files to be executed
  const unrunMigrations = _.differenceBy(migrationFileConfigs, currentState, 'version');
  log.debug({unrunMigrations});

  // filter out any migrations that are before the most recent ran one
  const mostRecentMigration = _.last(currentState);
  const newMigrations = _.isEmpty(mostRecentMigration) ? unrunMigrations : // if it hasn't been run yet, use all unrun migrations
    unrunMigrations.slice(_.findIndex(unrunMigrations, (migration) =>
      migration.version === mostRecentMigration.version));

  // only get the migrations before the supplied version
  const finalMigrationsList =  !_.isUndefined(version) ?
    _.filter(newMigrations, (migration)=> migration.version <= version) :
    newMigrations;

  log.debug({finalMigrationsList}, 'Acting on these migrations');
  return finalMigrationsList;
};

/**
 *
 */
export const getMigrationsAfterButIncludingVersion = async (version) => {
  // get previously ran migrations
  const currentState = _.sortBy(await migrationState.getCurrentState(), 'version');

  const migrationsAfterVersion = _.isUndefined(version) ? [_.last(currentState)] :
    currentState.slice(_.findIndex(currentState, (migration) => migration.version >= version ));

  log.debug({migrationsAfterVersion});
  return migrationsAfterVersion;
};

/**
 * Loads the migration file and returns the function for the action taking place.
 *
 * @param config
 * @param migrationFile
 * @param action
 * @returns {exports<*>}
 */
const loadAction = async (config, migrationFile, action) => {
  const file = path.resolve(`${config.migrationsDirectory}/${migrationFile}`);

  log.info({ msg: `Loading File: ${file}`, filename: migrationFile});
  const migrationActions = await import(file);
  return migrationActions[actionLookup(action)];
};


/**
 * Helper for getting correct verbiage based on the action for logging.
 *
 * @param action - action type
 * @returns {string} - verbiage based on action type
 */
function getLogStatement(action) {
  switch(action) {
    case actionTypes.migrate:
      return 'Recording Migration';
    case actionTypes.rollback:
      return 'Removing Migration';
    default:
      return 'Unknown Action';
  }
}

/**
 * Loads and executes each action, then modifies the state table to reflect each action.
 *
 * @param migrationFileConfigs
 * @param action
 * @returns {*}
 */
export function processTasks(migrationFileConfigs, action) {
  return Promise.each(migrationFileConfigs, async (migrationFile) => {

    // Do the migration
    const actionMethod = await loadAction(config, migrationFile.filename, action);
    log.info({msg: `Running ${actionLookup(action)} from ${migrationFile.filename}`});
    await actionMethod(config);

    log.info({msg: `${getLogStatement(action)} for ${migrationFile.filename}`, ...migrationFile});
    if(action === actionTypes.migrate) {
      await migrationState.recordMigration(migrationFile);
    } else if (action === actionTypes.rollback) {
      await migrationState.removeMigration(migrationFile);
    }
  });
}
