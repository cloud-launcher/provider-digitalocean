import _ from 'lodash';

const blacklist = {locations: ['nyc2']};

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
