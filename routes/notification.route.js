const express = require('express');
const { setMyId, getMyNotifications, deleteMyNotification } = require('../controllers/notification.controller');
const { authenticateToken } = require('../controllers/auth.controller');
const route = express.Router();

route.use(authenticateToken);

// GET /api/v1/notifications/me -> Lấy danh sách
route.get('/me', setMyId, getMyNotifications);

// DELETE /api/v1/notifications/:id -> Xóa (Bấm dấu X)
route.delete('/:id', deleteMyNotification);

module.exports = route;