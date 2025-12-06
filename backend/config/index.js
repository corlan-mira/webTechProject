/**
 * Configuration Index
 * Exports all configuration modules
 */

module.exports = {
  database: require('./database'),
  environment: require('./environment'),
  sequelize: require('./sequelize'),
};
