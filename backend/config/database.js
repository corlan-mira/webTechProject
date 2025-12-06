/
  Database Configuration
  PostgreSQL connection settings based on environment
 /

const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'attendance_dev',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || ,
    dialect: 'postgres',
    logging: console.log,
    pool: {
      max: ,
      min: ,
      acquire: ,
      idle: ,
    },
  },
  test: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'attendance_test',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || ,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: ,
      min: ,
      acquire: ,
      idle: ,
    },
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || ,
    dialect: 'postgres',
    logging: false,
    ssl: process.env.DB_SSL === 'true',
    dialectOptions: process.env.DB_SSL === 'true' ? {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    } : {},
    pool: {
      max: ,
      min: ,
      acquire: ,
      idle: ,
    },
  },
};

module.exports = config[env];
