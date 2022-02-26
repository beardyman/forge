import '../bootstrap.js';
import _ from 'lodash';

describe( 'Commands Controllers', function() {
  let commands, processActions, log;

  beforeEach( async function() {
    processActions = {
      getMigrationsBeforeVersion: sinon.stub().resolves([]),
      getMigrationsAfterVersion: sinon.stub().resolves([]),
      initializeMigrationTable: sinon.stub().resolves(),
      processTasks: sinon.stub().resolves(),
      recordMigrations: sinon.stub().resolves()
    };

    log = {
      info: sinon.stub(),
      debug: sinon.stub()
    };

    commands = await esmock( '../../../controllers/commands.js', {
      '../../../lib/logger': {log},
      '../../../lib/processActions': processActions
    });
  });

  describe( 'Initialize', function() {
    it( 'should call initialize and record migrations', async function() {
      await commands.initialize({version: 5});
      expect( processActions.initializeMigrationTable.callCount ).to.equal( 1 );
      expect( processActions.getMigrationsBeforeVersion.callCount ).to.equal( 1 );
      expect( processActions.getMigrationsBeforeVersion.args[0][0]).to.equal( 5 );
      expect( processActions.recordMigrations.callCount ).to.equal( 1 );
    });
  });

  describe( 'Migrate', function() {
    it( 'should process migrations if there are any', async function() {
      processActions.getMigrationsBeforeVersion.resolves( 'migs' );

      await commands.migrate({version: 5});
      expect( processActions.initializeMigrationTable.callCount ).to.equal( 1 );
      expect( processActions.getMigrationsBeforeVersion.callCount ).to.equal( 1 );
      expect( processActions.getMigrationsBeforeVersion.args[0][0]).to.equal( 5 );
      expect( processActions.processTasks.callCount ).to.equal( 1 );
      expect( processActions.processTasks.args[0][0]).to.equal( 'migs' );
    });

    it( 'shouldm\'t process migrations if there arem\'t any', async function() {
      await commands.migrate({version: 5});
      expect( processActions.initializeMigrationTable.callCount ).to.equal( 1 );
      expect( processActions.getMigrationsBeforeVersion.callCount ).to.equal( 1 );
      expect( processActions.getMigrationsBeforeVersion.args[0][0]).to.equal( 5 );
      expect( processActions.processTasks.callCount ).to.equal( 0 );
    });
  });

  describe( 'Rollback', function() {
    it( 'should process rollbacks if there are any', async function() {
      processActions.getMigrationsAfterVersion.resolves(['figs', 'migs']);

      await commands.rollback({version: 5});
      expect( processActions.getMigrationsAfterVersion.callCount ).to.equal( 1 );
      expect( processActions.getMigrationsAfterVersion.args[0][0]).to.equal( 5 );
      expect( processActions.processTasks.callCount ).to.equal( 1 );
      // expect them to be passed in reverse order
      expect( processActions.processTasks.args[0][0]).to.deep.equal(['migs', 'figs']);
    });

    it( 'shouldn\'t process migrations if there aren\'t any', async function() {
      await commands.rollback({version: 5});
      expect( processActions.getMigrationsAfterVersion.callCount ).to.equal( 1 );
      expect( processActions.getMigrationsAfterVersion.args[0][0]).to.equal( 5 );
      expect( processActions.processTasks.callCount ).to.equal( 0 );
    });
  });

  describe( 'validateCommands', function() {
    it( 'should not throw an error for a valid command', function() {
      expect( commands.validateCommands( 'migrate' )).to.equal( undefined );
    });

    it( 'should throw an error for a invalid command', function() {
      expect( _.partial( commands.validateCommands, 'jibberish' )).to.throw( /'jibberish' is unrecognized/ );
    });
  });
});
