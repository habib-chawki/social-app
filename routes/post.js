const express = require('express');

const auth = require('../utils/authentication');
const postModel = require('../models/post');
const userModel = require('../models/user');

const router = express.Router();

// get all posts
router.get('/', auth, (req, res) => {
   req.body.user.posts
      ? res.status(200).send(`Posts: ${req.body.user.posts}`)
      : res.status(404).send('Posts not found');
});

// get a single post by id
router.get('/:id', auth, async (req, res) => {
   try {
      // find post by id
      const post = await postModel.findById(req.params.id);
      if (post) {
         return res.status(200).send(post.content);
      }

      // throw error if post not found
      throw new Error('Post not found !');
   } catch (e) {
      res.status(404).send(e.message);
   }
});

// add new post
router.post('/', auth, async (req, res) => {
   //req.body contains the post content and the user info (returned from the auth middleware)
   const { content } = req.body;

   try {
      // create post and get owner info
      // const owner = await userModel.findById(req.body.user._id);
      const owner = req.body.user;
      const post = await postModel.create({
         owner: req.body.user._id,
         content
      });

      // post created successfuly and owner found
      if (post && owner) {
         // add new post to user's posts list
         owner.posts.push(post._id);
         await owner.save();
         return res.status(201).send(`Post created successfuly ${post}`);
      }

      throw new Error('Error creating post');
   } catch (e) {
      res.status(500).send(e.message);
   }
});

module.exports = router;
