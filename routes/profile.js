const express = require('express');
const auth = require('../utils/auth');

const router = express.Router();

// require authentication for all incoming requests
router.use(auth);

// get profile
router.get('/', (req, res) => {});

// create profile
router.post('/', (req, res) => {});

// update profile
router.post('/', (req, res) => {});

module.exports = router;
