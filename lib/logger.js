
import pino from 'pino';
import config from './config.js';

const log = pino({ name: "Forge", level: config.logLevel });

export default log;
