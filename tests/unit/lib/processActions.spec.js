
import '../bootstrap.js';
import actionTypes from '../../../lib/actionTypes.js';

describe( 'Process Actions', function() {
  let lib, migrationState, migrations, action, log;


  beforeEach( async function() {
    action = sinon.stub();

    migrationState = {
      getCurrentState: sinon.stub().resolves(),
      recordMigration: sinon.stub().resolves(),
      removeMigration: sinon.stub().resolves()
    };

    migrations = {
      loadAction: sinon.stub().resolves( action ),
      getMigrationFiles: sinon.stub().resolves([{version: 1}, {version: 2}, {version: 3}]),
      parseFileName: sinon.spy(( file )=>file )
    };

    log = {debug: sinon.stub(), info: sinon.stub()};

    lib = await esmock( '../../../lib/processActions.js', {
      '../../../lib/config': {config: {logLevel: 'probablySomethingReasonable'}},
      '../../../lib/logger': {log},
      '../../../lib/model/migrationState': migrationState,
      '../../../lib/model/migrations': migrations
    });
  });


  describe( 'record migrations', function() {
    it( 'should work', async function() {
      await lib.recordMigrations([ 'a', 'b', 'c' ]);
      expect ( migrationState.recordMigration.callCount ).to.equal( 3 );
    });
  });

  describe( 'process tasks', function() {
    it( 'should load and run a migration task', async function() {
      await lib.processTasks([{filename: 'a.js'}, {filename: 'b.js'}, {filename: 'c.js'}], actionTypes.migrate );
      expect( action.callCount ).to.equal( 3 );
      expect( action.args[0][0]).to.deep.equal({logLevel: 'probablySomethingReasonable'});
      expect( migrationState.recordMigration.callCount ).to.equal( 3 );
      expect( migrationState.removeMigration.callCount ).to.equal( 0 );
    });

    it( 'should load and run a rollback task', async function() {
      await lib.processTasks([{filename: 'a.js'}], actionTypes.rollback );
      expect( action.callCount ).to.equal( 1 );
      expect( action.args[0][0]).to.deep.equal({logLevel: 'probablySomethingReasonable'});
      expect( migrationState.recordMigration.callCount ).to.equal( 0 );
      expect( migrationState.removeMigration.callCount ).to.equal( 1 );
    });

    it( 'should handle the unknown', async function() {
      await lib.processTasks([{filename: 'a.js'}], 0 );
      expect( action.callCount ).to.equal( 1 );
      expect( action.args[0][0]).to.deep.equal({logLevel: 'probablySomethingReasonable'});
      expect( migrationState.recordMigration.callCount ).to.equal( 0 );
      expect( migrationState.removeMigration.callCount ).to.equal( 0 );
      expect( log.info.callCount ).to.equal( 2 );
      expect( log.info.args[1][0].msg ).to.match( /.*Unknown Action.*/ );
    });
  });

  describe( 'getMigrationsAfterVersion', function() {
    beforeEach( function() {
      migrationState.getCurrentState.resolves([{version: 1}, {version: 2}, {version: 3}, {version: 4}]);
    });

    it( 'should get all migrations after version', async function() {
      const results = await lib.getMigrationsAfterVersion( 2 );
      expect( results ).to.deep.equal([{version: 3}, {version: 4}]);
    });

    it( 'should get the last migration if no version is supplied', async function() {
      const results = await lib.getMigrationsAfterVersion();
      expect( results ).to.deep.equal([{version: 4}]);
    });
  });

  describe( 'getMigrationsBeforeVersion', function() {
    it( 'should get any migrations before and including a supplied version', async function() {
      const results = await lib.getMigrationsBeforeVersion( 2 );
      expect( migrations.getMigrationFiles.callCount ).to.equal( 1 );
      expect( migrations.parseFileName.callCount ).to.equal( 3 );
      expect( migrationState.getCurrentState.callCount ).to.equal( 1 );
      expect( results ).to.deep.equal([{version:1}, {version:2}]);
    });

    it( 'should get any new migrations before and including the supplied version', async function() {
      migrationState.getCurrentState.resolves([{version: 1}]);
      const results = await lib.getMigrationsBeforeVersion( 2 );
      expect( migrations.getMigrationFiles.callCount ).to.equal( 1 );
      expect( migrations.parseFileName.callCount ).to.equal( 3 );
      expect( migrationState.getCurrentState.callCount ).to.equal( 1 );
      expect( results ).to.deep.equal([{version:2}]);
    });

    it( 'should get the all new versions if no version is specified', async function() {
      const results = await lib.getMigrationsBeforeVersion();
      expect( migrations.getMigrationFiles.callCount ).to.equal( 1 );
      expect( migrations.parseFileName.callCount ).to.equal( 3 );
      expect( migrationState.getCurrentState.callCount ).to.equal( 1 );
      expect( results ).to.deep.equal([{version:1}, {version:2}, {version: 3}]);
    });

    it( 'should prevent an old-new version from being run', async function() {
      migrationState.getCurrentState.resolves([{version: 1}, {version: 3}]);
      try {
        await lib.getMigrationsBeforeVersion();
        expect( 'this shall' ).to.equal( 'not pass' );
      } catch ( err ) {
        expect( err ).to.match( /older than the current state/ );
        expect( err.outOfOrderMigrations ).to.deep.equal([{version: 2}]);
      }
    });
  });
});
