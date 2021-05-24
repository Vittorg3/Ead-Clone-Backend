const express = require('express');
const router = express.Router();

const UserValidator = require('../validators/UserValidator');

const UserController = require('../controllers/UserController');

const Auth = require('../middlewares/AuthMiddleware');
const upload = require('../middlewares/UploadImageMiddleware');

router.get('/ping', (req, res) => {
    res.json({pong: true});
});

router.post('/user/signin', UserValidator.signin, UserController.signin);
router.post('/user/signup', UserValidator.signup, UserController.signup);

router.get('/user/me', Auth.AuthMiddleware, UserController.infoUser);
router.post('/user/me', Auth.AuthMiddleware, UserValidator.editUser, UserController.infoUserAction);

router.post('/user/avatar', Auth.AuthMiddleware, upload.single('avatar'), UserController.avatarAction);

router.get('/course/available', Auth.AuthMiddleware, UserController.courseAvailable);
router.get('/course/:nameCourse', Auth.AuthMiddleware, UserController.course);


router.get('/video/:urlVideo', UserController.watchVideo); //achar um jeito de colocar authentificação
router.get('/video/:urlVideo/:urlLesson', UserController.watchVideo);

router.post('/lesson/watched', Auth.AuthMiddleware, UserController.watchedLesson);

module.exports = router;