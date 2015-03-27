import core from './core';
import profile from '../profile';

import _ from 'lodash';

module.exports = () => core(simulator());

function simulator() {
  const state = {
    nextMachineId: 0,
    machines: {}
  };

  const images = {
    'coreos-alpha': true,
    'coreos-beta': true,
    'coreos-stable': true
  };

  const headers = {
    'RateLimit-Limit': 5000,
    'RateLimit-Remaining': 5000,
    'RateLimit-Reset': new Date().getTime()
  };

  const response = {headers};

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
      ratelimit();

      const {ssh_keys, user_data} = options || {},
            {machines} = state;

      if (machines[name]) {
        callback(new Error(`Machine ${name} already exists!`));
        return;
      }

      if (!sizes[size]) {
        callback(new Error(`Size ${size} doesn't exist!`));
        return;
      }

      if (!locations[location]) {
        callback(new Error(`Location ${location} doesn't exist!`));
        return;
      }

      const id = state.nextMachineId++,
            created_at = new Date().getTime();

      const machine = {
        id,
        name,
        location,
        size,
        image,
        options,
        created_at
      };

      machines[id] = machine;

      callback(undefined, [{droplet: machine}, response]);
    }

    function dropletsDeleteDroplet(id, callback) {
      ratelimit();

      const {machines} = state,
            machine = machines[id];

      if (!machine) {
        callback(new Error(`No machine with id ${id}`));
        return;
      }

      delete machines[id];

      callback(undefined, [{success: true}, response]);
    }

    function dropletsGetAll(callback) {
      ratelimit();

      const {machines} = state;

      callback(undefined, [{
        droplets: _.map(machines, machine => {
          const {id, name, created_at} = machine,
                networks = {v4:[],v6:[]},
                status = 'new';

          return {
            id,
            created_at,
            name,
            networks,
            status
          };
        })
      }, response]);
    }

    function account(callback) {
      ratelimit();

      if (credentials) callback(undefined, [{account:{droplet_limit:1000}}, response]);
      else callback(new Error('Credentials not defined!'));
    }

    function ratelimit() {
      const remaining = headers['RateLimit-Remaining'];
      if (remaining === 0) throw new Error('Rate Limit Reached!'); // Should match what DO gives back, currently doesn't
      headers['RateLimit-Remaining'] = remaining - 1;
    }
  };
}