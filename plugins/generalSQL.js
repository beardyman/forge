
import _ from 'lodash';
import PluginInterface from './pluginInterface.js';

/**
 * This Plugin uses Postgres flavored SQL syntax, however it will likely work for other
 *
 * @abstract
 */
class GeneralSQL extends PluginInterface {
  constructor(config){
    super(config);

    this.schema = config.schema;
    this.fQTable = `${config.schema}.${config.migrationTable}`;
    this.db = { query: () => {
      throw new Error('Forge Plugin Error - `this.db` must have a query function');
    }};
  }

  /**
   * Creates DDL body of the column names and their data types for table creation
   *
   * @param {Object[]} columnDefinitions - column definitions passed to createTable
   * @returns {string} - DDL body for columns for table creation
   */
  #createColumnDefinitions(columnDefinitions) {
    return  _.map(columnDefinitions, (type, field)=>{
      return `${field} ${type}`;
    }).join(',\n');
  }

  /**
   * Creates a separate list of columns and values in the same order
   *
   * @param {Object} columnValues - A hash of columns to values
   * @returns {{columns: *[], values: *[]}} - Separated columns and values in corresponding order
   */
  #createColumnValues(columnValues) {
    return _.reduce(columnValues, (result, value, field) => {
      result.columns.push(field);
      result.values.push(value);
      return result;
    }, {columns: [], values:[]});
  }

  /**
   * @inheritDoc
   */
  createSchema(schema) {
    const query = `CREATE SCHEMA IF NOT EXISTS ${schema};`;
    return this.db.query(query);
  }

  /**
   * @inheritDoc
   */
  createTable(tableName, columnDefinitions) {
    const columnDefinitionSQL = this.#createColumnDefinitions(columnDefinitions);

    const query = `CREATE TABLE IF NOT EXISTS ${this.fQTable} (${columnDefinitionSQL});`;
    return this.db.query(query);
  }

  /**
   * @inheritDoc
   */
  insert(columnValues) {
    const {columns, values} = this.#createColumnValues(columnValues);
    const query = `INSERT INTO ${this.fQTable} (${columns.join(', ')}) VALUES (${values.map((v)=>`'${v}'`).join(', ')});`;
    return this.db.query(query);
  }

  /**
   * @inheritDoc
   */
  remove(columnValues) {
    const query = `DELETE FROM ${this.fQTable} where version = '${columnValues.version}' `;
    return this.db.query(query);
  }

  /**
   * @inheritDoc
   */
  getMigrationState() {
    return this.db.query(`select * from ${this.fQTable}`);
  }
}
export default GeneralSQL;
