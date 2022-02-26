
import _ from 'lodash';
import Promise from 'bluebird';
import {config} from './config.js';
import migrationState from './model/migrationState.js';
import {log} from './logger.js';
import actionTypes, {actionLookup} from './actionTypes.js';
import migrations from './model/migrations.js';


/**
 * Helper for getting correct verbiage based on the action for logging.
 *
 * @param action - action type
 * @returns {string} - verbiage based on action type
 */
function getLogStatement( action ) {
  switch( action ) {
    case actionTypes.migrate:
      return 'Recording Migration';
    case actionTypes.rollback:
      return 'Removing Migration';
    default:
      return 'Unknown Action';
  }
}

/**
 * Loads and detects any new migrations and validates that there aren't new migrations added with old versions.
 *
 * @param {Object[]} currentState - Sorted list of migrations that exist in the current state
 *
 * @returns {Object[]} - New Migrations added after the most recent migration in the current state.
 */
async function getNewMigrations( currentState ) {
  const migrationFiles = await migrations.getMigrationFiles();
  const parsedMigrationFiles = _.sortBy( migrationFiles.map(( file ) => migrations.parseFileName( file )), 'version' );

  const unrunMigrations = _.differenceBy( parsedMigrationFiles, currentState, 'version' );
  const mostRecentlyRanMigration = _.last( currentState );

  // identify any new-old migrations and any migrations that are newer.
  const [outOfOrderMigrations, newMigrations] = _.partition( unrunMigrations,
    ( migration ) => migration?.version <= mostRecentlyRanMigration?.version );
  log.debug({outOfOrderMigrations, newMigrations});

  // detect if there are any new migrations that have older versions than the latest in our current state
  if ( !_.isEmpty( outOfOrderMigrations )) {
    throw new Error( 'One or more migrations were added that are older than the current state.  Please resolve.', {cause: outOfOrderMigrations});
  }

  return newMigrations;
}

export const initializeMigrationTable = migrationState.initialize;

/**
 * Returns all new versions prior to but including version supplied.
 * If no version is supplied all new versions are returned.
 *
 * @param version
 * @returns {exports<(string|string|T|*)[]>}
 */
export const getMigrationsBeforeVersion = async( version ) => {
  // get previously ran migrations
  const currentState = _.sortBy( await migrationState.getCurrentState(), 'version' );
  log.debug({currentState});

  // determine any new files to be executed
  const newMigrations = await getNewMigrations( currentState );

  // only get the migrations before the supplied version
  const finalMigrationsList =  !_.isUndefined( version ) ?
    _.filter( newMigrations, ( migration )=> migration.version <= version ) :
    newMigrations;

  log.debug({finalMigrationsList}, 'Acting on these migrations' );
  return finalMigrationsList;
};


/**
 * Gets migrations after a given version
 *
 * @param version
 * @returns {Promise<unknown[]>}
 */
export const getMigrationsAfterVersion = async( version ) => {
  // get previously ran migrations
  const currentState = _.sortBy( await migrationState.getCurrentState(), 'version' );

  const migrationsAfterVersion = _.isUndefined( version ) ? [_.last( currentState )] :
    currentState.slice( _.findIndex( currentState, ( migration ) => migration.version > version ));

  log.debug({migrationsAfterVersion});
  return migrationsAfterVersion;
};


/**
 * Loads and executes each action, then modifies the state table to reflect each action.
 *
 * @param migrationFileConfigs
 * @param action
 * @returns {*}
 */
export function processTasks( migrationFileConfigs, action ) {
  return Promise.each( migrationFileConfigs, async( migrationFile ) => {

    // Do the migration
    const actionMethod = await migrations.loadAction( config, migrationFile.filename, action );
    log.info({msg: `Running ${actionLookup( action )} from ${migrationFile.filename}`});
    await actionMethod( config );

    log.info({msg: `${getLogStatement( action )} for ${migrationFile.filename}`, ...migrationFile});
    if( action === actionTypes.migrate ) {
      await migrationState.recordMigration( migrationFile );
    } else if ( action === actionTypes.rollback ) {
      await migrationState.removeMigration( migrationFile );
    }
  });
}

/**
 * Records a list of migration files in state.  Used when initializing state for an existing migration.
 *
 * @param migrationFiles
 */
export function recordMigrations( migrationFiles ) {
  return Promise.each( migrationFiles, async( migrationFile )=>{
    await migrationState.recordMigration( migrationFile );
  });
}
