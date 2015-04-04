import core from './core';
import profile from '../profile';

import _ from 'lodash';
import r from 'random-distrib.js';

const transitions = {
  machine: {
    new: {
      active: {distribution: 'lognormal', a: 2, mu: 0, sigma: 0.5}
    }
  }
};

const distributions = {
  lognormal: params => r.lognormal(params.a, params.mu, params.sigma)
};


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

      try {
        const machine = createMachine(name, location, size, image, options);
        callback(undefined, [{droplet: machine}, response]);
      }
      catch (e) {
        callback(e);
      }
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

      _.each(machines, updateMachine);

      callback(undefined, [{
        droplets: _.map(machines, machine => {
          const {id, name, created_at, networks} = machine,
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

  function createMachine(name, location, size, image, options) {
    const {ssh_keys, user_data} = options || {},
          {machines} = state;

    if (machines[name]) {
      throw new Error(`Machine ${name} already exists!`);
    }

    const sizeProfile = sizes[size];
    if (!sizeProfile) {
      throw new Error(`Size ${size} doesn't exist!`);
    }

    const locationProfile = locations[location];
    if (!locationProfile) {
      throw new Error(`Location ${location} doesn't exist!`);
    }

    const id = state.nextMachineId++,
          created_at = new Date().getTime(),
          networks = {v4: [], v6: []};

    const machine = {
      id,
      name,
      memory: sizeProfile.memory,
      location,
      size,
      image,
      options,
      networks,
      created_at,
      status: 'new'
    };

    machines[id] = machine;

    return machine;
  }

  function updateMachine(machine) {
    if (machine.status === 'new') updateNewMachine(machine);
    else if (machine.status === 'active');

    return machine;
  }

  function updateNewMachine(machine) {
    const transition = transitions.machine.new.active,
          transitionTime = distributions[transition.distribution](transition) * 1000,
          sinceCreation = new Date().getTime() - machine.created_at;

    if (transitionTime < sinceCreation) {
      machine.status = 'active';
      machine.networks.v4.push({ip_address: '10.0.0.1', netmask: '255.255.255.0', gateway: '10.0.0.0'});
    }
  }
}

/*
doMachine {
  id: 1,
  name: '',
  memory: 1,
  vcpus: 1,
  disk: 1,
  locked: false,
  created_at: '',
  backups_ids: [],
  snapshot_ids: [],
  features: [],
  region: '',
  image: {},
  size {},
  size_slug: '',
  networks: {
    v4: [],
    v6: []
  },
  kernel: {},
  next_backup_window: {}
}

*/