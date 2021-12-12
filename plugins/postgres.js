
const Sql = require('./generalSQL');
const pgp = require('pg-promise')();
const pg = pgp();


class Postgres extends Sql {
  constructor() {
    super();

    this.db = pg;
  }

  createTable(tablecolumnMap) {

  }

  insert(columnValueMap) {

  }

  remove(id) {

  }

  getMigrationState() {
    return this.db.query(`select * from ${this.migrationTable}`)
  }

}