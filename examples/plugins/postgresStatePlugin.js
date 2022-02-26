
import pg from 'pg';
import _ from 'lodash';

// In a real project this would be:
// import { PluginInterface } from 'forge';
import {PluginInterface} from '../../index.js';

/*
  pg uses env vars for connection details like so
  PGUSER=dbuser
  PGHOST=database.server.com
  PGPASSWORD=secretpassword
  PGDATABASE=mydb
  PGPORT=3211
  https://node-postgres.com/features/connecting

  defaults to local postgres instance
 */
const pool = new pg.Pool();

/**
 * This plugin uses the node-postgres (pg) library and postgres as a backend. To use it, you must have
 * a postgres instance running and pass any connection info via the environment variables listed above
 */
export default class PostgresStatePlugin extends PluginInterface {
  constructor( config ) {
    super( config );
    this.schema = config.schema;
    this.fQTable = `${config.schema}.${config.migrationTable}`;
    this.db = pool;
  }

  /**
   * Creates DDL body of the column names and their data types for table creation
   *
   * @param {Object[]} columnDefinitions - column definitions passed to createTable
   * @returns {string} - DDL body for columns for table creation
   */
  #createColumnDefinitions( columnDefinitions ) {
    return  _.map( columnDefinitions, ({name, datatype}) => `${name} ${datatype}` ).join( ',\n' );
  }

  /**
   * Creates a separate list of columns and values in the same order
   *
   * @param {Object} columnValues - A hash of columns to values
   * @returns {{columns: *[], values: *[]}} - Separated columns and values in corresponding order
   */
  #createColumnValues( columnValues ) {
    return _.reduce( columnValues, ( result, value, field ) => {
      result.columns.push( field );
      result.values.push( value );
      return result;
    }, {columns: [], values:[]});
  }

  /**
   * @inheritDoc
   */
  createSchema( schema ) {
    const query = `CREATE SCHEMA IF NOT EXISTS ${schema};`;
    return this.db.query( query );
  }

  /**
   * @inheritDoc
   */
  createTable( tableName, columnDefinitions ) {
    const columnDefinitionSQL = this.#createColumnDefinitions( columnDefinitions );

    const query = `CREATE TABLE IF NOT EXISTS ${this.fQTable} (${columnDefinitionSQL});`;
    return this.db.query( query );
  }

  /**
   * @inheritDoc
   */
  insert( columnValues ) {
    const {columns, values} = this.#createColumnValues( columnValues );
    const query = `INSERT INTO ${this.fQTable} (${columns.join( ', ' )}) VALUES (${values.map(( v )=>`'${v}'` ).join( ', ' )});`;
    return this.db.query( query );
  }

  /**
   * @inheritDoc
   */
  remove( columnValues ) {
    const query = `DELETE FROM ${this.fQTable} where version = $(version) `;
    return this.db.query( query, columnValues );
  }

  /**
   * @inheritDoc
   */
  getMigrationState() {
    return this.db.query( `select * from ${this.fQTable}` ).then(( results )=>{
      return results.rows;
    });
  }
}
