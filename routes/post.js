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

      if (!content) {
         throw createError(400, 'Post content is required');
      }

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

      throw createError(500, 'Create post failed');
   } catch (err) {
      next(err);
   }
});

// get a single post by id
router.get('/:id', async (req, res, next) => {
   try {
      // fetch post id from request params
      const postId = req.params.id;

      if (!postId) {
         throw createError(400, 'Post id is required');
      }

      // validate id
      if (!validator.isMongoId(postId)) {
         throw createError(400, 'Invalid id');
      }

      // find post by id
      const post = await Post.findById(postId);

      // return post if found
      if (post) {
         return res.status(200).send(post);
      }

      throw createError(404, 'Post not found');
   } catch (err) {
      next(err);
   }
});

// get list of posts
router.get('/', async (req, res, next) => {
   try {
      // fetch posts of a specific user if query string is set up
      // otherwise fetch current user's posts
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

      throw new Error('Unable to fetch posts');
   } catch (err) {
      next(createError(404, err));
   }
});

// update post by id
router.put('/:id', async (req, res, next) => {
   try {
      const postId = req.params.id;
      const { content } = req.body;

      // validate id
      if (!validator.isMongoId(postId)) {
         throw createError(400, 'Invalid id');
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
      throw createError(500, 'Update post failed');
   } catch (err) {
      next(err);
   }
});

// delete post by id
router.delete('/:id', async (req, res, next) => {
   try {
      const owner = req.user._id;
      const postId = req.params.id;

      // validate id
      if (!validator.isMongoId(postId)) {
         throw createError(400, 'Invalid id');
      }

      const post = await Post.findOneAndDelete({
         owner,
         _id: postId,
      });

      if (post) {
         return res.status(200).send(post);
      }

      // post does not exist
      throw createError(500, 'Delete post failed');
   } catch (err) {
      next(err);
   }
});

// delete all posts
router.delete('/', async (req, res, next) => {
   try {
      const owner = req.user._id;

      // remove posts and return number of deleted documents
      const { deletedCount } = await Post.deleteMany({ owner });

      if (deletedCount) {
         return res.send({ deletedCount });
      }

      throw createError(500, 'Delete posts failed');
   } catch (err) {
      next(err);
   }
});

module.exports = router;
