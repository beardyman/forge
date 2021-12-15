
import _ from 'lodash';

const actionTypes = {
  migrate: 1,
  rollback: -1
};

export default actionTypes

export const actionLookup = (value) => {
  return _.invert(actionTypes)[value];
};