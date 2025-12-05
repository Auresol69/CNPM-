const Trip = require('../models/trip.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('../utils/handlerFactory');
const scheduleModel = require('../models/schedule.model');
const studentModel = require('../models/student.model');
const NotificationModel = require('../models/notification.model');
const axios = require('axios');
const FormData = require('form-data');
const FaceData = require('../models/faceData.model');
const { uploadToCloudinary } = require('../utils/cloudinary');

// Sử dụng lại factory cho các hành động đơn giản
exports.getAllTrips = factory.selectAll(Trip);
exports.deleteTrip = factory.deleteOne(Trip);
exports.createTrip = factory.createOne(Trip);

exports.getTrip = catchAsync(async (req, res, next) => {

    const user = req.user;
    let query = { _id: req.params.id };

    if (req.user.role === 'Parent') {
        const childrenIds = (await studentModel.find({ parentId: user.id }).select('_id')).map(s => s._id);

        // Check xem có con mình ở trong trip đó không, thêm đk query
        query['studentStops.studentId'] = { $in: childrenIds };
    }
    const trip = await Trip.findOne(query)
        .populate({
            path: 'scheduleId',
            select: 'stopTimes',
            // 1. (Tùy chọn) hiển thị tên trạm trong danh sách giờ giấc
            populate: {
                path: 'stopTimes.stationId',
                select: 'name'
            }
        })
        .populate({
            path: 'routeId',
            select: 'name shape distanceMeters durationSeconds orderedStops',
            populate: {
                path: 'orderedStops',
                select: 'name address'
            }
        });

    if (!trip)
        return next(new AppError('Không tìm thấy chuyến đi', 404));

    res.status(200).json({
        status: 'success',
        data: trip
    });
});

/**
 * thay đổi tài xế/xe buýt khi chuyến đi đang diễn ra.
 */
exports.updateTrip = catchAsync(async (req, res, next) => {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
        return next(new AppError(`No trip found with that ID: ${req.params.id}`, 404));
    }

    // Ví dụ về nghiệp vụ: Không cho phép thay đổi thông tin quan trọng khi chuyến đi đang diễn ra
    if (trip.status === 'IN_PROGRESS' && (req.body.driverId || req.body.busId)) {
        return next(new AppError('Cannot change driver or bus while the trip is in progress.', 400));
    }

    // Tối ưu: Thay vì gọi lại factory (sẽ query lại DB),
    // Update trực tiếp trip đã tìm thấy.
    Object.assign(trip, req.body);

    // trip.save() sẽ kích hoạt hook pre('save') để kiểm tra xung đột
    const updatedTrip = await trip.save();

    res.status(200).json({
        status: 'success',
        data: {
            data: updatedTrip,
        },
    });
});

/**
 * Lấy các chuyến đi (trips) được phân công cho tài xế trong ngày hôm nay.
 */
exports.getMySchedule = catchAsync(async (req, res, next) => {
    const today = new Date();

    const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay();

    // 1. Tìm tất cả các lịch trình (schedules) đang hoạt động của tài xế cho ngày hôm nay
    const activeSchedules = await scheduleModel.find({
        driverId: req.user.id,
        isActive: true,
        startDate: { $lte: today },
        endDate: { $gte: today },
        daysOfWeek: dayOfWeek
    }).select('_id');

    if (!activeSchedules.length) {
        return res.status(200).json({
            status: 'success',
            results: 0,
            data: [], // Trả về mảng rỗng nếu không có lịch trình nào
        });
    }

    const scheduleIds = activeSchedules.map(s => s._id);
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const todaysTrips = await Trip.find({
        scheduleId: { $in: scheduleIds },
        tripDate: { $gte: startOfDay, $lte: endOfDay }
    }).populate({
        path: 'busId',
        select: 'licensePlate'
    });

    res.status(200).json({
        status: "success",
        results: todaysTrips.length,
        data: todaysTrips,
    });
});

