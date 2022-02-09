import './bootstrap.js';
import {cliParamBuilder} from './utils.js';
import {mocks, resetMocks} from '../mocks/MockMigrationStatePlugin.js';
import * as mockMigrations from '../mocks/migrations/index.js';

import cli from '../../cli.js';

describe('Migrate', function() {
  beforeEach(function() {
    resetMocks(); // resets the plugin mocks
    mockMigrations.resetAll();
  });

  it('should create a table, run, and insert the current migraitons', async function() {
    await cli(cliParamBuilder({command: 'migrate'}));
    expect(mocks.createSchema.callCount).to.equal(1);
    expect(mocks.createTable.callCount).to.equal(1);
    expect(mockMigrations.mocks.a.migrate.callCount).to.equal(1);
    expect(mockMigrations.mocks.b.migrate.callCount).to.equal(1);
    expect(mockMigrations.mocks.c.migrate.callCount).to.equal(1);
    expect(mocks.insert.callCount).to.equal(3);
  });

  it('should migrate to a version', async function() {
    await cli(cliParamBuilder({command: 'migrate', version: 2}));
    expect(mocks.createSchema.callCount).to.equal(1);
    expect(mocks.createTable.callCount).to.equal(1);
    expect(mockMigrations.mocks.a.migrate.callCount).to.equal(1);
    expect(mockMigrations.mocks.b.migrate.callCount).to.equal(1);
    expect(mockMigrations.mocks.c.migrate.callCount).to.equal(0);
    expect(mocks.insert.callCount).to.equal(2);
  });

  it('should only run new migrations', async function() {
    mocks.getMigrationState.resolves([{version: '1', name: 'a', filename: 'v1_a.js'}]);

    await cli(cliParamBuilder({command: 'migrate'}));
    expect(mocks.createSchema.callCount, 'schema').to.equal(1);
    expect(mocks.createTable.callCount, 'table').to.equal(1);
    expect(mockMigrations.mocks.a.migrate.callCount, 'a').to.equal(0);
    expect(mockMigrations.mocks.b.migrate.callCount, 'b').to.equal(1);
    expect(mockMigrations.mocks.c.migrate.callCount, 'c').to.equal(1);
    expect(mocks.insert.callCount, 'insert').to.equal(2);
  });

  it('should only run new migrations up to a version', async function() {
    mocks.getMigrationState.resolves([{version: '1', name: 'a', filename: 'v1_a.js'}]);

    await cli(cliParamBuilder({command: 'migrate', version: 2}));
    expect(mocks.createSchema.callCount, 'schema').to.equal(1);
    expect(mocks.createTable.callCount, 'table').to.equal(1);
    expect(mockMigrations.mocks.a.migrate.callCount, 'a').to.equal(0);
    expect(mockMigrations.mocks.b.migrate.callCount, 'b').to.equal(1);
    expect(mockMigrations.mocks.c.migrate.callCount, 'c').to.equal(0);
    expect(mocks.insert.callCount, 'insert').to.equal(1);
  });
});
