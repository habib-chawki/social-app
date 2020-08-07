const express = require('express');
const validator = require('validator');

const Post = require('../models/post');
const Comment = require('../models/comment');

const auth = require('../utils/auth');
const editComment = require('../utils/edit-comment');

const router = express.Router();

// require authentication for all incoming requests
router.use(auth);

// create a comment
router.post('/', async (req, res) => {
   // retrive post id from query string
   const { postId } = req.query.postId;

   try {
      // validate post id
      if (!validator.isMongoId(postId)) {
         throw new Error('Invalid post id.');
      }

      // create comment
      const comment = await Comment.create({
         owner: req.user._id,
         post: postId,
         content: req.body.content,
      });

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
   const postId = req.query.postId;
   try {
      // validate post id
      if (!validator.isMongoId(postId)) {
         throw new Error('Invalid post id.');
      }

      // fetch and return comments list
      const comments = await Comment.find({ post: postId });

      if (comments) {
         return res.status(200).send(comments);
      }

      throw new Error('Unable to fetch commnets.');
   } catch (e) {
      res.status(404).send(e.message);
   }
});

// delete a comment by id
router.delete('/:commentId', async () => {
   try {
      throw new Error('Unable to delete comment.');
   } catch (e) {
      res.status(400).send(e.message);
   }
});

// edit a comment by id
router.put('/:commentId', async () => {});

module.exports = router;
