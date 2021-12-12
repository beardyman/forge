
const _ = require('lodash');
const Plugin = require('../plugin');

class GeneralSQL extends Plugin {

  contructor(){
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

  createTable(tableColumnMap) {
    const columnDefinitions = this.#createColumnDefinitions(tableColumnMap);

    return this.db.query(`CREATE TABLE IF NOT EXISTS (${columnDefinitions});'`)
  }

  insert(columnValueMap) {
    const {columns, values} = this.#createColumnValues(columnValueMap);

    return this.db.query('INSERT INTO ')
  }

  remove(id) {

  }

  getMigrationState() {
    return this.db.query(`select * from ${this.migrationTable}`)
  }

}