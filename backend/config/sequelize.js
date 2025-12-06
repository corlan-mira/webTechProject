/**
 * Sequelize Configuration
 * ORM initialization and connection setup
 */

const { Sequelize } = require('sequelize');
const databaseConfig = require('./database');

const sequelize = new Sequelize({
  username: databaseConfig.username,
  password: databaseConfig.password,
  database: databaseConfig.database,
  host: databaseConfig.host,
  port: databaseConfig.port,
  dialect: databaseConfig.dialect,
  logging: databaseConfig.logging,
  pool: databaseConfig.pool,
  dialectOptions: databaseConfig.dialectOptions,
  define: {
    timestamps: true,
    underscored: false,
  },
});

module.exports = sequelize;
