const express = require('express');
const validator = require('validator');
const httpError = require('http-errors');

const Comment = require('../models/comment');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// require authentication for all incoming requests
router.use(auth);

// create a comment
router.post('/', async (req, res, next) => {
   try {
      const owner = req.user._id;
      const post = req.query.post;
      const content = req.body.content;

      // validate post id
      if (!validator.isMongoId(post)) {
         throw httpError(400, 'Invalid post id');
      }

      // create comment
      const comment = await Comment.create({ owner, post, content });

      if (comment) {
         return res.status(201).send(comment);
      }

      throw httpError(500, 'Create comment failed');
   } catch (err) {
      next(err);
   }
});

// get a list of comments
router.get('/', async (req, res, next) => {
   try {
      const post = req.query.post;

      // validate post id
      if (!validator.isMongoId(post)) {
         throw crateError(400, 'Invalid post id');
      }

      // limit number of comments
      const limit = req.query.limit ? req.query.limit : 5;
      const skip = req.query.skip ? req.query.skip : 0;

      // fetch and return comments list
      const comments = await Comment.find({ post })
         .skip(parseInt(skip))
         .limit(parseInt(limit));

      if (comments) {
         return res.status(200).send(comments);
      }

      throw httpError(404, 'Fetching comments failed');
   } catch (err) {
      next(err);
   }
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
         throw crateError(400, 'Invalid id');
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
