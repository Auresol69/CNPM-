const catchAsync = require("../utils/catchAsync");
const Schedule = require("../models/schedule.model");
const AppError = require("../utils/appError");
const Student = require("../models/student.model");

// PATCH /api/v1/schedules/:scheduleId/stopTimes/:stationId/students

// Headerd: App/JSON
// Body: 
//  {
//  studentIds: [...]
//  }
exports.AddStudents = catchAsync(async (req, res, next) => {
    const { studentIds } = req.body;
    const { scheduleId, stationId } = req.params;


    if (!studentIds)
        return next(new AppError('studentIds là bắt buộc (query) để biết thêm vào stop nào', 400));

    if (!Array.isArray(studentIds) || studentIds.length === 0)
        return next(new AppError('studentIds phải là một mảng chứa ít nhất 1 id', 400));

    // Kiểm tra học sinh có tồn tại hong
    const uniqueIds = [...new Set(studentIds)];

    const count = await Student.countDocuments({ _id: { $in: uniqueIds } });

    if (count < uniqueIds.length)
        return next(new AppError('Có một vài studentId không tồn tại trong hệ thống.', 404));

    //

    const updateSchedule = await Schedule.findOneAndUpdate(
        {
            _id: scheduleId,
            'stopTimes.stationId': stationId
        },
        {
            $addToSet:
            {
                'stopTimes.$.studentIds':
                    { $each: uniqueIds }
            }
        },
        {
            new: true,
            runValidators: true
        }
    ).select('stopTimes');

    if (!updateSchedule) {
        return next(new AppError('Không tìm thấy Schedule hoặc Station tương ứng.', 404));
    }

    res.status(200).json({
        status: 'success',
        data: updateSchedule
    })
});