const express = require('express');

const auth = require('../utils/authentication');
const postModel = require('../models/post');

const router = express.Router();

// get all posts
router.get('/all', auth, (req, res) => {
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
   // req.body contains the post content and the user (owner) info (returned from the auth middleware)
   const { content } = req.body;
   const owner = req.body.user;

   try {
      // create and associate post with owner
      const post = await postModel.create({
         owner: owner._id,
         content
      });

      // post created successfuly
      if (post) {
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

// delete post by id
router.delete('/:id', auth, async (req, res) => {
   try {
      // find and delete post by id
      const deletedPost = await postModel.findByIdAndDelete(req.params.id);
      if (deletedPost) {
         return res.status(200).send(`Post deleted successfuly ${deletedPost}`);
      }

      // Error deleting post
      throw new Error('Can not delete post');
   } catch (e) {
      res.status(404).send(e.message);
   }
});

module.exports = router;
