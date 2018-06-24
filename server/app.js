const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const router = require('./router');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//     next();
// });

app.use(router);

// error handler
app.use((err, req, res, next) => {
    next(err);
});

module.exports = app;
