const multer = require('multer');
const uuid = require('uuid');
const jimp = require('jimp');

const path = require('path');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/files');
    },
    filename: function(req, file, cb) {
        let namelowcase = req.headers.namefile.toLowerCase();
        cb(null, `${namelowcase}-${Date.now()}-${path.extname(file.originalname)}`)
    }
});

const upload = multer({storage});

module.exports = upload;