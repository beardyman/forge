
const config = require('../package.json');

const plugin = require(config.forge.pluginFile)

const initialize = () => {
  // setup migration table if it's not setup
  const columnMap = {
    'id': 'integer',
    'version': 'integer',
    'migration_file': 'text'
  }
}

const migrate = () => {}

const rollback = () => {}