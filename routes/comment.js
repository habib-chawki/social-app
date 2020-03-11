const express = require('express');
const validator = require('validator');

const postModel = require('../models/post');
const auth = require('../utils/authentication');
const editComment = require('../utils/edit-comment');

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
   const postId = req.body.postId;
   const commentId = req.params.id;
   const toDelete = true;

   try {
      editComment({ postId, commentId, toDelete });
      res.status(200).send('Comment edited successfuly.');
   } catch (e) {
      res.status(400).send(e.message);
   }
});

// edit a comment by id
router.put('/:id', async (req, res) => {
   const postId = req.body.postId;
   const commentId = req.params.id;
   const newComment = req.body.newComment;

   try {
      editComment({ postId, commentId, newComment });
      res.status(200).send('Comment edited successfuly.');
   } catch (e) {
      res.status(400).send(e.message);
   }
});

module.exports = router;
