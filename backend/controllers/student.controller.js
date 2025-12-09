const Student = require('../models/student.model');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const axios = require('axios');
const FormData = require('form-data');
const FaceData = require('../models/faceData.model');
const { uploadToCloudinary } = require('../utils/cloudinary');

exports.getAllStudent = catchAsync(async (req, res, next) => {
    const MAX_LIMIT = 100;
    if (req.query.limit && parseInt(req.query.limit, 10) > MAX_LIMIT)
        req.query.limit = String(MAX_LIMIT);

    const features = new APIFeatures(Student.find(), req.query)
        .filter()
        .sort()
        .limitField()
        .pagination();

    const students = await features.query.populate('parentId', 'name');

    res.status(200).json({
        status: 'success',
        amount: students.length,
        data: students
    });
});

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

    const myStudents = await features.query.populate('parentId', 'name');

    if (!myStudents || myStudents.length === 0)
        return next(new AppError('Không tìm thấy học sinh nào của qúi phụ huynh', 404));

    res.status(200).json({
        status: 'success',
        amount: myStudents.length,
        data: myStudents
    })
});

exports.registerStudentFace = catchAsync(async (req, res, next) => {
    const studentId = req.params.id;

    if (!req.file)
        return next(new AppError('Vui lòng tải lên ảnh chân dung', 400));

    const student = await Student.findById(studentId);

    if (!student)
        return next(new AppError('Học sinh không tồn tại.', 404));

    const formData = new FormData();
    formData.append('file', req.file.buffer, req.file.originalname);

    const PYTHON_URL = process.env.PYTHON_SERVICE_URL || 'http://127.0.0.1:3000';

    let encoding;
    let imageUrl;

    try {
        const [aiResponse, cloudUrl] = await Promise.all([
            // Task AI
            axios.post(`${PYTHON_URL}/register`, formData, {
                headers: {
                    ...formData.getHeaders()
                }
            }),
            // Task Cloudinary
            uploadToCloudinary(req.file.buffer, 'school-bus/faces')
        ]);

        encoding = aiResponse.data.encoding;
        imageUrl = cloudUrl;
    } catch (error) {
        console.error('Face registration error:', error.message);

        // Nếu lỗi từ service Python
        if (error.response?.data?.error) {
            return next(new AppError(error.response.data.error, error.response.status || 500));
        }

        // Lỗi khác (network, timeout, cloudinary...)
        return next(new AppError('Không thể đăng ký khuôn mặt: ' + error.message, 500));
    }

    const faceData = await FaceData.findOneAndUpdate({
        studentId: studentId
    }, {
        $set: {
            studentId: studentId,
            encoding: encoding,
            // Chỗ này nên là URL của ảnh sau khi đã được lưu ở đâu đó (S3, Cloudinary,...)
            imageUrl: imageUrl
        },
    }, {
        upsert: true, // Có thì update, chưa có tạo mới
        new: true
    });

    res.status(201).json({
        'status': 'success',
        message: 'Đăng ký khuôn mặt thành công!',
        data: {
            studentId,
            imageUrl
        }
    });
});