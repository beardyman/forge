

import getPlugin from './plugin.js';
import { log } from '../logger.js';
import { config } from '../config.js';

const model = {};

const columns = [
  { name: 'version', datatype: 'text' },
  { name: 'name', datatype: 'text' },
  { name: 'filename', datatype: 'text' },
  { name: 'rundate', datatype: 'timestamp' }
];

model.initialize = async() => {
  log.debug( `Initializing Forge for ${config.schema}` );

  await getPlugin().createSchema( config.schema );

  // setup migration table if it's not setup
  return getPlugin().createTable( config.migrationTable, columns );
};

model.recordMigration = ( migration ) => {
  migration.rundate = ( new Date ).toISOString();
  return getPlugin().insert( migration );
};

model.removeMigration = ( migration ) => {
  return getPlugin().remove( migration );
};

model.getCurrentState = () => {
  return getPlugin().getMigrationState( columns );
};

export default model;
