const express = require('express');
const router = express.Router();

const AdminController = require('../controllers/AdminController');

const UserValidator = require('../validators/UserValidator');

const Auth = require('../middlewares/AuthMiddleware');

const upload = require('../middlewares/UploadCourseImage');
const UploadLesson = require('../middlewares/UploadLessonMiddleware');

router.get('/ping', (req, res) => {
    res.json({pong: true});
});

router.post('/signin', (req, res) => res.json('signinadm'));
router.get('/signup', (req, res) => res.json('signup'));

router.post('/course', upload.single('banner'), AdminController.createCourse);

router.get('/course/modules', Auth.AuthMiddleware, AdminController.getModuleCourse);
router.post('/course/module', Auth.AuthMiddleware, AdminController.createModule);

router.post('/video/upload', Auth.AuthMiddleware, UploadLesson.single('lesson'), AdminController.createLesson);

module.exports = router;