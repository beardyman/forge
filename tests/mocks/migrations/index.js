

import * as a from './v1_a.js';
import * as b from './v2_b.js';
import * as c from './v3_c.js';



export const mocks = {
  a, b, c
};

export const resetAll = () => {
  a.resetMocks();
  b.resetMocks();
  c.resetMocks();
};
