const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const modelSchema = new mongoose.Schema({
    title: String,
    introduction: {
        title: String,
        url: String
    },
    modules: [{
        numberModule: Number,
        titleModule: String,
        lessons: [{
            title: String,
            numberLessons: Number,
            url: String,
            watched: [
                {
                    id: String
                }
            ]
        }]
    }]
});

const modelName = 'Course';

if(mongoose.connection && mongoose.connection.models[modelName]) {
    module.exports = mongoose.connection && mongoose.connection.models[modelName];
} else {
    module.exports = mongoose.model(modelName, modelSchema);
}

//cada uma terá um array de ids (user) que assistiram ao curso
//quando o front end redenrizar os módulos, cada aula irá verificar se  o id do usuário está la
//se tiver, assistido
//se não, não assistido