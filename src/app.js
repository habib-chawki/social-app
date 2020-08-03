const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const homeRouter = require('../routes/home');
const userRouter = require('../routes/user');
const postRouter = require('../routes/post');
const commentRouter = require('../routes/comment');

const setDatabaseConnection = require('../db/connection');

const app = express();

// set database connection
setDatabaseConnection();

// use body parser for incoming requests
app.use(bodyParser.json());

// enable cors
app.use(cors());

// use routers
app.use('/', homeRouter);
app.use('/users', userRouter);
app.use('/posts', postRouter);
app.use('/comments', commentRouter);

module.exports = app;
