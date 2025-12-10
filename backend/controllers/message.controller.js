const Message = require("../models/message.model");
const APIFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getMyMessage = catchAsync(async (req, res, next) => {
    const baseFilter = {
        $or:
            [
                { senderId: req.user.id },
                { receiverId: req.user.id }
            ]
    }

    const MAX_LIMIT = 100;
    if (req.query.limit && parseInt(req.query.limit, 10) > MAX_LIMIT)
        req.query.limit = String(MAX_LIMIT);

    const features = new APIFeatures(Message.find(baseFilter), req.query)
        .filter()
        .sort()
        .limitField()
        .pagination();

    const messages = await features.query;

    res.status(200).json({
        status: 'success',
        results: messages.length,
        data: messages
    });
});