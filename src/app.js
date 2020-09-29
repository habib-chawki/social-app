const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const homeRouter = require('../routes/home');
const userRouter = require('../routes/user');
const postRouter = require('../routes/post');
const commentRouter = require('../routes/comment');

const setDatabaseConnection = require('../db/connection');

const errorHandler = require('../middleware/error-handler');

const app = express();

// set database connection
setDatabaseConnection();

// use body parser for incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// enable cors
app.use(cors());

// use routers and delegate requests
app.use('/', homeRouter);
app.use('/users', userRouter);
app.use('/posts', postRouter);
app.use('/comments', commentRouter);

// use error handling middleware
app.use(errorHandler);

module.exports = app;
