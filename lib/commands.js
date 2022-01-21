

import {
  getMigrationFilesBeforeVersion,
  getMigrationsAfterButIncludingVersion,
  initializeMigrationTable,
  processTasks
} from "./migration.js";
import { log } from "./logger.js";
import actionTypes from "./actionTypes.js";
import _ from "lodash";

export function validateCommands (command) {
  if (!_.keys(supportedCommands).includes(command)) {
    throw new Error({supportedCommands}, `command '${command}' is unrecognized.`);
  }
}

const supportedCommands = {
  initialize: async () => {
    // todo: handle a non-idempotent 'create' case

    // attempt to initialize the forge table
    await initializeMigrationTable();
  },

  migrate: async ({version}) => {
    // attempt to initialize state table if needed
    await supportedCommands.initialize();

    const migrationsToBeExecuted = await getMigrationFilesBeforeVersion(version);

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

    const rollbacksToBeExecuted = _.reverse(_.sortBy(await getMigrationsAfterButIncludingVersion(version), 'version'));
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

export default supportedCommands;
