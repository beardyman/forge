
import _ from 'lodash';
import { log, initializeLogger } from './lib/logger.js';
import { loadPluginFile } from './lib/model/plugin.js';
import { loadConfig } from './lib/config.js';
import supportedCommands, { validateCommands } from './controllers/commands.js';

const main = async( argv ) => {
  const command = argv._[0];
  const name = argv._[1]; // optional name
  let version = argv.version; // optional version

  // load and validate config
  await loadConfig( name );

  // need to initialize logger after loading config since it relies on config for logLevel
  initializeLogger();

  // validate command
  validateCommands( command );

  await loadPluginFile();
  // todo: validate plugin file

  // route to the correct command code
  await supportedCommands[command]({version}).then(() => {
    log.info( `${_.upperFirst( command )} command completed successfully.` );
  }).catch(( error ) => {
    log.error({error: error.toString()}, 'There has been an issue during the migration' );
  });
};

export default main;
