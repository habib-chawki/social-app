const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const homeRouter = require('../routes/home');
const userRouter = require('../routes/user');
const profileRouter = require('../routes/profile');
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
app.use('/user', userRouter);
app.use('/profile', profileRouter);
app.use('/post', postRouter);
app.use('/comment', commentRouter);

module.exports = app;
