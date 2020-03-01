const express = require('express');
const auth = require('../utils/authentication');
const postModel = require('../models/post');

const router = express.Router();

// get posts
router.get('/posts', auth, (req, res) => {
   res.status(200).send('Posts !');
});

// add new post
router.post('/', auth, async (req, res) => {
   //req.body contains the post content and the user info (returned from the auth middleware)
   const { content } = req.body;

   try {
      const post = await postModel.create({
         owner: req.body.user._id,
         content
      });

      if (post) {
         return res.status(201).send(`Post created successfuly ${post}`);
      }

      throw new Error('Error creating post');
   } catch (e) {
      res.status(500).send(e.message);
   }
});

module.exports = router;
