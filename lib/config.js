
/*
Supported formats:

non-named config:
{
  forge: {
    "pluginFile": "./schema/postgres.js",
    "migrationsDirectory": "./schema",
    "schema": "test_migrations",
    "logLevel": "debug"
  }
}

named config:
{
  "forge": {
    "logLevel": "debug",
    "db": {
      "pluginFile": "./schema/postgres.js",
      "migrationsDirectory": "./schema",
      "schema": "test_migrations"
    },
    "infra": {
      "pluginFile": "./infra/aws.js",
      "migrationsDirectory": "./infra",
      "schema": "infra_migrations"
    }
  }
}
 */

import _ from 'lodash';
import { findUp } from 'find-up';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const requiredConfigurationOptions = ['pluginFile'];

let config;

export async function loadConfig(name) {
  const packageFile = await findUp('package.json');
  const pack = require(packageFile);

  // get forge
  let forgeConfig = _.get(pack, 'forge');
  const namedConfig = _.get(forgeConfig, name);

  if (name && !namedConfig) {
    throw new Error(`Cannot find configuration named ${name} in forge configuration.`);
  } else {
    // pull log level out of the base config and combine it with the named config
    forgeConfig = {logLevel: forgeConfig.logLevel, ...namedConfig};
  }

  config = _.defaults(forgeConfig, {
    logLevel: 'info',
    migrationsDirectory: 'migrations',
    migrationTable: 'forge_migrations',
    schema: 'public'
  });

  // validate required configuration options
  const configErrors = [];
  _.forEach(requiredConfigurationOptions, (requiredProperty)=>{
    if (!_.has(config, requiredProperty)) {
      configErrors.push(requiredProperty);
    }
  });

  if (!_.isEmpty(configErrors)) {
    const error = new Error(`Forge configuration is missing required properties${
      name ? ` for the ${name} migration configuration`: ''} (${configErrors.join(', ')})`);
    error.requiredProperties = configErrors;
    throw error;
  }

}

export default config;
