const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alert.controller');
const { authenticateToken, restrictTo } = require('../controllers/auth.controller');

// Tất cả routes đều yêu cầu đăng nhập và chỉ Admin/Manager mới truy cập
router.use(authenticateToken);
router.use(restrictTo('Admin', 'Manager'));

router.route('/')
    .get(alertController.getAllAlerts);

router.route('/:id')
    .get(alertController.getAlert)
    .delete(alertController.deleteAlert);

module.exports = router;
