const catchAsync = require("../utils/catchAsync");
const Schedule = require("../models/schedule.model");
const AppError = require("../utils/appError");
const Student = require("../models/student.model");
const Route = require("../models/route.model");

const Station = require('../models/station.model');
const { getDurationsBetweenStops } = require('../utils/ors');

exports.createSchedule = catchAsync(async (req, res, next) => {
    const { routeId, driverId, busId, direction, daysOfWeek, startDate, endDate, startTime } = req.body;

    const route = await Route.findById(routeId).select('orderedStops');
    if (!route) {
        return next(new AppError('Tuyến đường không tồn tại.', 404));
    }

    // Lấy tọa độ các trạm
    const stations = await Station.find({ _id: { $in: route.orderedStops } }).select('address.location');
    // Đảm bảo đúng thứ tự
    const stopsOrdered = route.orderedStops.map(id => stations.find(s => s._id.equals(id)));
    const stopsCoords = stopsOrdered.map(s => ({ lat: s.address.location.coordinates[1], lng: s.address.location.coordinates[0] }));

    // Lấy durations giữa các trạm
    let durations = [];
    if (stopsCoords.length > 1) {
        try {
            durations = await getDurationsBetweenStops(stopsCoords); // giây
        } catch (e) {
            return next(new AppError('Không lấy được durations từ ORS: ' + e.message, 500));
        }
    }

    // Tính arrivalTime từng trạm
    let arrivalTimes = [];
    let t = startTime || "07:00";
    let [h, m] = t.split(":").map(Number);
    let cur = new Date(2000, 0, 1, h, m, 0); // ngày giả định
    arrivalTimes.push(cur);
    for (let d of durations) {
        cur = new Date(cur.getTime() + d * 1000);
        arrivalTimes.push(cur);
    }

    // Format lại "HH:mm"
    const pad = n => n.toString().padStart(2, '0');
    const arrivalStrs = arrivalTimes.map(dt => pad(dt.getHours()) + ":" + pad(dt.getMinutes()));

    const generatedStopTimes = route.orderedStops.map((stationId, i) => ({
        stationId: stationId,
        arrivalTime: arrivalStrs[i],
        studentIds: []
    }));

    const newSchedule = await Schedule.create({
        routeId,
        driverId,
        busId,
        direction,
        daysOfWeek,
        startDate,
        endDate,
        stopTimes: generatedStopTimes
    });

    res.status(201).json({
        status: 'success',
        data: newSchedule
    });
});

// PATCH /api/v1/schedules/:id - Cập nhật thông minh arrivalTime nếu đổi route hoặc startTime
exports.updateSchedule = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { routeId, startTime } = req.body;
    let schedule = await Schedule.findById(id);
    if (!schedule) return next(new AppError('Không tìm thấy schedule', 404));

    let needUpdateTimes = false;
    let newRouteId = routeId || schedule.routeId;
    let newStartTime = startTime || (schedule.stopTimes[0]?.arrivalTime ?? "07:00");

    if (routeId || startTime) needUpdateTimes = true;

    let stopTimes = schedule.stopTimes;
    if (needUpdateTimes) {
        const route = await Route.findById(newRouteId).select('orderedStops');
        const stations = await Station.find({ _id: { $in: route.orderedStops } }).select('address.location');
        const stopsOrdered = route.orderedStops.map(id => stations.find(s => s._id.equals(id)));
        const stopsCoords = stopsOrdered.map(s => ({ lat: s.address.location.coordinates[1], lng: s.address.location.coordinates[0] }));
        let durations = [];
        if (stopsCoords.length > 1) {
            try {
                durations = await getDurationsBetweenStops(stopsCoords);
            } catch (e) {
                return next(new AppError('Không lấy được durations từ ORS: ' + e.message, 500));
            }
        }
        let arrivalTimes = [];
        let [h, m] = newStartTime.split(":").map(Number);
        let cur = new Date(2000, 0, 1, h, m, 0);
        arrivalTimes.push(cur);
        for (let d of durations) {
            cur = new Date(cur.getTime() + d * 1000);
            arrivalTimes.push(cur);
        }
        const pad = n => n.toString().padStart(2, '0');
        const arrivalStrs = arrivalTimes.map(dt => pad(dt.getHours()) + ":" + pad(dt.getMinutes()));
        stopTimes = route.orderedStops.map((stationId, i) => ({
            stationId: stationId,
            arrivalTime: arrivalStrs[i],
            studentIds: []
        }));
    }
    // Cập nhật các trường khác nếu có
    Object.assign(schedule, req.body, { stopTimes });
    await schedule.save();
    res.status(200).json({ status: 'success', data: schedule });
});
// GET /api/v1/schedules - Lấy tất cả schedules
exports.getAllSchedules = catchAsync(async (req, res, next) => {
    let filter = {};

    // Nếu là Parent, chỉ xem schedules có con mình
    if (req.user.role === 'Parent') {
        const childrenIds = (await Student.find({ parentId: req.user.id }).select('_id')).map(s => s._id);
        filter['stopTimes.studentIds'] = { $in: childrenIds };
    }
    // Admin/Manager/Driver thấy tất cả

    const schedules = await Schedule.find(filter)
        .populate('routeId', 'name')
        .populate('driverId', 'name')
        .populate('busId', 'licensePlate')
        .sort('-startDate');

    res.status(200).json({
        status: 'success',
        results: schedules.length,
        data: schedules
    });
});

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