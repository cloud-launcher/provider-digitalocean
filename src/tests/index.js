import server from '../provider/server';

console.log(server(''));

import simulator from '../provider/simulator';

console.log(simulator(''));

try {
  const browser = require('../provider/browser');

  console.log(browser);
}
catch (e) {
  //If running from node, there will be no XMLHttpRequest
  console.log(e);
}