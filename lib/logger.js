
import pino from 'pino';
import config from './config.js';

const log = pino({ name: "Forge DB", level: config.logLevel });

export default log;