#!/usr/bin/env node

// disable no-console rule for this file since our normal logger needs to read in config to work.
/* eslint-disable no-console */
import min from 'minimist';
import cli from '../cli.js';

const argv = min( process.argv.slice( 2 ));

await cli( argv );
process.exit( 0 );

process.on( 'uncaughtException', ( error ) => {
  console.fatal( error );
  process.exit( 255 );
});

process.on( 'unhandledRejection', ( reason ) => {
  console.fatal( reason );
  process.exit( 255 );
});
