#!/usr/bin/env node

import min from 'minimist';
import cli from '../cli.js';

const argv = min(process.argv.slice(2), {
  aliases: {
    force: 'f'
  }
});
cli(argv);