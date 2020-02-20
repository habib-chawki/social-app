const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const userModel = require('../models/user');

const router = express.Router();
router.use(bodyParser.json());

// get user information
router.get('/', (req, res) => {
   res.status(200).send(req.body);
});

// add a new user
router.post('/', async (req, res) => {
   const { name, email, password } = req.body;
   const salt = 8;

   try {
      const user = await userModel.create({
         name,
         email,
         password: await bcrypt.hash(password, salt)
      });

      res.status(201).send(`User created successfuly: ${user}`);
   } catch (e) {
      res.status(400).send(`Error: could not create user: ${e.message}`);
   }
});

module.exports = router;
