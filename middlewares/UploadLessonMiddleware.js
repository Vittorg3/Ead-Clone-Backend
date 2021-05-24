const multer = require('multer');

const path = require('path');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/videos');
    },
    filename: function(req, file, cb) {
        let namelowcase = req.headers.namelesson.toLowerCase();
        let nameWithoutSpecialCarac  = namelowcase.replace("_", " ");
        let nameNormalized = nameWithoutSpecialCarac.normalize("NFD").replace(/([\u0300-\u036f]||)/g, '');
        let nameWithSlug = nameNormalized.trim().replace(/ /g, "-");

        cb(null, `${nameWithSlug}-${Date.now()}-${path.extname(file.originalname)}`);
    }
});

const upload = multer({storage});

module.exports = upload;