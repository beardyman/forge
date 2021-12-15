
import _ from 'lodash';
import Plugin from '../lib/plugin.js';

class GeneralSQL extends Plugin {

  constructor(config){
    super(config);

    this.schema = config.schema;
    this.forgeMigrationTable = config.migrationTable;
    this.db = { query: ()=>{
      throw new Error('Forge Plugin Error - `this.db` must have a query function');
    }};
  }

  #createColumnDefinitions(tableColumnMap) {
    return  _.map(tableColumnMap, (type, field)=>{
      return `${field} ${type}`
    }).join(',\n');
  }

  #createColumnValues(columnValueMap) {
    return _.reduce(columnValueMap, (result, value, field) => {
      result.columns.push(field);
      result.values.push(value);
      return result;
    }, {columns: [], values:[]});
  }

  createSchema(schema) {
    const query = `CREATE SCHEMA IF NOT EXISTS ${schema};`;
    return this.db.query(query);
  }

  createTable(tableColumnMap) {
    const columnDefinitions = this.#createColumnDefinitions(tableColumnMap);

    const query = `CREATE TABLE IF NOT EXISTS ${this.schema}.${this.forgeMigrationTable} (${columnDefinitions});`;
    return this.db.query(query);
  }

  insert(columnValueMap) {
    const {columns, values} = this.#createColumnValues(columnValueMap);
    const query = `INSERT INTO ${this.schema}.${this.forgeMigrationTable} (${columns.join(', ')}) VALUES (${values.map((v)=>`'${v}'`).join(', ')});`
    return this.db.query(query);
  }

  remove(columnValueMap) {
    const query = `DELETE FROM ${this.schema}.${this.forgeMigrationTable} where version = '${columnValueMap.version}' `;
    return this.db.query(query);
  }

  getMigrationState() {
    return this.db.query(`select * from ${this.schema}.${this.forgeMigrationTable}`);
  }
}
export default GeneralSQL;