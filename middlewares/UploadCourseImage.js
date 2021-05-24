const multer = require('multer');
const uuid = require('uuid');
const jimp = require('jimp');

const path = require('path');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/images/banner');//não está salvando vindo do front
    },
    filename: function(req, file, cb) {
        cb(null, `${file.originalname}-${Date.now()}-${path.extname(file.originalname)}`)
    }
});

const upload = multer({storage});

module.exports = upload;