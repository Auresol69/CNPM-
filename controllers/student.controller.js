const Student = require('../models/student.model');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getMyStudents = catchAsync(async (req, res, next) => {
    const baseFilter = {
        parentId: req.user.id
    };

    const MAX_LIMIT = 100;
    if (req.query.limit && parseInt(req.query.limit, 10) > MAX_LIMIT)
        req.query.limit = String(MAX_LIMIT);

    const features = new APIFeatures(Student.find(baseFilter), req.query)
        .filter()
        .sort()
        .limitField()
        .pagination();

    const myStudents = await features.query;

    if (!myStudents || myStudents.length === 0)
        return next(new AppError('Không tìm thấy học sinh nào của qúi phụ huynh', 404));

    res.status(200).json({
        status: 'success',
        amount: myStudents.length,
        data: myStudents
    })
});