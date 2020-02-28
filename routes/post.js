const express = require('express');

const router = express.Router();

// get posts
router.get('/posts', (req, res) => {
   res.status(200).send('Posts !');
});

module.exports = router;
