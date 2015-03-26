import browserAPI from 'browserAPI';

import profile from '../profile';

module.exports = credentials => {
  return {
    api: core(browserAPI, credentials),
    profile
  };
};