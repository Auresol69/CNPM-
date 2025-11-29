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
exports.createStation = factory.createOne(Station);
exports.deleteStation = factory.deleteOne(Station);

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
    const end = `${station.address.longitude},${station.address.latitude}`;

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

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const [studentsNearBy, activeSchedules] = await Promise.all(
        [
            Student.find({
                location: {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: [station.address.longitude, station.address.latitude]
                        },
                        $maxDistance: 500
                    }
                }
            }).select('name grade location'),
            Schedule.find({
                isActive: true,
                'stopTimes.stationId': req.params.id,
                startDate: { $lte: today },
                endDate: { $gte: today }
            }).select('stopTimes')
        ]);

    const assignedStudentIds = new Set();

    activeSchedules.forEach(schedule => {
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