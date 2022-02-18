
// in a real project this would be:
// import { PluginInterface } from 'forge';
import { PluginInterface } from '../../index.js';

import fs from 'fs/promises';
import { EOL } from 'os';

/**
 * Helper for omitting unwanted values
 *
 * A value or a function returning an expression can be passed.
 *
 * @param array
 * @param value
 * @returns {*}
 */
function without(array, value) {
  return array.reduce((items, item) => {
    if ((value instanceof Function) && !value(item)){
      items.push(item);
    }
    else if (!(value instanceof Function) && item !== value) {
      items.push(item);
    }
    return items;
  }, []);
}

/**
 * This plugin uses a file to keep track of the state of the application
 *
 * It will create a directory called state and keep track which migrations have been run via files within that directory
 */
export default class FileStatePlugin extends PluginInterface {
  columnSeparator = '\t';

  /**
   * helper
   *
   * @returns {string}
   */
  getFileName() {
    this.stateDirectory = this.config.schema;
    return `${this.stateDirectory}/${this.config.migrationTable}`;
  }

  /**
   * Gets the contents of the file with each line as an array.
   *
   * @returns {Promise<string[]>}
   */
  async getFileLines() {
    const fileHandle = await this.getFileForAppending();
    const fileContents = await fileHandle.readFile({ encoding: 'utf8' });
    return fileContents.split(EOL);
  }

  /**
   * Creates a filehandle for reading and appending to the file
   * @returns {Promise<FileHandle>}
   */
  async getFileForAppending() {
    return await fs.open(this.getFileName(), 'a+');
  }

  /**
   * Creates a directory for storing the state file.
   * @param schema
   * @returns {Promise<string | undefined>}
   */
  createSchema(schema) {
    this.stateDirectory = `./${schema}`;
    return fs.mkdir(this.stateDirectory, { recursive: true }); //use recursive so it works idempotently
  }

  /**
   * Creates a file using the `tableName` for the name of the file
   *
   * @param tableName
   * @param tableColumnMap
   * @returns {Promise<void>}
   */
  async createTable(tableName, tableColumnMap) {
    this.tableColumnOrder = Object.keys(tableColumnMap).sort();
    await this.getFileForAppending(); // creates the file if it doesn't exist
  }

  /**
   * Adds a new line for a run migration
   *
   * @param columnValueMap
   * @returns {Promise<void>}
   */
  async insert(columnValueMap) {
    // get the values in sort order
    const row = this.tableColumnOrder.reduce((row, column)=>{
      row.push(columnValueMap[column]);
      return row;
    }, []);
    const fileHandle = await this.getFileForAppending();
    await fileHandle.appendFile(`${row.join(this.columnSeparator)}${EOL}`);
  }

  /**
   * Rewrites the file after removing the last line
   *
   * @param version
   * @returns {Promise<void>}
   */
  async remove({version}) {
    let lines = await this.getFileLines();
    lines = without(lines, ''); // omit any empty lines
    lines = without(lines, (item) => item.split(this.columnSeparator)[2] === version);

    const writerFileHandle = await fs.open(this.getFileName(), 'w'); // this will truncate the file;
    await writerFileHandle.write(`${lines.join(EOL)}${EOL}`); // we expect a new line at the end of the file
  }

  /**
   * Returns the file as JSON
   *
   * @param columns
   * @returns {Promise<*>}
   */
  async getMigrationState(columns) {
    const lines = await this.getFileLines();

    // using `reduce` / `if` instead of `map` to avoid any empty lines
    return lines.reduce((states, line) => {
      if (line.length > 0) {
        // turn the values from each line into an object
        const lineParts = line.split(this.columnSeparator);
        states.push(columns.sort().reduce((row, column, index) => {
          row[column] = lineParts[index];
          return row;
        }, {}));
      }
      return states;
    }, []);
  }
}