exports.getStudents = catchAsync(async (req, res, next) => {
    const tripId = req.params.id;

    const trip = await Trip.findById(tripId).populate({
        path: 'studentStops.studentId',
        select: 'name grade'
    }).populate({
        path: 'studentStops.stationId',
        select: 'name'
    });

    if (!trip) {
        return next(new AppError("No trip found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: trip.studentStops
    });
});

/**
 * Cập nhật trạng thái của một học sinh trong một chuyến đi (check-in/check-out/absent).
 * @param {'PICKED_UP' | 'DROPPED_OFF' | 'ABSENT'} action - Hành động cần thực hiện.
 */
const updateStudentStatusInTrip = (action) => catchAsync(async (req, res, next) => {
    const tripId = req.params.id;
    const { studentId, stationId, evidenceUrl } = req.body;

    if (!studentId) {
        return next(new AppError("Please provide a studentId.", 400));
    }

    // Sử dụng findOneAndUpdate để tìm và cập nhật trong một thao tác (atomic)
    // Điều kiện: tìm đúng trip và đúng studentId trong mảng studentStops
    // Cập nhật: set action và timestamp cho studentStop tương ứng
    const updatedTrip = await Trip.findOneAndUpdate(
        {
            _id: tripId,
            'studentStops.studentId': studentId
        },
        {
            $set: {
                // Xu ly luon ca truong hop Student don tram sau
                'studentStops.$.stationId': stationId,
                'studentStops.$.action': action,

                'studentStops.$.timestamp': new Date(),

                ...(evidenceUrl && { 'studentStops.$.evidenceUrl': evidenceUrl })
            }
        },
        {
            new: true, // Trả về document đã được cập nhật
            runValidators: true
        }
    );

    if (!updatedTrip) {
        return next(new AppError('Trip not found or student not on this trip.', 404));
    }

    const currentStudentStop = updatedTrip.studentStops.find(s => s.studentId.toString() === studentId);

    if (currentStudentStop && (action === 'PICKED_UP' || action === 'DROPPED_OFF')) {
        const fieldToUpdate = action === 'PICKED_UP' ? 'pickupStopId' : 'dropoffStopId';

        const updatePayload = { [fieldToUpdate]: currentStudentStop.stationId };

        // tac vu doc lap nen khong can await
        studentModel.findByIdAndUpdate(studentId, { $set: updatePayload });
    }

    // (Như cũ - Báo cho live-map biết trạng thái đã thay đổi)
    req.io.to(`trip_${updatedTrip._id}`).emit('student:checked_in', {
        studentId: studentId,
        action: action,
        evidenceUrl: evidenceUrl || null
    });

    studentModel.findById(studentId).select('name parentId')
        .then(student => {
            if (!student || !student.parentId)
                return;

            let message;
            if (action === 'PICKED_UP') {
                message = `Con của bạn, ${student.name}, đã được đón lên xe.`;
            } else if (action === 'DROPPED_OFF') {
                message = `Con của bạn, ${student.name}, đã được trả xuống xe.`;
            } else if (action === 'ABSENT') {
                message = `Con của bạn, ${student.name}, đã bị đánh dấu vắng mặt.`;
            } else {
                return; // Không thông báo cho 'PENDING'
            }

            NotificationModel.create({
                recipientId: student.parentId,
                contextStudentId: studentId,
                message: message,
                evidenceUrl: evidenceUrl
            });

            req.io.to(`user:${student.parentId}`).emit(`notification:new`, {
                message: message,
                studentId: studentId,
                action: action,
                evidenceUrl: evidenceUrl || null
            });
        })
        .catch(err => console.error('Lỗi lưu notification:', err));


    res.status(200).json({
        status: 'success',
        message: `Student status updated to ${action}.`,
        data: updatedTrip.studentStops.find(s => s.studentId.toString() === studentId)
    });
});

/**
 * Check-in một học sinh.
 * Dựa vào `direction` của chuyến đi để quyết định trạng thái là 'PICKED_UP' hay 'DROPPED_OFF'.
 */
exports.checkIn = catchAsync(async (req, res, next) => {
    const trip = await Trip.findById(req.params.id).select('direction');
    if (!trip) {
        return next(new AppError('Trip not found.', 404));
    }

    const action = trip.direction === 'PICK_UP' ? 'PICKED_UP' : 'DROPPED_OFF';
    return updateStudentStatusInTrip(action)(req, res, next);
});

exports.markAsAbsent = updateStudentStatusInTrip('ABSENT');

exports.checkInWithFace = catchAsync(async (req, res, next) => {
    if (!req.file)
        return next(new AppError('Vui lòng gửi ảnh để nhận diện.', 400));

    const trip = await Trip.findById(req.params.id).select('direction studentStops');
    if (!trip) {
        return next(new AppError('Trip not found.', 404));
    }

    const expectedStudentIds = trip.studentStops.map(s => s.studentId);

    const knownFacesData = await FaceData.find({
        studentId: { $in: expectedStudentIds }
    })
        .select('studentId encoding');

    if (knownFacesData.length === 0) {
        return next(new AppError('Không tìm thấy dữ liệu FaceID của học sinh nào trong chuyến đi này. Vui lòng đảm bảo học sinh đã đăng ký FaceID và thuộc chuyến đi hiện tại.', 400));
    }

    // Python cần format:List of { studentId: "...", encoding: [...] }
    const knownFacesList = knownFacesData.map(face => ({
        studentId: face.studentId.toString(),
        encoding: face.encoding
    }));

    const formData = new FormData();
    formData.append('file', req.file.buffer, req.file.originalname);
    // '[{"studentId":"123", "encoding": [...]}]'
    formData.append('known_faces', JSON.stringify(knownFacesList));

    const PYTHON_URL = process.env.PYTHON_SERVICE_URL || 'http://127.0.0.1:3000';

    let studentId;
    let evidenceUrl;
    try {
        const [aiResponse, cloudUrl] = await Promise.all([
            axios.post(`${PYTHON_URL}/recognize`, formData, {
                headers: {
                    ...formData.getHeaders() // Header multipart + boundary
                }
            }),
            uploadToCloudinary(req.file.buffer, `school-bus/check-in/${new Date().getFullYear()}`)
        ]);

        studentId = aiResponse.data.data.studentId;
        evidenceUrl = cloudUrl;
    } catch (error) {
        // Nếu lỗi đến từ service Python (có response trả về)
        if (error.response && error.response.data) {
            // Service Python có thể trả về lỗi với key là 'error' hoặc 'message'
            const errorMessage = error.response.data.error || error.response.data.message;
            if (errorMessage) {
                // Trả về lỗi cụ thể từ service Python với đúng status code của nó
                return next(new AppError(errorMessage, error.response.status));
            }
        }

        // Nếu là lỗi khác (VD: không kết nối được, timeout, response không có message/error,...)
        return next(new AppError('Không thể kết nối hoặc dịch vụ AI gặp lỗi không xác định.', 500));
    }
    req.body.studentId = studentId;
    req.body.evidenceUrl = evidenceUrl;

    const action = trip.direction === 'PICK_UP' ? 'PICKED_UP' : 'DROPPED_OFF';

    return updateStudentStatusInTrip(action)(req, res, next);
});