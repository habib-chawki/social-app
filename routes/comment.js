const express = require('express');
const validator = require('validator');

const postModel = require('../models/post');
const auth = require('../utils/authentication');

const router = express.Router();
router.use(auth);

// create a comment
router.post('/', async (req, res) => {
   try {
      // validate post id
      if (!validator.isMongoId(req.body.postId)) {
         throw new Error('Invalid post id.');
      }

      // find which post the comment belongs to
      const post = await postModel.findById(req.body.postId);

      // check if post exists and add comment to post's comments list
      if (post) {
         post.comments.push({ comment: req.body.comment });
         await post.save();
         return res
            .status(201)
            .send(`Comment added successfuly to post: ${post.content}`);
      }

      throw new Error('Error adding comment.');
   } catch (e) {
      res.status(404).send(e.message);
   }
});

// delete a comment by id
router.delete('/:id', async (req, res) => {
   try {
      // validate both comment and post ids
      if (
         !validator.isMongoId(req.params.id) ||
         !validator.isMongoId(req.body.postId)
      ) {
         throw new Error('Invalid id.');
      }

      // find which post the comment belongs to
      const post = await postModel.findById(req.body.postId);

      if (post) {
         // find comment's position in the comments' list by id
         // TODO: Fix => last comment is always deleted
         const commentToDeleteIndex = post.comments.findIndex(
            comment => comment._id === req.params.id
         );

         // remove comment and save changes
         post.comments.splice(commentToDeleteIndex, 1);
         await post.save();

         return res.status(200).send('Comment deleted successfuly.');
      }

      throw new Error('Unable to delete comment.');
   } catch (e) {
      res.status(400).send(e.message);
   }
});

// edit a comment by id
router.put('/:id', async (req, res) => {
   try {
      // validate both comment and post ids
      if (
         !validator.isMongoId(req.params.id) ||
         !validator.isMongoId(req.body.postId)
      ) {
         throw new Error('Invalid id.');
      }

      // find the post
      const post = await postModel.findById(req.body.postId);

      if (post) {
         // find comment
         const commentToEditIndex = post.comments.findIndex(comment =>
            comment._id.equals(req.params.id)
         );

         // replace comment with new comment and save changes
         post.comments[commentToEditIndex].comment = req.body.newComment;
         await post.save();

         return res.status(200).send('Comment edited successfuly.');
      }

      throw new Error('Unable to delete comment');
   } catch (e) {
      res.status(400).send(e.message);
   }
});

module.exports = router;
