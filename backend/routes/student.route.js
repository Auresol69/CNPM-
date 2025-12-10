const express = require('express');
const { 
    getAllStudent, 
    getMyStudents, 
    registerStudentFace,
    getStudent,
    createStudent,
    updateStudent,
    deleteStudent
} = require('../controllers/student.controller');
const { authenticateToken } = require('../controllers/auth.controller');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

const route = express.Router();

route.use(authenticateToken);

route.get('/', getAllStudent);
route.post('/', createStudent);

route.get('/my-students', getMyStudents);

route.get('/:id', getStudent);
route.patch('/:id', updateStudent);
route.delete('/:id', deleteStudent);

// Route đăng ký khuôn mặt
route.post('/:id/face-data',
    upload.single('image'),
    registerStudentFace
);

module.exports = route;