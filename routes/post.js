const express = require('express');
const validator = require('validator');
const createError = require('http-errors');

const Post = require('../models/post');
const auth = require('../middleware/auth');

const router = express.Router();

// require authentication for all incoming requests
router.use(auth);

// create post
router.post('/', async (req, res, next) => {
   try {
      const { content } = req.body;
      const { _id: userId } = req.user;

      // create new post
      const post = await Post.create({
         owner: userId,
         content,
      });

      // return post when created successfully
      if (post) {
         return res.status(201).send(post);
      }

      throw new Error('Create post failed');
   } catch (err) {
      next(createError(err));
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

// get list of posts
router.get('/', async (req, res) => {
   try {
      // fetch posts of a specific user if query string is set up
      const query = req.query.user ? { owner: req.query.user } : {};

      // limit the number of posts
      const limit = req.query.limit ? req.query.limit : 10;
      const skip = req.query.skip ? req.query.skip : 0;

      // limit number of comments
      const numberOfComments = 5;

      // fetch list of posts
      const posts = await Post.find(query)
         .skip(parseInt(skip))
         .limit(parseInt(limit))
         .populate({ path: 'comments', perDocumentLimit: numberOfComments });

      if (posts) {
         return res.status(200).send(posts);
      }

      throw new Error('Unable to fetch posts.');
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

      const post = await Post.findOneAndUpdate(
         { _id: id, owner: req.user._id },
         { content },
         { new: true }
      );

      if (post) {
         return res.status(200).send(post);
      }

      // throw an error if post can not be updated
      throw new Error(`Unable to update post.`);
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

      const post = await Post.findOneAndDelete({
         owner,
         _id: id,
      });

      if (post) {
         return res.status(200).send(post);
      }

      // post does not exist
      throw new Error('Unable to delete post.');
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
         return res.send({ deletedCount });
      }

      throw new Error('Unable to delete posts.');
   } catch (e) {
      res.status(404).send(e.message);
   }
});

module.exports = router;
