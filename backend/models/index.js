/
  Models Index
  Exports all Sequelize models
 /

const sequelize = require('../config/sequelize');
const User = require('./User');
const EventGroup = require('./EventGroup');
const Event = require('./Event');
const Attendance = require('./Attendance');

// Initialize models
const models = {
  User: User(sequelize),
  EventGroup: EventGroup(sequelize),
  Event: Event(sequelize),
  Attendance: Attendance(sequelize),
};

// Define associations
Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});

module.exports = {
  sequelize,
  ...models,
};
