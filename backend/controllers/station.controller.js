const catchAsync = require("../utils/catchAsync");
const Station = require("../models/station.model");
const factory = require('../utils/handlerFactory');
const AppError = require('../utils/appError');
const axios = require("axios");
const Schedule = require("../models/schedule.model");
const Student = require("../models/student.model");
require('dotenv').config();

const ORS_API_KEY = process.env.ORS_API_KEY;

exports.getAllStations = factory.selectAll(Station);
exports.deleteStation = factory.deleteOne(Station);

// Để check xem có chọn trùng trạm hoặc gần với trạm đã tồn tại trước đó không
exports.createStation = catchAsync(async (req, res, next) => {
    const { name, street, city, district, fullAddress, lat, lng } = req.body;

    const newLocation = {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)]
    };


    // Chỉ cần 1 trạm ở gần thì cảnh báo
    // $maxDistance phải > APPROACHING + DEPARTED = 150m + 120m = 270m
    const existingStation = await Station.findOne({
        'address.location': {
            $near: {
                $geometry: newLocation,
                $maxDistance: 270 // m (phải > APPROACHING + DEPARTED = 270m)
            }
        }
    });

    if (existingStation)
        return next(new AppError(`Không thể tạo. Đã có trạm "${existingStation.name}" nằm quá gần vị trí này (trong vòng 250m).`, 400));

    const newStation = await Station.create({
        name,
        address: {
            street,
            city,
            district,
            fullAddress,
            location: newLocation
        }
    });

    res.status(202).json({
        'status': 'success',
        'data': newStation
    });
});

// API: GET /api/v1/stations/:id/walking-directions?lat=...&lng=...
exports.getWalkingDirectionsToStation = catchAsync(async (req, res, next) => {
    const stationId = req.params.id;
    // Tọa độ current của user
    const { lat, lng } = req.query;

    if (!lat || !lng)
        return next(new AppError('Vui lòng cung cấp tọa độ current (lat, lng).', 400));

    const station = await Station.findById(stationId);

    if (!station)
        return next(new AppError('Trạm không tồn tại.', 404));

    const start = `${lng},${lat}`;
    const end = `${station.address.location.coordinates[0]},${station.address.location.coordinates[1]}`;

    try {
        const url = `https://api.openrouteservice.org/v2/directions/foot-walking?start=${start}&end=${end}`;

        const response = await axios.get(url, {
            headers: { 'Authorization': ORS_API_KEY }
        });

        const routeData = response.data.features[0];

        res.status(200).json({
            status: 'success',
            data: {
                destination: station.name,
                distanceMeters: routeData.properties.summary.distance,
                durationSeconds: routeData.properties.summary.duration,
                shape: routeData.geometry,
                steps: routeData.properties.segments[0].steps
            }
        });
    } catch (error) {
        console.log("ORS Error:", error.response?.data || error.message);
        return next(new AppError('Không tìm được đường đi bộ.', 500));
    }
});

exports.getStation = catchAsync(async (req, res, next) => {
    const station = await Station.findById(req.params.id);

    if (!station)
        return next(new AppError(`No station found with that ID: ${req.params.id}`, 404));

    // Lấy ngày hiện tại theo UTC+7 (Vietnam timezone)
    const now = new Date();
    const vietnamOffset = 7 * 60; // UTC+7 = 420 minutes
    const localTime = new Date(now.getTime() + vietnamOffset * 60 * 1000);
    
    const today = new Date(Date.UTC(
        localTime.getUTCFullYear(),
        localTime.getUTCMonth(),
        localTime.getUTCDate(),
        0, 0, 0, 0
    ));

    const [studentsNearBy, allSchedules] = await Promise.all(
        [
            Student.find({
                location: {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: [station.address.location.coordinates[0], station.address.location.coordinates[1]]
                        },
                        $maxDistance: 500
                    }
                }
            }).select('name grade location'),
            // Tìm TẤT CẢ schedules có chứa trạm này (không check ngày tháng, isActive)
            Schedule.find({
                'stopTimes.stationId': req.params.id
            }).select('stopTimes')
        ]);

    const assignedStudentIds = new Set();

    allSchedules.forEach(schedule => {
        const stop = schedule.stopTimes.find(s => s.stationId.toString() === req.params.id);
        if (stop && stop.studentIds)
            stop.studentIds.forEach(id => assignedStudentIds.add(id.toString()));
    });

    console.log(assignedStudentIds);

    const results = studentsNearBy.map(student => {
        const isAssigned = assignedStudentIds.has(student._id.toString());
        return {
            ...student.toObject(),
            isAssigned: isAssigned // True nếu đã được gán và ngược lại
        }
    });

    res.status(200).json({
        status: 'success',
        data: {
            station,
            students: results
        }
    });
}); 