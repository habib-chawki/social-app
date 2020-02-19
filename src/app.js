const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const homeRouter = require('../routes/home');
const userRouter = require('../routes/user');

const app = express();
const port = process.env.PORT || 3000;

// set up database connection
const url = 'mongodb://localhost';
const portNum = '27017';
const dbName = 'db';

mongoose
   .connect(`${url}:${portNum}/${dbName}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true
   })
   .then(() => console.log('Connected successfully!'))
   .catch(err => console.log('Unable to connect', err));

// use routers
app.use(bodyParser.json());
app.use('/', homeRouter);
app.use('/user', userRouter);

// set up server connection
app.listen(port, () => {
   console.log(`Up and running on port ${port}`);
});
