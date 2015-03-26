import browserAPI from 'browserAPI';

import core from './core';

import profile from '../profile';

module.exports = credentials => {
  return {
    api: core(browserAPI, credentials),
    profile
  };
};