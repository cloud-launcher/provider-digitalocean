import promise from 'promise-callback';
import _ from 'lodash';

import profile from '../profile';

require('traceur-runtime');

module.exports = API => {
  const credentials = {};

  const credentialSchema = {
    token: {
      type: 'string',
      header: 'Personal Access Token',
      link: 'https://cloud.digitalocean.com/settings/tokens/new'
    }
  };

  return {
    name: 'digitalocean',
    targets: ['coreos'],
    api: digitalocean(API, credentials),
    $rawAPI: API,
    profile,
    credentials,
    credentialSchema,
    dashboardUrl: 'https://cloud.digitalocean.com',
    referralUrl: 'https://www.digitalocean.com/?refcode=4df1a6f6f727',
    referralTeaser: 'Signup for a DigitalOcean account through this referral link to get $10 in free credits and to support cloud-launcher.'
  };
};

function digitalocean(API, credentials) {
  const status = {
    limit: undefined,         //API Rate Limit (per hour?)
    remaining: undefined,     //API Calls Left
    resetTime: undefined,     //When API Rate Calls will reset (datetime)
    machineLimit: undefined   //Number of machines digitalocean allows you to create
  };

  return {
    createMachine,
    destroyMachine,

    listMachines,

    verifyAccount,

    status,

    MAX_CONCURRENT_CALLS: 5
  };

  function createMachine(description) {
    const api = getApi(),
          {id, location, size, image, keys, userData} = description;

    return promise(
      api.dropletsCreateNewDroplet.bind(api),
      id, location, size, image, {ssh_keys: keys, user_data: userData}
    )
    .then(handleApiResponse, handleApiError)
    .then(value => {
      const [data, header, response] = value,
            {droplet} = data,
            doIdentifier = {
              id: droplet.id,
              createdAt: droplet.created_at
            };

      return doIdentifier;
    });
  }

  function destroyMachine(machine) {
    var api = getApi();

    return promise(
      api.dropletsDeleteDroplet.bind(api),
      machine.response.id
    )
    .then(handleApiResponse)
    .then(value => {
      return {success: true};
    });
  }

  function listMachines() {
    const api = getApi();

    return promise(
      api.dropletsGetAll.bind(api)
    )
    .then(handleApiResponse)
    .then(value => {
      const [data] = value,
            {droplets} = data;

      return _.reduce(droplets, (result, droplet) => {
        const {id, created_at: createdAt, name, networks, status} = droplet;

        result[name] = {
          id,
          createdAt,
          networks: {
            v4: _.map(networks.v4, network => {
              const {ip_address: ipAddress, netmask, gateway, type} = network;
              return {ipAddress, netmask, gateway, type};
            }),
            v6: networks.v6
          },
          status
        };

        return result;
      }, {});
    });
  }

  function verifyAccount() {
    const api = getApi();

    return promise(
      api.account.bind(api)
    )
    .then(handleApiResponse)
    .then(value => {
      const [data] = value;

      status.machineLimit = data.account.droplet_limit;
    });
  }

  function getApi() {
    return new API(credentials.token, 1000);
  }

  function handleApiResponse(value) {
    return new Promise((resolve, reject) => {
      let data, response;

      if (Array.isArray(value)) [data, response] = value;
      else data = response = value;

      response = response || data;

      const headers = response.headers || getResponseHeaders(response, ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset']);

      status.limit = parseInt(headers['RateLimit-Limit'] || '0');
      status.remaining = parseInt(headers['RateLimit-Remaining'] || '0');
      status.reset = new Date(parseInt(headers['RateLimit-Reset'] || '0') * 1000);

      resolve(value);
    });
  }

  function handleApiError(value) {
    return new Promise((resolve, reject) => {
      const {error, args} = value;
      let [data, response] = args;

      response = response || data;

      if (response.statusCode === 401) {
        reject({error: 'Unauthorized', data, response, provider: digitalocean.$name});
        return;
      }
      reject({error, data, response, provider: digitalocean.$name});
    });
  }

  function getResponseHeaders(response, headers) {
    return _.reduce(headers, (result, header) => {
      result[header] = response.getResponseHeader(header);
      return result;
    }, {});
  }
}