const fs = require('fs');

exports.removeAvatar = (path) => {
    const pathAvatar = path.split("http://localhost:3333")[1];
    fs.unlinkSync('public' + pathAvatar);
};