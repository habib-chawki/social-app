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

      return res.status(201).send(comment);

      // // find which post the comment belongs to
      // const post = await Post.findById(postId);

      // // check if post exists and add comment to post's comments list
      // if (post) {
      //    post.comments.push({ content: req.body.content, owner: req.user._id });
      //    await post.save();

      //    // return the newly added comment (the last one in the comments list)
      //    return res.status(201).send(post.comments[post.comments.length - 1]);
      // }

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
