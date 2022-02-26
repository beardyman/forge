import './bootstrap.js';
import {cliParamBuilder} from './utils.js';
import {mocks, resetMocks} from '../mocks/MockMigrationStatePlugin.js';
import * as mockMigrations from '../mocks/migrations/index.js';

import cli from '../../cli.js';

describe( 'Rollback', function() {
  beforeEach( function() {
    resetMocks(); // resets the plugin mocks
    mockMigrations.resetAll();
    mocks.getMigrationState.resolves([
      {version: '1', name: 'a', filename: 'v1_a.js'},
      {version: '2', name: 'b', filename: 'v2_b.js'},
      {version: '3', name: 'c', filename: 'v3_c.js'}
    ]);
  });

  it( 'should run the most recent rollback', async function() {
    await cli( cliParamBuilder({command: 'rollback'}));
    expect( mocks.createSchema.callCount, 'schema' ).to.equal( 0 );
    expect( mocks.createTable.callCount, 'table' ).to.equal( 0 );
    expect( mockMigrations.mocks.a.rollback.callCount, 'a' ).to.equal( 0 );
    expect( mockMigrations.mocks.b.rollback.callCount, 'b' ).to.equal( 0 );
    expect( mockMigrations.mocks.c.rollback.callCount, 'c' ).to.equal( 1 );
    expect( mocks.remove.callCount, 'remove' ).to.equal( 1 );
  });

  it( 'should rollback to a version', async function() {
    await cli( cliParamBuilder({command: 'rollback', version: 1}));
    expect( mockMigrations.mocks.a.rollback.callCount, 'a' ).to.equal( 0 );
    expect( mockMigrations.mocks.b.rollback.callCount, 'b' ).to.equal( 1 );
    expect( mockMigrations.mocks.c.rollback.callCount, 'c' ).to.equal( 1 );
    expect( mocks.remove.callCount, 'remove' ).to.equal( 2 );
  });

  it( 'should rollback to a version even if not on the current version', async function() {
    mocks.getMigrationState.resolves([
      {version: '1', name: 'a', filename: 'v1_a.js'},
      {version: '2', name: 'b', filename: 'v2_b.js'}
    ]);

    await cli( cliParamBuilder({command: 'rollback', version: 1}));
    expect( mockMigrations.mocks.a.rollback.callCount, 'a' ).to.equal( 0 );
    expect( mockMigrations.mocks.b.rollback.callCount, 'b' ).to.equal( 1 );
    expect( mockMigrations.mocks.c.rollback.callCount, 'c' ).to.equal( 0 );
    expect( mocks.remove.callCount, 'remove' ).to.equal( 1 );
  });
});
