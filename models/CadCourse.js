const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const modelSchema = new mongoose.Schema({
    title: String,
    course: String,
    img: String,
    status: String
});

const modelName = 'CourseAvailable';

if(mongoose.connection && mongoose.connection.models[modelName]) {
    module.exports = mongoose.connection && mongoose.connection.models[modelName];
} else {
    module.exports = mongoose.model(modelName, modelSchema);
}