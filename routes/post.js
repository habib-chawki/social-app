const express = require('express');
const validator = require('validator');

const Post = require('../models/post');
const auth = require('../utils/auth');

const router = express.Router();

// require authentication for all incoming requests
router.use(auth);

// create post
router.post('/', async (req, res) => {
   const { content } = req.body;
   const owner = req.user;

   try {
      // create and associate post with owner
      const post = await Post.create({
         owner: owner._id,
         content,
      });

      // post created successfuly
      if (post) {
         // add new post to user's posts list and return it
         owner.posts.unshift(post._id);
         await owner.save();

         // return post
         return res.status(201).send(post);
      }

      throw new Error('Error creating post.');
   } catch (e) {
      res.status(500).send(e.message);
   }
});

// get current user's posts
router.get('/all', (req, res) => {
   req.user.posts
      ? res.status(200).send(req.user.posts)
      : res.status(404).send('No posts.');
});

// get a single post by id
router.get('/:postId', async (req, res) => {
   try {
      // validate id
      if (!validator.isMongoId(req.params.postId)) {
         throw new Error('Invalid id.');
      }

      // find post by id
      const post = await Post.findById(req.params.postId);
      if (post) {
         return res.status(200).send(post.content);
      }

      // throw error if post not found
      throw new Error('Post not found.');
   } catch (e) {
      res.status(404).send(e.message);
   }
});

// update posts by id
router.patch('/:postId', async (req, res) => {
   // validate id
   if (!validator.isMongoId(req.params.postId)) {
      throw new Error('Invalid id.');
   }

   try {
      const post = await Post.findByIdAndUpdate(req.params.postId, {
         content: req.body.content,
      });

      if (post) {
         return res.status(200).send(post);
      }

      // throw an error if post can not be found
      throw new Error(`Can not update post.`);
   } catch (e) {
      res.status(500).send(e.message);
   }
});

// delete all posts
router.delete('/all', async (req, res) => {
   const { user } = req;

   try {
      // empty user's posts list
      user.posts = [];
      await user.save();

      // remove posts from collection
      await Post.deleteMany({ owner: user._id });

      res.status(200).send(`Posts list is empty: ${user.posts}`);
   } catch (e) {
      res.status(500).send(e.message);
   }
});

// delete post by id
router.delete('/:postId', async (req, res) => {
   const { user } = req;
   try {
      // validate id
      if (!validator.isMongoId(req.params.postId)) {
         throw new Error('Invalid id');
      }

      // find post by id
      const postToDelete = await Post.findById(req.params.postId);

      // validate post existence
      if (postToDelete) {
         // validate that post belongs to logged-in user (find the post position in the list of posts)
         const postToDeleteIndex = user.posts.findIndex((post) =>
            post._id.equals(postToDelete._id)
         );

         // -1 => logged-in user is not the post owner
         if (postToDeleteIndex != -1) {
            // delete post from posts collection and from the user's posts list
            await Post.deleteOne({ _id: req.params.postId });
            user.posts.splice(postToDeleteIndex, 1);
            await user.save();
         } else {
            throw new Error('Can not delete posts of others.');
         }

         // post exists and user has the right to delete it
         return res
            .status(200)
            .send(`Post deleted successfuly ${postToDelete}`);
      }

      // post does not exist
      throw new Error('Error deleting post.');
   } catch (e) {
      res.status(404).send(e.message);
   }
});

module.exports = router;
