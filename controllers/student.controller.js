const Student = require('../models/student.model')
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getMyStudents = catchAsync(async (req, res, next) => {
    const myStudents = await Student.find({ parentId: req.user.id })
        .catch((error) => {
            return next(new AppError(`Có lỗi xảy ra: ${error}`, 406));
        });
    
    res.status(200).json({
        status: 'success',
        amount: myStudents.length,
        data: myStudents
    })
});