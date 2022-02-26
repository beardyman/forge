
import { copyFile, mkdir } from 'fs/promises';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import './bootstrap.js';
import {cliParamBuilder} from './utils.js';
import * as fileMocks from '../mocks/MockMigrationStatePlugin.js';
import * as mockMigrations from '../mocks/migrations/index.js';


import cli from '../../cli.js';

describe( 'Initialization', function() {
  let moduleMocks;

  before( async function() {
    // create fake node module plugin mock
    const currentDirectory = dirname( fileURLToPath( import.meta.url ));
    const mockPluginPath = `${currentDirectory}/../../node_modules/mock-forge-plugin`;
    await mkdir( mockPluginPath, {recursive: true});
    await copyFile( `${currentDirectory}/../mocks/MockMigrationStatePlugin.js`, `${mockPluginPath}/index.js` );
    await copyFile( `${currentDirectory}/../../package.json`, `${mockPluginPath}/package.json` );
    moduleMocks = await import( 'mock-forge-plugin' );
  });

  beforeEach( function() {
    fileMocks.resetMocks(); // resets the plugin mocks
    mockMigrations.resetAll();
  });

  it( 'should create a table and insert existing migrations using a file plugin', async function() {
    await cli( cliParamBuilder({command: 'initialize'}));
    expect( fileMocks.mocks.createSchema.callCount ).to.equal( 1 );
    expect( fileMocks.mocks.createTable.callCount ).to.equal( 1 );
    expect( moduleMocks.mocks.createSchema.callCount ).to.equal( 0 );
    expect( moduleMocks.mocks.createTable.callCount ).to.equal( 0 );

    // actual migrations should not run
    expect( mockMigrations.mocks.a.migrate.callCount ).to.equal( 0 );
    expect( mockMigrations.mocks.b.migrate.callCount ).to.equal( 0 );
    expect( mockMigrations.mocks.c.migrate.callCount ).to.equal( 0 );

    // we should insert the migration files though
    expect( fileMocks.mocks.insert.callCount ).to.equal( 3 );
  });

  it( 'should create a table and insert existing migrations using a module plugin', async function() {
    await cli( cliParamBuilder({command: 'initialize', name: 'nodeModule'}));
    expect( fileMocks.mocks.createSchema.callCount ).to.equal( 0 );
    expect( fileMocks.mocks.createTable.callCount ).to.equal( 0 );
    expect( moduleMocks.mocks.createSchema.callCount ).to.equal( 1 );
    expect( moduleMocks.mocks.createTable.callCount ).to.equal( 1 );

    // actual migrations should not run
    expect( mockMigrations.mocks.a.migrate.callCount ).to.equal( 0 );
    expect( mockMigrations.mocks.b.migrate.callCount ).to.equal( 0 );
    expect( mockMigrations.mocks.c.migrate.callCount ).to.equal( 0 );

    // we should insert the migration files though
    expect( moduleMocks.mocks.insert.callCount ).to.equal( 3 );
  });
});
