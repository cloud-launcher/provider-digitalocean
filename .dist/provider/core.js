"use strict";
var $__promise_45_callback__,
    $__lodash__,
    $___46__46__47_profile__;
var promise = ($__promise_45_callback__ = require("promise-callback"), $__promise_45_callback__ && $__promise_45_callback__.__esModule && $__promise_45_callback__ || {default: $__promise_45_callback__}).default;
var _ = ($__lodash__ = require("lodash"), $__lodash__ && $__lodash__.__esModule && $__lodash__ || {default: $__lodash__}).default;
var profile = ($___46__46__47_profile__ = require("../profile"), $___46__46__47_profile__ && $___46__46__47_profile__.__esModule && $___46__46__47_profile__ || {default: $___46__46__47_profile__}).default;
require('traceur-runtime');
module.exports = (function(API) {
  var credentials = {};
  var credentialSchema = {token: {
      type: 'string',
      header: 'Personal Access Token',
      link: 'https://cloud.digitalocean.com/settings/tokens/new',
      required: true,
      environmentVariable: 'DO_TOKEN'
    }};
  return {
    name: 'digitalocean',
    targets: ['coreos'],
    api: digitalocean(API, credentials),
    $rawAPI: API,
    profile: profile,
    credentials: credentials,
    credentialSchema: credentialSchema,
    dashboardUrl: 'https://cloud.digitalocean.com',
    referralUrl: 'https://www.digitalocean.com/?refcode=4df1a6f6f727',
    referralTeaser: 'Signup for a DigitalOcean account through this referral link to get $10 in free credits and to support cloud-launcher.'
  };
});
function digitalocean(API, credentials) {
  var status = {
    limit: undefined,
    remaining: undefined,
    resetTime: undefined,
    machineLimit: undefined
  };
  return {
    createMachine: createMachine,
    destroyMachine: destroyMachine,
    listMachines: listMachines,
    verifyAccount: verifyAccount,
    status: status,
    MAX_CONCURRENT_CALLS: 5
  };
  function createMachine(description) {
    var api = getApi(),
        $__3 = description,
        id = $__3.id,
        location = $__3.location,
        size = $__3.size,
        image = $__3.image,
        keys = $__3.keys,
        userData = $__3.userData;
    return promise(api.dropletsCreateNewDroplet.bind(api), id, location, size, image, {
      ssh_keys: keys,
      user_data: userData
    }).then(handleApiResponse, handleApiError).then((function(value) {
      var $__5,
          $__6;
      var $__4 = value,
          data = ($__5 = $__4[$traceurRuntime.toProperty(Symbol.iterator)](), ($__6 = $__5.next()).done ? void 0 : $__6.value),
          header = ($__6 = $__5.next()).done ? void 0 : $__6.value,
          response = ($__6 = $__5.next()).done ? void 0 : $__6.value,
          droplet = data.droplet,
          doIdentifier = {
            id: droplet.id,
            createdAt: droplet.created_at
          };
      return doIdentifier;
    }));
  }
  function destroyMachine(machine) {
    var api = getApi();
    return promise(api.dropletsDeleteDroplet.bind(api), machine.response.id).then(handleApiResponse).then((function(value) {
      return {success: true};
    }));
  }
  function listMachines() {
    var api = getApi();
    return promise(api.dropletsGetAll.bind(api)).then(handleApiResponse).then((function(value) {
      var $__4,
          $__7,
          $__5,
          $__6;
      var data = ($__5 = value[$traceurRuntime.toProperty(Symbol.iterator)](), ($__6 = $__5.next()).done ? void 0 : $__6.value),
          droplets = data.droplets;
      return _.reduce(droplets, (function(result, droplet) {
        var $__9 = droplet,
            id = $__9.id,
            createdAt = $__9.created_at,
            name = $__9.name,
            networks = $__9.networks,
            status = $__9.status;
        result[name] = {
          id: id,
          createdAt: createdAt,
          networks: {
            v4: _.map(networks.v4, (function(network) {
              var $__10 = network,
                  ipAddress = $__10.ip_address,
                  netmask = $__10.netmask,
                  gateway = $__10.gateway,
                  type = $__10.type;
              return {
                ipAddress: ipAddress,
                netmask: netmask,
                gateway: gateway,
                type: type
              };
            })),
            v6: networks.v6
          },
          status: status
        };
        return result;
      }), {});
    }));
  }
  function verifyAccount() {
    var api = getApi();
    return promise(api.account.bind(api)).then(handleApiResponse).then((function(value) {
      var $__8,
          $__4,
          $__7,
          $__5;
      var data = ($__7 = value[$traceurRuntime.toProperty(Symbol.iterator)](), ($__5 = $__7.next()).done ? void 0 : $__5.value);
      status.machineLimit = data.account.droplet_limit;
    }));
  }
  function getApi() {
    return new API(credentials.token, 1000);
  }
  function handleApiResponse(value) {
    return new Promise((function(resolve, reject) {
      var $__3,
          $__8,
          $__4;
      var data,
          response;
      if (Array.isArray(value))
        ($__3 = value, data = ($__8 = $__3[$traceurRuntime.toProperty(Symbol.iterator)](), ($__4 = $__8.next()).done ? void 0 : $__4.value), response = ($__4 = $__8.next()).done ? void 0 : $__4.value, $__3);
      else
        data = response = value;
      response = response || data;
      var headers = response.headers || getResponseHeaders(response, ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset']);
      status.limit = parseInt(headers['RateLimit-Limit'] || '0');
      status.remaining = parseInt(headers['RateLimit-Remaining'] || '0');
      status.reset = new Date(parseInt(headers['RateLimit-Reset'] || '0') * 1000);
      resolve(value);
    }));
  }
  function handleApiError(value) {
    return new Promise((function(resolve, reject) {
      var $__4,
          $__7;
      var $__3 = value,
          error = $__3.error,
          args = $__3.args;
      var $__8 = args,
          data = ($__4 = $__8[$traceurRuntime.toProperty(Symbol.iterator)](), ($__7 = $__4.next()).done ? void 0 : $__7.value),
          response = ($__7 = $__4.next()).done ? void 0 : $__7.value;
      response = response || data;
      if (response.statusCode === 401) {
        reject({
          error: 'Unauthorized',
          data: data,
          response: response,
          provider: digitalocean.$name
        });
        return ;
      }
      reject({
        error: error,
        data: data,
        response: response,
        provider: digitalocean.$name
      });
    }));
  }
  function getResponseHeaders(response, headers) {
    return _.reduce(headers, (function(result, header) {
      result[header] = response.getResponseHeader(header);
      return result;
    }), {});
  }
}

//# sourceMappingURL=../provider/core.js.map