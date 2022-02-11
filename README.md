# Forge
A utility for deploying migrations for changing system state. 
---

![Unit Tests](https://github.com/beardyman/forge/actions/workflows/unit-tests/badge.svg)
![Functional Tests](https://github.com/beardyman/forge/actions/workflows/func-tests/badge.svg)


Migrations are generally database schema alterations or static data updates but can be anything that 
is able to be executed via javascript. The common use case (and the reason this lib was written) is for database
schema migrations, however at its core this library just keeps track of state for files that are run, so it can be 
used to migrate the state of anything. File state, database state, infrastructure state; it all depends on the 
migrations that you create.

## Getting Started
1. Create a plugin
2. Create migrations
3. Configure `forge` to point to that plugin and migrations
4. Run `forge migrate`

## Why?
So many alternative migration tools (flyway, knex.js) are written with specific database support and they 
are generally bloated supporting many features that many teams don't need. For teams that use multiple 
database systems it's sometimes hard to find a single migration tool that supports all of their databases which
leads to using multiple, generally very different, tools.

I wanted to create a tool where users could easily write their own plugin for state management without much effort, 
allowing them to setup database connections how they see fit. The user can easily write the logic to create 
schemas, tables and inserting state data for this tool so it can easily support any database or system that the user
wants to use.  Technically, a user could use a file or store the state in s3 if they wanted to.

### Why are schema migrations important?
"Ok, cool, but why would I want to use this tool?".  I hear it, I get what you're saying. If it just runs js files that
run SQL (or whatever), why can't I do that manually?  Short story is, you can. However, the point of this tool is 
to make it easy to manage state across multiple environments for repeatable deployments. This makes it easy to 
deploy your schema with your code.  You can run `forge` with your deployment to deploy database changes alongside code.
This allows you to easily rollout or rollback database changes to match the state of your deployed code.

## How do I use it?
### Setup a Migration State Plugin
This is easier than it sounds. Forge requires a plugin to manage its own state to know which files have been run.
This creates an interface for `forge` to be able to create and manage tables for managing its own state.

#### Migration State Plugin requirements
Forge was written using ESM and requires that its plugins do as well. The plugin must export a class by default and 
must implement the following 5 methods:
* `createSchema(schema)`
  * Creates the schema where the state table resides.  Should be able to be ran repeatedly.
  * `schema` is a string with the name of the schema.  This is comes from the config (see below).
* `createTable(tableName, tableColumnMap)`
  * Creates a table to store the state.
  * `tableName` is a string with the name of the table from the config.
  * `tableColumnMap` is an object mapping column names to data types.  All types passed are of type 'text', this may need to 
    be translated to an acceptable type for your system.
* `insert(columnValueMap)`
  * Inserts a record into the state table during a migration. 
  * `columnValueMap` is a mapping of column names to values to be inserted.
* `remove(version)`
  * Removes a record from the state table during a rollback.
  * `version` is the version be removed.
* `getMigrationState()`
  * Returns all records from the state table.  Expected format is an array of objects: ```json [{ "version": "1", "name": "a migration", "filename": "v1_a_migration.js"}]```

An interface can be extended if `forge` is imported into the plugin file.  This will ensure appropriate methods are implemented.
```js
import PluginInterface from 'forge';

export default class MyStatePlugin extends PluginInterface {
  //...
}
```

If using a SQL backend, there is also a General SQL interface that includes all of the necessary functions implemented.  It uses PosgreSQL syntax but 
should work for most SQL databases.  It requires that a constructor be made assigning a database interface to `this.db`.  The database interface must 
have a function named `query`. An example of its implementation creating a connection to a local postgres instance:
```js
import { GeneralSQLInterface } from 'forge';

import pgp from 'pg-promise';
const pgDb = pgp();
export const pg = pgDb({database: 'postgres'});

export default class Postgres extends Sql {
  constructor(config) {
    super(config);
    this.db = pg; // pg.query will execute queries
  }
}
```

### Create migrations
Migrations must all be placed in a the `migrationsDirectory` from configuration. It must follow the format: `v<version>_<name>.js`
For example, the following will result in a migration with `version: 1` and `name: my migration file`:
```
v1_my_migration_file.js
```
The version can be any string or number as long as it fits in sort order.

A migration must export two methods: `migrate` and `rollback`.  The full forge config will be passed to each method.  Each method must return a promise.  
An example migration:
```js
import {pg} from './postgres.js'; // wrapper around pg-promise

export const migrate = (config) => {
  const query = `
  CREATE TABLE IF NOT EXISTS mySchema.accounts (
    id                int primary key,
    account_settings  jsonb
  );`;
  return pg.query(query);
};

export const rollback = (config) => {
  const query = `
  DROP TABLE IF EXISTS mySchema.accounts;
  `;
  return pg.query(query);
};
```

### Configuration
Forge's configuration should be set in the project's `package.json` file under the property `"forge"`. The configuration can be in two different formats.
The default format can be used if there's only one set of migrations in the project.

The only **required** property of a configuration is `"migrationStatePluginFile"`.

```json
{
  "forge": {
    "migrationStatePluginFile": "./schema/postgres.js",
    "migrationsDirectory": "./schema",
    "schema": "test_migrations",
    "logLevel": "debug"
  }
}
```

The other configuration format is for named configurations.  This can be useful if your project requires two separate migrations.  Names are arbitrary 
and there are no limits to how many named migrations you can have.  
```json
{
  "forge": {
    "logLevel": "debug",
    "db": {
      "migrationStatePluginFile": "./schema/postgres.js",
      "migrationsDirectory": "./schema",
      "schema": "test_migrations"
    },
    "infra": {
      "migrationStatePluginFile": "./infra/aws.js",
      "migrationsDirectory": "./infra",
      "schema": "infra_migrations"
    }
  }
}
```

### Run migrate or rollback
```shell
# record existing migrations
forge initialize

# record existing migrations prior to and including a specific version
forge initialize --version <version>

# migrate to latest
forge migrate

# migrate using a named configuration
forge migrate <name>

# migrate to a specific version
forge migrate --version <version>

# rollback to the previous version
forge rollback

# rollback using a named configuration
forge rollback <name>

# rollback to a specific version (sets the state to the version specified)
forge rollback --version <version>
```
