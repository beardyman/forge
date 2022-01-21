
import fs from 'fs/promises';
import _ from 'lodash';
import { config } from '../config.js';

const model =  {};

model.getMigrationFiles = async () => {
  let files = await fs.readdir(config.migrationsDirectory);
  files = _.filter(files, (f)=>_.startsWith(f,'v') && _.endsWith(f,'.js'));

  return files;
};

export default model;
