# Creating migrations
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
