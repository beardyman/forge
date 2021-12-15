
import _ from 'lodash';
import { findUp } from 'find-up';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);


const packageFile = await findUp('package.json');
const pack = require(packageFile);

const config = _.defaults(pack.forgeDB, {
  logLevel: 'info',
  migrationsDirectory: 'db-migrations',
  migrationTable: 'forge_migrations',
  schema: 'public'
});

export default config;