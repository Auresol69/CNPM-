const Notification = require('../models/notification.model');
const factory = require('../utils/handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.setMyId = (req, res, next) => {
    req.query.recipientId = req.user.id;

    if (!req.query.sort) {
        req.query.sort = '-createdAt';
    }
    
    next();
};

exports.getMyNotifications = factory.selectAll(Notification);

// Xóa thông báo (Bấm dấu X -> Xóa vĩnh viễn)
exports.deleteMyNotification = catchAsync(async (req, res, next) => {
    const notif = await Notification.findOneAndDelete({
        _id: req.params.id,
        recipientId: req.user.id
    });

    if (!notif) {
        return next(new AppError('Không tìm thấy thông báo hoặc không có quyền xóa', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
});