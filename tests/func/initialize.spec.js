import './bootstrap.js';
import {cliParamBuilder} from './utils.js';
import {mocks, resetMocks} from '../mocks/MockMigrationStatePlugin.js';
import * as mockMigrations from '../mocks/migrations/index.js';

import cli from '../../cli.js';

describe('Initialization', function() {

  beforeEach(function() {
    resetMocks(); // resets the plugin mocks
    mockMigrations.resetAll();
  });

  it('should create a table and insert existing migrations', async function() {
    await cli(cliParamBuilder({command: 'initialize'}));
    expect(mocks.createSchema.callCount).to.equal(1);
    expect(mocks.createTable.callCount).to.equal(1);

    // actual migrations should not run
    expect(mockMigrations.mocks.a.migrate.callCount).to.equal(0);
    expect(mockMigrations.mocks.b.migrate.callCount).to.equal(0);
    expect(mockMigrations.mocks.c.migrate.callCount).to.equal(0);

    // we should insert the migration files though
    expect(mocks.insert.callCount).to.equal(3);
  });
});
