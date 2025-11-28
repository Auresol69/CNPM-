const express = require('express');
const { getMyStudents } = require('../controllers/student.controller');
const { authenticateToken } = require('../controllers/auth.controller');
const route = express.Router();

route.use(authenticateToken);

route.get('/my-students', getMyStudents);

module.exports = route;