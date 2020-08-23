const express = require('express');
const validator = require('validator');

const Comment = require('../models/comment');
const auth = require('../utils/auth');

const router = express.Router();

// require authentication for all incoming requests
router.use(auth);

// create a comment
router.post('/', async (req, res) => {
   try {
      const owner = req.user._id;
      const post = req.query.post;
      const content = req.body.content;

      // validate post id
      if (!validator.isMongoId(post)) {
         throw new Error('Invalid post id.');
      }

      // create comment
      const comment = await Comment.create({ owner, post, content });

      if (comment) {
         return res.status(201).send(comment);
      }

      throw new Error('Unable to add comment.');
   } catch (e) {
      res.status(400).send(e.message);
   }
});

// get a list of comments
router.get('/', async (req, res) => {
   try {
      const post = req.query.post;

      // validate post id
      if (!validator.isMongoId(post)) {
         throw new Error('Invalid post id.');
      }

      // fetch and return comments list
      const comments = await Comment.find({ post });

      if (comments) {
         return res.status(200).send(comments);
      }

      throw new Error('Unable to fetch commnets.');
   } catch (e) {
      res.status(404).send(e.message);
   }
});

// update a comment by id
router.put('/:id', async () => {
   try {
      const owner = req.user._id;
      const post = req.query.post;
      const id = req.params.id;
      const content = req.body.content;

      const comment = await Comment.findByIdAndUpdate(
         id,
         { owner, post, content },
         { new: true }
      );

      if (comment) {
         return res.status(200).send(comment);
      }

      throw new Error('Unable to update comment.');
   } catch (e) {
      res.status(400).send(e.message);
   }
});

// delete a comment by id
router.delete('/:id', async () => {
   try {
      const owner = req.user._id;
      const post = req.query.post;
      const id = req.params.id;

      const comment = await Comment.findByIdAndDelete(id, { owner, post });

      if (comment) {
         return res.status(200).send(comment);
      }

      throw new Error('Unable to delete comment.');
   } catch (e) {
      res.status(400).send(e.message);
   }
});

module.exports = router;
