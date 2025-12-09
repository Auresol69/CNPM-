const express = require('express');
const scheduleController = require('../controllers/schedule.controller');
const { authenticateToken } = require('../controllers/auth.controller');

const route = express.Router();

route.use(authenticateToken);

route.get('/', scheduleController.getAllSchedules);

route.post('/', scheduleController.createSchedule);

route.patch('/:scheduleId/stopTimes/:stationId/students', scheduleController.AddStudents);

route.get('/:id/route', scheduleController.getScheduleRoute);

module.exports = route;