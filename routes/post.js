const express = require('express');
const validator = require('validator');
const httpError = require('http-errors');

const auth = require('../middleware/auth');
const postService = require('../services/post-service');
const logger = require('../utils/logger');

const router = express.Router();

// require authentication for all incoming requests
router.use(auth);

// create post
router.post('/', (req, res, next) => {
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
      .then((createdPost) => res.status(201).send(createdPost))
      .catch((err) => next(err));
});

// get a single post by id
router.get('/:id', (req, res, next) => {
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
      .then((post) => res.status(200).send(post))
      .catch((err) => next(err));
});

// get list of posts
router.get('/', (req, res, next) => {
   // fetch posts of a specific user if 'user' query param is set
   // otherwise fetch all posts
   const query = req.query.user ? { owner: req.query.user } : {};

   // limit the number of posts
   const limit = req.query.limit ? req.query.limit : 10;
   const skip = req.query.skip ? req.query.skip : 0;

   postService
      .getPosts(query, skip, limit)
      .then((posts) => res.status(200).send(posts))
      .catch((err) => next(err));
});

// update post by id
router.put('/:id', (req, res, next) => {
   const postId = req.params.id;
   const { content } = req.body;

   // validate id
   if (!validator.isMongoId(postId)) {
      logger.error('Invalid post id ' + JSON.stringify({ postId }));
      next(httpError(400, 'Invalid id'));
   }

   // validate post content
   if (!content) {
      logger.error(
         'Post content should not be empty ' +
            JSON.stringify({ postId, content })
      );
      next(httpError(400, 'Post content should not be empty'));
   }

   postService
      .updatePost(postId, req.user._id, content)
      .then((updatedPost) => res.status(200).send(updatedPost))
      .catch((err) => next(err));
});

// delete post by id
router.delete('/:id', (req, res, next) => {
   const owner = req.user._id;
   const postId = req.params.id;

   // validate id
   if (!validator.isMongoId(postId)) {
      logger.error('Invalid post id ' + { postId });
      next(httpError(400, 'Invalid id'));
   }

   postService
      .deletePostById(postId, owner)
      .then((deletedPost) => res.status(200).send(deletedPost))
      .catch((err) => next(err));
});

// delete all posts
router.delete('/', (req, res, next) => {
   const owner = req.user._id;

   postService
      .deletePosts(owner)
      .then((numOfDeletedPosts) => res.send({ numOfDeletedPosts }))
      .catch((err) => next(err));
});

module.exports = router;
