import core from './core';
import profile from '../profile';

module.exports = () => core(simulator());

function simulator() {
  const state = {
    machines: []
  };

  const images = {
    'coreos-alpha': true,
    'coreos-beta': true,
    'coreos-stable': true
  };

  const {sizes, locations} = profile;

  // This implements part of the `do-wrapper` interface
  return credentials => {
    return {
      dropletsCreateNewDroplet,
      dropletsDeleteDroplet,
      dropletsGetAll,
      account
    };

    function dropletsCreateNewDroplet(name, location, size, image, options, callback) {
      const {ssh_keys, user_data} = options || {};

      if (machines[name]) {
        callback(new Error(`Machine ${name} already exists!`));
        return;
      }

      if (!sizes[size]) {
        callback(new Erorr(`Size ${size} doesn't exist!`));
        return;
      }

      if (!locations[location]) {
        callback(new Error(`Location ${location} doesn't exist!`));
        return;
      }

      const machine = {
        name,
        location,
        size,
        image,
        options
      };

      machines[name] = machine;

      return machine;
    }

    function dropletsDeleteDroplet(name, callback) {

    }

    function dropletsGetAll(callback) {

    }

    function account(callback) {
      if (credentials) callback(undefined, true);
      else callback(new Error('Credentials not defined!'));
    }
  };
}