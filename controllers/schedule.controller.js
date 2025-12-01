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

// GET /api/v1/schedules/:id/route
exports.getScheduleRoute = catchAsync(async (req, res, next) => {
   const scheduleId = req.params.id;
   
   const schedule = await Schedule.findById(scheduleId)
   .populate({
        path: 'routeId',
        select: 'name orderedStops shape distanceMeters durationSeconds',
        populate: {
            path: 'orderedStops',
            select: 'name address'
        }
    });

    if (!schedule || !schedule.routeId) {
        return next(new AppError('Không tìm thấy tuyến đường cho lịch trình này', 404));
    }

    const route = schedule.routeId;

    res.status(200).json({
        status: 'success',
        data: {
            routeName: route.name,
            // Dữ liệu vẽ đường (Polyline)
            shape: route.shape, 
            // Dữ liệu vẽ trạm (Markers)
            stops: route.orderedStops, 
            // Thông tin phụ
            distance: route.distanceMeters,
            duration: route.durationSeconds
        }
    });
});