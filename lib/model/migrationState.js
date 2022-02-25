

import getPlugin from './plugin.js';
import { log } from '../logger.js';
import { config } from '../config.js';

const model = {};

const columns = [
  'version',
  'name',
  'filename'
];

model.initialize = async () => {
  log.debug(`Initializing Forge for ${config.schema}`);

  await getPlugin().createSchema(config.schema);

  const columnMap = columns.reduce((map, column)=>{
    map[column] = 'text';
    return map;
  }, {});

  // setup migration table if it's not setup
  return getPlugin().createTable(config.migrationTable, columnMap);
};

model.recordMigration = (migration) => {
  return getPlugin().insert(migration);
};

model.removeMigration = (migration) => {
  return getPlugin().remove(migration);
};

model.getCurrentState = () => {
  return getPlugin().getMigrationState(columns);
};

export default model;
