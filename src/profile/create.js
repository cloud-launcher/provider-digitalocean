import _ from 'lodash';

const blacklist = {locations: ['nyc2']};

// Note: These are just generic coordinates for the city, not the actual
//  location of the datacenters. If you know the actual locations, please
//  update!
const physicalLocations = {
  ams1: {lat: 52.370216, long: 4.895168},
  ams2: {lat: 52.370216, long: 4.895168},
  ams3: {lat: 52.370216, long: 4.895168},
  lon1: {lat: 51.507351, long: -0.127758},
  nyc1: {lat: 40.712784, long: -74.005941},
  nyc2: {lat: 40.712784, long: -74.005941},
  nyc3: {lat: 40.712784, long: -74.005941},
  sgp1: {lat: 1.352083,  long: 103.819836},
  sfo1: {lat: 37.774929, long: -122.419416}
};

module.exports = (DOWrapper, DOToken) => {
  const api = new DOWrapper(DOToken);

  return Promise.all([
    promise(api.sizesGetAll.bind(api))
      .then(transformSizes)
  ,
    promise(api.regionsGetAll.bind(api))
      .then(transformRegions)
  ])
  .then(makeProfile);

  function promise(fn, ...args) {
    return new Promise((resolve, reject) => {
      fn(...args, (error, ...rest) => {
        if (error) reject(error);
        else resolve(...rest);
      });
    });
  }

  function transformSizes(sizes) {
    return new Promise((resolve, reject) => {
      resolve(_.transform(sizes.sizes, (sizes, size) => {
        const {slug: id, memory, vcpus: cpus, disk, transfer, price_monthly, price_hourly, regions: locations} = size;
        sizes[id] = {
          id,
          memory,
          cpus,
          disk,
          transfer,
          price_monthly,
          price_hourly,
          locations
        };
      }, {}));
    });
  }

  function transformRegions(regions) {
    return new Promise((resolve, reject) => {
      resolve(_.transform(_.where(regions.regions, {available: true}), (regions, region) => {
        const {slug: id, name, sizes, available} = region;
        regions[id] = {
          id,
          vicinity: name,
          physicalLocation: physicalLocations[id] || {},
          sizes
        };
      }, {}));
    });
  }

  function makeProfile(values) {
    const [sizes, locations] = values;
    return {
      name: 'DigitalOcean',
      sizes,
      locations: _.omit(locations, blacklist.locations || [])
    };
  }
};
