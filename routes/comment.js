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

      console.log(req.body.comment);
      // check if post exists and add comment to post's comments list
      if (post) {
         post.comments.push(req.body.comment);
         await post.save();
         return res
            .status(200)
            .send(`Comment added successfuly to post: ${post.content}`);
      }

      throw new Error('Error adding comment.');
   } catch (e) {
      res.status(404).send(e.message);
   }
});

// edit a comment by id
router.put('/:id', (req, res) => {});

// delete a comment by id
router.delete('/:id', (req, res) => {});
module.exports = router;
