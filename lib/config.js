
/*
Supported formats:

non-named config:
{
  forge: {
    "migrationStatePlugin": "./schema/postgres.js",
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
      "migrationStatePlugin": "./schema/postgres.js",
      "migrationsDirectory": "./schema",
      "schema": "test_migrations"
    },
    "infra": {
      "migrationStatePlugin": "./infra/aws.js",
      "migrationsDirectory": "./infra",
      "schema": "infra_migrations"
    }
  }
}
 */

import _ from 'lodash';
import { findUp } from 'find-up';

// create a require function (from CommonJS) to easily import package.json file
import { createRequire } from 'module';
const require = createRequire( import.meta.url );

const requiredConfigurationOptions = [ 'migrationStatePlugin' ];

const configDefaults = {
  logLevel: 'info',
  migrationsDirectory: 'migrations',
  migrationTable: 'forge_migrations',
  schema: 'public'
};

export let config;


function validateConfig( config, name ) {
  // validate required configuration options
  const configErrors = [];
  _.forEach( requiredConfigurationOptions, ( requiredProperty )=>{
    if ( !_.has( config, requiredProperty )) {
      configErrors.push( requiredProperty );
    }
  });

  if ( !_.isEmpty( configErrors )) {
    const error = new Error( `Forge configuration is missing required properties${
      name ? ` for the "${name}" migration configuration`: ''} (${configErrors.join( ', ' )})` );
    error.requiredProperties = configErrors;
    throw error;
  }
}

/**
 * Loads config from package.json file. Verifies config before returning it.
 *
 * @param [name] - optional named config, the key within forge config in package.json
 * @returns {Promise<Object>} - runtime configuration
 */
export async function loadConfig( name ) {
  const packageFile = await findUp( 'package.json' );
  const pack = require( packageFile );

  // get forge config from package.json file
  let forgeConfig = _.get( pack, 'forge' );
  const namedConfig = _.get( forgeConfig, name );

  if ( name && !namedConfig ) {
    throw new Error( `Cannot find configuration named "${name}" in forge configuration.` );
  } else if ( namedConfig ) {
    // pull log level out of the base config and combine it with the named config
    forgeConfig = { logLevel: forgeConfig.logLevel, ...namedConfig };
  }

  config = _.defaults( forgeConfig, configDefaults );

  validateConfig( config, name );

  return config;
}
