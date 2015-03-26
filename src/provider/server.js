import serverAPI from 'serverAPI';

import profile from '../profile';

module.exports = credentials => {
  return {
    api: core(serverAPI, credentials),
    profile
  };
};