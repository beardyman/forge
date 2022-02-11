

import getPlugin from './plugin.js';
import { log } from '../logger.js';
import { config } from '../config.js';

const model = {};

model.initialize = async () => {
  log.debug(`Initializing Forge for ${config.schema}`);

  await getPlugin().createSchema(config.schema);

  // setup migration table if it's not setup
  const columnMap = {
    version: 'text',
    name: 'text',
    filename: 'text'
  };

  return getPlugin().createTable(config.migrationTable, columnMap);
};

model.recordMigration = (migration) => {
  return getPlugin().insert(migration);
};

model.removeMigration = (migration) => {
  return getPlugin().remove(migration);
};

model.getCurrentState = () => {
  return getPlugin().getMigrationState();
};

export default model;
