
import chalk from 'chalk';
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
  initialize: async (argv) => {
    // attempt to initialize the forge table
    await initializeMigrationTable();
  },

  migrate: async (argv) => {
    const version = argv._[1];

    // todo: handle a non-idempotent 'create' case
    // attempt to initialize the forge table
    await initializeMigrationTable();

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

  rollback: async (argv) => {
    // todo: handle a non-initialized case

    const version = argv._[1];

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

  if(!_.keys(supportedCommands).includes(command)) {
    console.log(chalk.red(`Command ${command} is unrecognized.`));
    console.log(chalk.blueBright(`Acceptable commands are: `));
    console.log(chalk.blueBright(`\t\t migrate `));
    console.log(chalk.blueBright(`\t\t rollback`));
    console.log(`See README.md for more info or run 'man forge'`);
    process.exit(1);
  }

  // validate plugin file

  await loadPluginFile();

  supportedCommands[command](argv).then((results) => {
    log.info(`${_.upperFirst(command)} command completed successfully.`);
    process.exit(0);
  }).catch((error, err) => {
    log.error({error: error.toString()}, 'There has been an issue during the migration');
    process.exit(1);
  });
}

export default main;