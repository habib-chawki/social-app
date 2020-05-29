const express = require('express');
const validator = require('validator');

const Post = require('../models/post');
const auth = require('../utils/auth');
const editComment = require('../utils/edit-comment');

const router = express.Router();

// require authentication for all incoming requests
router.use(auth);

// create a comment
router.post('/', async (req, res) => {
   try {
      // validate post id
      if (!validator.isMongoId(req.body.postId)) {
         throw new Error('Invalid post id.');
      }

      // find which post the comment belongs to
      const post = await Post.findById(req.body.postId);

      // check if post exists and add comment to post's comments list
      if (post) {
         post.comments.push({ comment: req.body.comment, owner: req.user._id });
         await post.save();

         // return the newly added comment (the last one in the comments list)
         return res.status(201).send(post.comments[post.comments.length - 1]);
      }

      throw new Error('Error adding comment.');
   } catch (e) {
      res.status(400).send(e.message);
   }
});

// delete a comment by id
router.delete('/', editComment);

// edit a comment by id
router.put('/', editComment);

module.exports = router;
