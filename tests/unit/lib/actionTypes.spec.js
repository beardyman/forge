import _ from 'lodash';
import '../bootstrap.js';

import actionTypes, { actionLookup } from '../../../lib/actionTypes.js';

describe( 'Action Types', function() {
  it( 'should have defined types', function() {
    expect( _.keys( actionTypes )).to.contain( 'migrate' );
    expect( _.keys( actionTypes )).to.contain( 'rollback' );
  });

  it( 'should lookup types', function() {
    expect( actionLookup( 1 )).to.equal( 'migrate' );
    expect( actionLookup( -1 )).to.equal( 'rollback' );
  });
});
