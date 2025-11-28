const User = require("../models/user.model");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};

    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el))
            newObj[el] = obj[el];
    });

    return newObj;
};

exports.getMe = catchAsync(async (req, res, next) => {
    res.status(200).json({
        status: 'success',
        data: req.user
    });
})

exports.updateMe = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    console.log(user);

    const filteredBody = filterObj(req.body, 'name');

    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    }).catch((error) => {
        return next(new AppError(`Có lỗi xảy ra: ${error}`, 406));
    });

    res.status(200).json({
        status: 'success',
        data: updatedUser
    });
});