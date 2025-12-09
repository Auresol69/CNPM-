const express = require('express');
const { getAllStudent, getMyStudents, registerStudentFace } = require('../controllers/student.controller');
const { authenticateToken } = require('../controllers/auth.controller');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

const route = express.Router();

route.use(authenticateToken);

route.get('/', getAllStudent);

route.get('/my-students', getMyStudents);

// Route này OK
route.post('/:id/face-data',
    upload.single('image'),
    registerStudentFace
);

module.exports = route;