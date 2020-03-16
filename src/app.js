const express = require('express');
const bodyParser = require('body-parser');

const homeRouter = require('../routes/home');
const userRouter = require('../routes/user');
const profileRouter = require('../routes/profile');
const postRouter = require('../routes/post');
const commentRouter = require('../routes/comment');

const setDatabaseConnection = require('../db/connection');

const app = express();
const port = process.env.PORT;

// set database connection
setDatabaseConnection();

// use body parser for incoming requests
app.use(bodyParser.json());

// use routers
app.use('/', homeRouter);
app.use('/user', userRouter);
app.use('/profile', profileRouter);
app.use('/post', postRouter);
app.use('/comment', commentRouter);

// set up server connection
app.listen(port, () => {
   console.log(`Server up and running on port ${port}`);
});
