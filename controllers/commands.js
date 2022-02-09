

import {
  getMigrationsBeforeVersion,
  getMigrationsAfterVersion,
  initializeMigrationTable,
  processTasks,
  recordMigrations
} from '../lib/processActions.js';
import { log } from '../lib/logger.js';
import actionTypes from '../lib/actionTypes.js';
import _ from 'lodash';

const supportedCommands = {
  initialize: async ({version}) => {
    // attempt to initialize the forge table
    await initializeMigrationTable();

    const migrationsToBeInserted = await getMigrationsBeforeVersion(version);
    await recordMigrations(migrationsToBeInserted);
  },

  migrate: async ({version}) => {
    // attempt to initialize state table if needed
    await initializeMigrationTable();

    const migrationsToBeExecuted = await getMigrationsBeforeVersion(version);

    if (migrationsToBeExecuted.length > 0) {
      log.debug({migrationsToBeExecuted});
      // attempt to get current state ... if none, assume it needs to be initialized later.
      await processTasks(migrationsToBeExecuted, actionTypes.migrate);
    }
    else {
      log.info('No new migrations detected.  Nothing to do!');
    }
  },

  rollback: async ({version}) => {
    // todo: handle a non-initialized case

    const rollbacksToBeExecuted = _.reverse(_.sortBy(await getMigrationsAfterVersion(version), 'version'));
    if (rollbacksToBeExecuted.length > 0) {
      log.debug({rollbacksToBeExecuted});
      // attempt to get current state ... if none, assume it needs to be initialized later.
      await processTasks(rollbacksToBeExecuted, actionTypes.rollback);
    }
    else {
      log.info('No rollbacks detected.  Nothing to do!');
    }
  }
};

export function validateCommands (command) {
  if (!_.keys(supportedCommands).includes(command)) {
    const error = new Error(`command '${command}' is unrecognized.`);
    error.meta = {supportedCommands};
    throw error;
  }
}

export default supportedCommands;
