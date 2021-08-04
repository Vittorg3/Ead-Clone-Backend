require('dotenv').config();

const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
});
mongoose.Promise = global.Promise;
mongoose.connection.on('error', (error) => {
    console.log(`Error: ${error.message}`);
});

const express = require('express');
const app = express();

const routerUser = require('./routes/routeUser');
const routerAdmin = require('./routes/routeAdmin');

const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));

app.use('/api', routerUser);
app.use('/api/admin', routerAdmin);


app.listen(process.env.PORT, () =>  console.log('rodando'));