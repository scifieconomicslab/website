const { build } = require('../plugins/heritage');

module.exports = () => {
  const { errors, ...data } = build();
  if (errors.length) throw new Error('heritage data is inconsistent:\n  ' + errors.join('\n  '));
  return data;
};
