/**
 * @class
 * @description defines the required defined functions for managing the forge state table.
 */
class PluginInterface {
  constructor(config) {
    this.config = config;
  }

  createSchema(schema) {
    throw new Error(`'createSchema' must be defined by the forge plugin. Schema '${schema}' will be passed to it.`);
  }

  createTable(tableColumnMap) {
    throw new Error(`'createTable' must be defined by the forge plugin. A hash with the keys ${Object.keys(tableColumnMap).join(', ')
    } will be passed to it`);
  }

  insert(columnValueMap) {
    throw new Error(`'insert' must be defined by the forge plugin. A hash of column names to values (keys:${Object.keys(columnValueMap).join(', ')
    }; values:${Object.values(columnValueMap).join(', ')}) will be passed ot it.`);
  }

  getMigrationState() {
    throw new Error('`getMigrationState` must be defined by the forge plugin.');
  }

  remove(version) {
    throw new Error(`'remove' must be defined by the forge plugin. The version ${version} will be passed to it.`);
  }
}

export default PluginInterface;
