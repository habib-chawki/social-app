const express = require('express');
const validator = require('validator');
const httpError = require('http-errors');

const Comment = require('../models/comment');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');
const commentService = require('../services/comment-service');

const router = express.Router();

// require authentication for all incoming requests
router.use(auth);

// create a comment
router.post('/', (req, res, next) => {
   const owner = req.user._id;
   const post = req.query.post;
   const content = req.body.content;

   // validate post id
   if (!validator.isMongoId(post)) {
      logger.error('Invalid post id ' + JSON.stringify({ postId: post }));
      next(httpError(400, 'Invalid post id'));
   }

   commentService
      .createComment(owner, post, content)
      .then((createdComment) => res.status(201).send(createdComment))
      .catch((err) => next(err));
});

// get a list of comments
router.get('/', async (req, res, next) => {
   const post = req.query.post;

   // set pagination params, limit the number of comments
   const limit = req.query.limit ? req.query.limit : 5;
   const skip = req.query.skip ? req.query.skip : 0;

   // validate post id
   if (!validator.isMongoId(post)) {
      logger.error('Invalid post id ' + JSON.stringify({ postId: post }));
      next(httpError(400, 'Invalid post id'));
   }

   commentService
      .getComments(post, skip, limit)
      .then((comments) => res.status(200).send(comments))
      .catch((err) => next(err));
});

// update a comment by id
router.put('/:id', async (req, res, next) => {
   try {
      const owner = req.user._id;
      const post = req.query.post;
      const id = req.params.id;
      const content = req.body.content;

      // validate id
      if (!validator.isMongoId(post) || !validator.isMongoId(id)) {
         logger.error(
            'Invalid id ' + JSON.stringify({ postId: post, commentId: id })
         );
         next(httpError(400, 'Invalid id'));
      }

      if (!content) {
         next(httpError(400, 'Comment content is required'));
      }

      const comment = await Comment.findOneAndUpdate(
         { _id: id, owner, post },
         { content },
         { new: true }
      );

      if (comment) {
         return res.status(200).send(comment);
      }

      throw httpError(500, 'Update comment failed');
   } catch (err) {
      next(err);
   }
});

// delete a comment by id
router.delete('/:id', async (req, res, next) => {
   try {
      const owner = req.user._id;
      const post = req.query.post;
      const id = req.params.id;

      // validate id
      if (!validator.isMongoId(post) || !validator.isMongoId(id)) {
         throw crateError(400, 'Invalid id');
      }

      const comment = await Comment.findOneAndDelete({ _id: id, owner, post });

      if (comment) {
         return res.status(200).send(comment);
      }

      throw httpError(500, 'Delete comment failed');
   } catch (err) {
      next(err);
   }
});

module.exports = router;
