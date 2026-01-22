const path = require('path');

module.exports = {
  'env': 'NODE_ENV',
  'config': path.resolve('config/config.json'),
  'migrations-path': path.resolve('migrations'),
  'seeders-path': path.resolve('seeders'),
  'models-path': path.resolve('models'),
};
