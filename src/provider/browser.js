import DOWrapper from 'do-wrapper-browser';

import core from './core';

import profile from '../profile';

module.exports = credentials => {
  return {
    api: core(DOWrapper, credentials),
    profile
  };
};