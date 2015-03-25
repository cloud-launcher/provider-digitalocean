
module.exports = provider;

function provider(API, credentials) {
  const status = {
    limit: undefined,         //API Rate Limit (per hour?)
    remaining: undefined,     //API Calls Left
    resetTime: undefined,     //When API Rate Calls will reset (datetime)
    machineLimit: undefined   //Number of machines provider allows you to createwwwwwwwwwww
  };

  return {
    createMachine,
    destroyMachine,

    listMachines,

    verifyAccount,

    status,

    getAPI,

    MAX_CONCURRENT_CALLS: 5
  };

  function createMachine(description) {
    return new Promise((resolve, reject) => {
      const machine = {};
      resolve(machine);
    });
  }

  function destroyMachine(machine) {
    return new Promise((resolve, reject) => {
      resolve({destroyed: true, machine});
    });
  }

  function listMachines() {
    return new Promise((resolve, reject) => {
      const machines = [];
      resolve(machines);
    });
  }

  function verifyAccount() {
    return new Promise((resolve, reject) => {
      resolve();
    });
  }

  function getAPI() {
    return new API(credentials);
  }
}

provider.$name = 'provider';
provider.$targets = ['coreos'];
provider.$dashboardUrl = 'https://dashboard_link';
provider.$referralUrl= 'https://referral_link';
provider.$credentialSchema = {
  token: {
    type: 'string',
    header: 'Some kind of autthorization token',
    link: 'https://link_to_create_new_token'
  }
};