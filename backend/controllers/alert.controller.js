const Alert = require('../models/alert.model');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');

// GET /api/v1/alerts - Lấy tất cả alerts cho Admin
exports.getAllAlerts = catchAsync(async (req, res, next) => {
    const MAX_LIMIT = 100;
    if (req.query.limit && parseInt(req.query.limit, 10) > MAX_LIMIT)
        req.query.limit = String(MAX_LIMIT);

    const features = new APIFeatures(
        Alert.find()
            .populate('busId', 'licensePlate busNumber')
            .populate('driverId', 'name phone'),
        req.query
    )
        .filter()
        .sort()
        .limitField()
        .pagination();

    const alerts = await features.query;

    res.status(200).json({
        status: 'success',
        results: alerts.length,
        data: alerts
    });
});

// GET /api/v1/alerts/:id - Lấy chi tiết 1 alert
exports.getAlert = catchAsync(async (req, res, next) => {
    const alert = await Alert.findById(req.params.id)
        .populate('busId', 'licensePlate busNumber')
        .populate('driverId', 'name phone email');

    if (!alert)
        return next(new AppError('Không tìm thấy cảnh báo với ID này', 404));

    res.status(200).json({
        status: 'success',
        data: alert
    });
});

// DELETE /api/v1/alerts/:id - Xóa alert (Admin)
exports.deleteAlert = catchAsync(async (req, res, next) => {
    const alert = await Alert.findByIdAndDelete(req.params.id);

    if (!alert)
        return next(new AppError('Không tìm thấy cảnh báo với ID này', 404));

    res.status(204).json({
        status: 'success',
        data: null
    });
});
