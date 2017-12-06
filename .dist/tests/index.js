"use strict";
var $___46__46__47_provider_47_server__,
    $___46__46__47_provider_47_simulator__;
var server = ($___46__46__47_provider_47_server__ = require("../provider/server"), $___46__46__47_provider_47_server__ && $___46__46__47_provider_47_server__.__esModule && $___46__46__47_provider_47_server__ || {default: $___46__46__47_provider_47_server__}).default;
console.log(server(''));
var simulator = ($___46__46__47_provider_47_simulator__ = require("../provider/simulator"), $___46__46__47_provider_47_simulator__ && $___46__46__47_provider_47_simulator__.__esModule && $___46__46__47_provider_47_simulator__ || {default: $___46__46__47_provider_47_simulator__}).default;
var sim = simulator('');
console.log('sim', sim);
sim.api.createMachine({
  id: 'drop1',
  location: 'sfo1',
  size: '512mb',
  image: 'coreos-alpha',
  keys: ['123'],
  userData: '#cloud-config'
}).then(sim.api.listMachines).then((function(machines) {
  return console.log(machines);
}), (function(error) {
  return console.log(error.stack);
}));
setTimeout(sim.api.listMachines, 5000);
try {
  var browser = require('../provider/browser');
  console.log(browser);
} catch (e) {
  console.log(e);
}

//# sourceMappingURL=../tests/index.js.map