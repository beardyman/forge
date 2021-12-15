
import Sql from './generalSQL.js';
import pgp from 'pg-promise';
const pg = pgp();

export default class Postgres extends Sql {
  constructor(config) {
    super(config);

    this.db = pg({database: 'postgres'});
  }
}

