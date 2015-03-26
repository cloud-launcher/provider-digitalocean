import profile from '../profile';

module.exports = credentials => {
  return {
    api: core(simulator, credentials),
    profile
  };
};

function simulator() {

}