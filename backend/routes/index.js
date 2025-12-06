/
  Routes Index
  Main route aggregator
 /

const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const eventGroupRoutes = require('./eventGroups');
const eventRoutes = require('./events');
const attendanceRoutes = require('./attendance');

// Mount routes
router.use('/auth', authRoutes);
router.use('/event-groups', eventGroupRoutes);
router.use('/events', eventRoutes);
router.use('/attendance', attendanceRoutes);

module.exports = router;
