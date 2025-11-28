const express = require('express');
const { getMe, updateMe } = require('../controllers/user.controller');
const { authenticateToken } = require('../controllers/auth.controller');
const route = express.Router();

route.use(authenticateToken);

route.get('/me', getMe);

route.patch('/me', updateMe);

module.exports = route;