"use strict";
var $__core__,
    $___46__46__47_profile__,
    $__lodash__,
    $__random_45_distrib_46_js__;
var core = ($__core__ = require("./core"), $__core__ && $__core__.__esModule && $__core__ || {default: $__core__}).default;
var profile = ($___46__46__47_profile__ = require("../profile"), $___46__46__47_profile__ && $___46__46__47_profile__.__esModule && $___46__46__47_profile__ || {default: $___46__46__47_profile__}).default;
var _ = ($__lodash__ = require("lodash"), $__lodash__ && $__lodash__.__esModule && $__lodash__ || {default: $__lodash__}).default;
var r = ($__random_45_distrib_46_js__ = require("random-distrib.js"), $__random_45_distrib_46_js__ && $__random_45_distrib_46_js__.__esModule && $__random_45_distrib_46_js__ || {default: $__random_45_distrib_46_js__}).default;
var transitions = {machine: {new: {active: {
        distribution: 'lognormal',
        a: 2,
        mu: 0,
        sigma: 0.5
      }}}};
var distributions = {lognormal: (function(params) {
    return r.lognormal(params.a, params.mu, params.sigma);
  })};
module.exports = (function() {
  return core(simulator());
});
function simulator() {
  var state = {
    nextMachineId: 0,
    machines: {}
  };
  var images = {
    'coreos-alpha': true,
    'coreos-beta': true,
    'coreos-stable': true
  };
  var headers = {
    'RateLimit-Limit': 5000,
    'RateLimit-Remaining': 5000,
    'RateLimit-Reset': new Date().getTime()
  };
  var response = {headers: headers};
  var $__4 = profile,
      sizes = $__4.sizes,
      locations = $__4.locations;
  return (function(credentials) {
    return {
      dropletsCreateNewDroplet: dropletsCreateNewDroplet,
      dropletsDeleteDroplet: dropletsDeleteDroplet,
      dropletsGetAll: dropletsGetAll,
      account: account
    };
    function dropletsCreateNewDroplet(name, location, size, image, options, callback) {
      ratelimit();
      try {
        var machine = createMachine(name, location, size, image, options);
        callback(undefined, [{droplet: machine}, response]);
      } catch (e) {
        callback(e);
      }
    }
    function dropletsDeleteDroplet(id, callback) {
      ratelimit();
      var machines = state.machines,
          machine = machines[id];
      if (!machine) {
        callback(new Error(("No machine with id " + id)));
        return ;
      }
      delete machines[id];
      callback(undefined, [{success: true}, response]);
    }
    function dropletsGetAll(callback) {
      ratelimit();
      var machines = state.machines;
      _.each(machines, updateMachine);
      callback(undefined, [{droplets: _.map(machines, (function(machine) {
          var $__6 = machine,
              id = $__6.id,
              name = $__6.name,
              created_at = $__6.created_at,
              networks = $__6.networks,
              status = 'new';
          return {
            id: id,
            created_at: created_at,
            name: name,
            networks: networks,
            status: status
          };
        }))}, response]);
    }
    function account(callback) {
      ratelimit();
      if (credentials)
        callback(undefined, [{account: {droplet_limit: 1000}}, response]);
      else
        callback(new Error('Credentials not defined!'));
    }
    function ratelimit() {
      var remaining = headers['RateLimit-Remaining'];
      if (remaining === 0)
        throw new Error('Rate Limit Reached!');
      headers['RateLimit-Remaining'] = remaining - 1;
    }
  });
  function createMachine(name, location, size, image, options) {
    var $__5 = options || {},
        ssh_keys = $__5.ssh_keys,
        user_data = $__5.user_data,
        machines = state.machines;
    console.log('Creating machine', arguments);
    if (machines[name]) {
      throw new Error(("Machine " + name + " already exists!"));
    }
    var sizeProfile = sizes[size];
    if (!sizeProfile) {
      throw new Error(("Size " + size + " doesn't exist!"));
    }
    var locationProfile = locations[location];
    if (!locationProfile) {
      throw new Error(("Location " + location + " doesn't exist!"));
    }
    var id = state.nextMachineId++,
        created_at = new Date().getTime(),
        networks = {
          v4: [],
          v6: []
        };
    var machine = {
      id: id,
      name: name,
      memory: sizeProfile.memory,
      location: location,
      size: size,
      image: image,
      options: options,
      networks: networks,
      created_at: created_at,
      status: 'new'
    };
    machines[id] = machine;
    return machine;
  }
  function updateMachine(machine) {
    if (machine.status === 'new')
      updateNewMachine(machine);
    else if (machine.status === 'active')
      ;
    return machine;
  }
  function updateNewMachine(machine) {
    var transition = transitions.machine.new.active,
        transitionTime = distributions[transition.distribution](transition) * 1000,
        sinceCreation = new Date().getTime() - machine.created_at;
    if (transitionTime < sinceCreation) {
      machine.status = 'active';
      machine.networks.v4.push({
        ip_address: '10.0.0.1',
        netmask: '255.255.255.0',
        gateway: '10.0.0.0'
      });
    }
  }
}

//# sourceMappingURL=../provider/simulator.js.map