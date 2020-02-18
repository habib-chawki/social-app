const userModel = require('../models/user');
const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();

router.use(bodyParser.json());
// get user information
router.get('/', (req, res) => {
   res.status(200).send(req.body);
});

// add a new user
router.post('/', (req, res) => {
   userModel
      .create({
         name: req.body.name,
         email: req.body.email,
         password: req.body.password
      })
      .then(user => res.status(200).send('user added!'))
      .catch(err => res.status(400).send('could not add user!'));
});

module.exports = router;
