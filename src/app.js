const express = require('express');
const bodyParser = require('body-parser');

const homeRouter = require('../routes/home');
const userRouter = require('../routes/user');

const setDatabaseConnection = require('../db/connection');

const app = express();
const port = process.env.PORT;

// set database connection
setDatabaseConnection();

// use routers
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());
app.use('/', homeRouter);
app.use('/user', userRouter);

// set up server connection
app.listen(port, () => {
   console.log(`Up and running on port ${port}`);
});
