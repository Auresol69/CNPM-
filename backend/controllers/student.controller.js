const Student = require('../models/student.model');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const axios = require('axios');
const FormData = require('form-data');
const FaceData = require('../models/faceData.model');
const { uploadToCloudinary } = require('../utils/cloudinary');

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
        // Nếu lỗi đến từ service Python (có response trả về)
        // if (error.response && error.response.data && error.response.data) {
        //     // Trả về lỗi cụ thể từ service Python
        //     return next(new AppError(error.response.data.error, error.response.status));
        // }


        return next(new AppError(error, 500));
        // Nếu là lỗi khác (VD: không kết nối được service, timeout,...)
        return next(new AppError('Không thể kết nối hoặc dịch vụ AI gặp lỗi.', 500));
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