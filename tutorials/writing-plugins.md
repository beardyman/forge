# Writing Plugins for Managing Migration State

Forge requires a plugin to manage its own state to know which files have been run. Migration State Plugins create an interface for `forge` to be able 
to create and manage tables for managing its own state.

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
    * Returns all records from the state table.  Expected format is an array of objects:
  ```json 
  [{ "version": "1", "name": "a migration", "filename": "v1_a_migration.js"}]
  ```

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
