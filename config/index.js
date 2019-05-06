import production from './production';
import development from './development';
import test from './test';

const configs = {
  production,
  development,
  test
};

export default configs[process.env.NODE_ENV];
