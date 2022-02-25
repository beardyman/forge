/**
 * @description Defines the required functions for managing the forge state table.
 * @interface
 */
class PluginInterface {

  /**
   * typedef {
   *   "logLevel":
   * }
   * Config
   */

  /**
   * A refined config from the "forge" stanza in `package.json` will be passed to the constructor.  In the case of
   * a basic config, the entire config will be passed; in the case of a named migration, the named config will be
   * merged with basic properties (like "logLevel") and passed.  Any defaults set by forge will also be passed in
   * this config.
   *
   * @param config {Config}
   */
  constructor(config) {
    this.config = config;
  }

  createSchema(schema) {
    throw new Error(`'createSchema' must be defined by the forge plugin. Schema '${schema}' will be passed to it.`);
  }

  createTable(tableName, tableColumnMap) {
    throw new Error(`'createTable' must be defined by the forge plugin. A hash with the keys ${Object.keys(tableColumnMap).join(', ')
    } will be passed to it`);
  }

  insert(columnValueMap) {
    throw new Error(`'insert' must be defined by the forge plugin. A hash of column names to values (keys:${Object.keys(columnValueMap).join(', ')
    }; values:${Object.values(columnValueMap).join(', ')}) will be passed ot it.`);
  }

  remove(version) {
    throw new Error(`'remove' must be defined by the forge plugin. The version ${version} will be passed to it.`);
  }

  getMigrationState() {
    throw new Error('`getMigrationState` must be defined by the forge plugin.');
  }
}

export default PluginInterface;
