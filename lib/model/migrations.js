
import fs from 'fs/promises';
import _ from 'lodash';
import { config } from '../config.js';
import {findUp} from "find-up";

const model =  {};

model.getMigrationFiles = async () => {
  let directory = await findUp(config.migrationsDirectory, {type: 'directory'});
  let files = await fs.readdir(directory);
  files = _.filter(files, (f)=>_.startsWith(f,'v') && _.endsWith(f,'.js'));

  return files;
};

export default model;
