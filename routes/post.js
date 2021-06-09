const express = require('express');
const validator = require('validator');
const httpError = require('http-errors');

const Post = require('../models/post');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');
const postService = require('../services/postService');

const router = express.Router();

// require authentication for all incoming requests
router.use(auth);

// create post
router.post('/', async (req, res, next) => {
   const { content } = req.body;
   const { _id: userId } = req.user;

   if (!content) {
      logger.error(
         'Post content is required ' +
            JSON.stringify({ userId, postContent: content })
      );
      next(httpError(400, 'Post content is required'));
   }

   postService
      .createPost(userId, content)
      .then((createdPost) => {
         return res.status(201).send(createdPost);
      })
      .catch((err) => {
         next(err);
      });
});

// get a single post by id
router.get('/:id', async (req, res, next) => {
   // extract post id param
   const postId = req.params.id;

   if (!postId) {
      logger.error('Post id is required ' + JSON.stringify({ postId }));
      next(httpError(400, 'Post id is required'));
   }

   // validate id
   if (!validator.isMongoId(postId)) {
      logger.error('Invalid post id ' + JSON.stringify({ postId }));
      next(httpError(400, 'Invalid id'));
   }

   // find post by id
   postService
      .getPostById(postId)
      .then((post) => {
         return res.status(200).send(post);
      })
      .catch((err) => {
         next(err);
      });
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

      throw httpError(404, 'Posts not found');
   } catch (err) {
      next(err);
   }
});

// update post by id
router.put('/:id', async (req, res, next) => {
   try {
      const postId = req.params.id;
      const { content } = req.body;

      // validate id
      if (!validator.isMongoId(postId)) {
         throw httpError(400, 'Invalid id');
      }

      const post = await Post.findOneAndUpdate(
         { _id: postId, owner: req.user._id },
         { content },
         { new: true }
      );

      if (post) {
         return res.status(200).send(post);
      }

      // throw an error if post can not be updated
      throw httpError(500, 'Update post failed');
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
         throw httpError(400, 'Invalid id');
      }

      const post = await Post.findOneAndDelete({
         owner,
         _id: postId,
      });

      if (post) {
         return res.status(200).send(post);
      }

      // post does not exist
      throw httpError(500, 'Delete post failed');
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

      throw httpError(500, 'Delete posts failed');
   } catch (err) {
      next(err);
   }
});

module.exports = router;
