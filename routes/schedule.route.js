const express = require('express');
const scheduleController = require('../controllers/schedule.controller');
const { authenticateToken } = require('../controllers/auth.controller');

const route = express.Router();

route.use(authenticateToken);

route.patch('/:scheduleId/stopTimes/:stationId/students', scheduleController.AddStudents);

module.exports = route;