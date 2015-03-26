import serverAPI from 'serverAPI';

import core from './core';

import profile from '../profile';

module.exports = credentials => {
  return {
    api: core(serverAPI, credentials),
    profile
  };
};