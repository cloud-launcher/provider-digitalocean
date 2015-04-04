import server from '../provider/server';

console.log(server(''));

import simulator from '../provider/simulator';

const sim = simulator('');
console.log('sim', sim);

sim.api.createMachine({
  id: 'drop1',
  location: 'sfo1',
  size: '512mb',
  image: 'coreos-alpha',
  keys: ['123'],
  userData: '#cloud-config'
})
.then(sim.api.listMachines)
.then(
  machines => console.log(machines),
  error => console.log(error.stack)
);

setTimeout(sim.api.listMachines, 5000);

try {
  const browser = require('../provider/browser');

  console.log(browser);
}
catch (e) {
  //If running from node, there will be no XMLHttpRequest
  console.log(e);
}