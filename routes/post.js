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

      // return post if created successfuly
      if (post) {
         return res.status(201).send(post);
      }

      throw new Error('Unable to create post.');
   } catch (e) {
      res.status(500).send(e.message);
   }
});

// get all posts
router.get('/', async (req, res) => {
   try {
      // fetch list of posts
      const posts = await Post.find({});

      if (posts) {
         return res.status(200).send(posts);
      }

      throw new Error('Unable to fetch posts.');
   } catch (e) {
      res.status(404).send(e.message);
   }
});

// get posts of a particular user
router.get('/?:user', async (req, res) => {
   try {
      // fetch user's posts
      const posts = await Post.find({ owner: req.query.user });

      if (posts) {
         return res.status(200).send(posts);
      }

      throw new Error('Unable to fetch posts.');
   } catch (e) {
      res.status(404).send(e.message);
   }
});

// get a single post by id
router.get('/:id', async (req, res) => {
   // fetch post id
   const postId = req.params.id;

   try {
      // validate id
      if (!validator.isMongoId(postId)) {
         throw new Error('Invalid id.');
      }

      // find post by id
      const post = await Post.findById(postId);

      // return post if found
      if (post) {
         return res.status(200).send(post);
      }

      throw new Error('Post not found.');
   } catch (e) {
      res.status(404).send(e.message);
   }
});

// update post by id
router.put('/:id', async (req, res) => {
   const id = req.params.id;
   const content = req.body.content;

   try {
      // validate id
      if (!validator.isMongoId(id)) {
         throw new Error('Invalid id.');
      }

      const post = await Post.findByIdAndUpdate(id, {
         content,
      });

      if (post) {
         return res.status(200).send(post);
      }

      // throw an error if post can not be updated
      throw new Error(`Unable to update post.`);
   } catch (e) {
      res.status(404).send(e.message);
   }
});

// delete all posts
router.delete('/', async (req, res) => {
   const owner = req.user._id;

   try {
      // remove posts and return number of deleted documents
      const { deletedCount } = await Post.deleteMany({ owner });

      if (deletedCount) {
         return res.sendStatus(200);
      }

      throw new Error('Unable to delete posts.');
   } catch (e) {
      res.status(404).send(e.message);
   }
});

// delete post by id
router.delete('/:id', async (req, res) => {
   const owner = req.user._id;
   const id = req.params.id;

   try {
      // validate id
      if (!validator.isMongoId(id)) {
         throw new Error('Invalid id');
      }

      console.log(`owner = ${owner}, id = ${id}`);
      const post = await Post.findOneAndDelete({
         owner,
         _id: id,
      });

      console.log(post);
      if (post) {
         return res.status(200).send(post);
      }

      // post does not exist
      throw new Error('Unable to delete post.');
   } catch (e) {
      res.status(404).send(e.message);
   }
});

module.exports = router;
