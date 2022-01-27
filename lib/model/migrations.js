
import fs from 'fs/promises';
import _ from 'lodash';
import { config } from '../config.js';
import {findUp} from "find-up";

const model =  {};

model.getMigrationFiles = async () => {
  // todo probably why it doesn't work in child directories
  let files = await fs.readdir(await findUp(config.migrationsDirectory));
  files = _.filter(files, (f)=>_.startsWith(f,'v') && _.endsWith(f,'.js'));

  return files;
};

export default model;
