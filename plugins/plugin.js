


class Plugin {
  constructor(config) {
    this.config = config;
  }

  createSchema(schema) {
    throw new Error('`createSchema` must be defined by the forge plugin.');
  }

  createTable(tableColumnMap) {
    throw new Error('`createTable` must be defined by the forge plugin.');
  }

  insert(columnValueMap) {
    throw new Error('`insert` must be defined by the forge plugin.');
  }

  getMigrationState() {
    throw new Error('`getMigrationState` must be defined by the forge plugin.');
  }

  remove(version) {
    throw new Error('`remove` must be defined by the forge plugin.');
  }
}

export default Plugin;