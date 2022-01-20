
import _ from 'lodash';
import log from './lib/logger.js';
import { loadPluginFile } from "./lib/model/plugin.js";
import { loadConfig } from "./lib/config.js";
import supportedCommands from './lib/commands.js';


const main = async (argv) => {
  const command = argv._[0];
  const name = argv._[1]; // optional name
  let version = argv.version; // optional version

  // validate commands
  if(!_.keys(supportedCommands).includes(command)) {
    log.error({supportedCommands}, `command '${command}' is unrecognized.`);
    process.exit(1);
  }

  // load and validate config
  await loadConfig(name);


  await loadPluginFile();
  // todo: validate plugin file

  await supportedCommands[command]({version}).then(() => {
    log.info(`${_.upperFirst(command)} command completed successfully.`);
    process.exit(0);
  }).catch((error) => {
    log.error({error: error.toString()}, 'There has been an issue during the migration');
    process.exit(1);
  });
};

export default main;
