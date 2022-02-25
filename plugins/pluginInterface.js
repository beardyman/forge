/**
 * @description Defines the required functions for managing the forge state table.
 * @interface
 */
class PluginInterface {

  /**
   * @description A refined config from the "forge" stanza in `package.json` will be passed to the constructor.  In the case of
   * a basic config, the entire config will be passed; in the case of a named migration, the named config will be
   * merged with basic properties (like "logLevel") and passed.  Any defaults set by forge will also be passed in
   * this config.
   * @param config {Object}
   */
  constructor(config) {
    this.config = config;
  }

  /**
   * Creates the space to make the state table.  In a database this is generally called a schema.
   * This function should do anything needed to later create a table.
   *
   * @param schema {string} - The name of the schema from the config.
   * @returns {Promise<undefined>} - Resolves when complete
   */
  createSchema(schema) {
    throw new Error(`'createSchema' must be defined by the forge plugin. Schema '${schema}' will be passed to it.`);
  }

  /**
   * @description Creates the state table using the columnDefinitions.
   * @param tableName {string} - The table name from forge's config.
   * @param columnDefinitions {Object[]} - A list of column definitions with name and datatype values
   * @param columnDefinitions[].name - The name of a column
   * @param columnDefinitions[].datatype - The datatype of the column
   * @returns {Promise<undefined>} - Resolves when complete
   */
  createTable(tableName, columnDefinitions) {
    throw new Error(`'createTable' must be defined by the forge plugin. A hash with the keys ${Object.keys(tableColumnMap).join(', ')
    } will be passed to it`);
  }

  /**
   * @description Adds to the state for single migration that is run.  In a database, this would generally be inserting a row into a table.
   * @param columnValues {Object} - Mapping of column names to values
   * @returns {Promise<undefined>} - Resolves when complete
   */
  insert(columnValues) {
    throw new Error(`'insert' must be defined by the forge plugin. A hash of column names to values (keys:${Object.keys(columnValueMap).join(', ')
    }; values:${Object.values(columnValueMap).join(', ')}) will be passed ot it.`);
  }

  /**
   * Removes from the state for a single rollback that is run.  In a database, this would generally be a delete statement for a single row.
   *
   * @param columnValues {Object} - The column values for the migration to be removed.
   * @returns {Promise<undefined>} - Resolves when complete
   */
  remove(columnValues) {
    throw new Error(`'remove' must be defined by the forge plugin. The version ${version} will be passed to it.`);
  }

  /**
   * Gets the current state of migrations as a collection. All previously run migrations should be returned.
   *
   * @param columns {string[]} - The property names that forge expects to be in the objects of the collection.
   *        This corresponds to the table columns that were passed in `createTable` and `insert`.
   * @returns {Promise<object[]>} - The entire current state as an array of objects matching the column names as object properties
   */
  getMigrationState(columns) {
    throw new Error('`getMigrationState` must be defined by the forge plugin.');
  }
}

export default PluginInterface;
