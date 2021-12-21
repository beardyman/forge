
import _ from 'lodash';
import log from './lib/logger.js';
import {
  initializeMigrationTable,
  getMigrationFilesBeforeVersion,
  getMigrationsAfterButIncludingVersion,
  processTasks
} from './lib/migration.js';
import { loadPluginFile } from "./lib/model/plugin.js";
import actionTypes from "./lib/actionTypes.js";

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

const main = async (argv) => {
  const command = argv._[0];
  const version = argv._[1]; // optional version

  if(!_.keys(supportedCommands).includes(command)) {
    log.error({supportedCommands}, `command '${command}' is unrecognized.`);
    process.exit(1);
  }

  await loadPluginFile();
  // todo: validate plugin file

  supportedCommands[command]({version}).then((results) => {
    log.info(`${_.upperFirst(command)} command completed successfully.`);
    process.exit(0);
  }).catch((error, err) => {
    log.error({error: error.toString()}, 'There has been an issue during the migration');
    process.exit(1);
  });
};

export default main;