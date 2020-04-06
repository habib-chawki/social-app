const validator = require('validator');
const postModel = require('../models/post');

async function editComment(req, res) {
   const userId = req.user._id;
   const { postId, commentId, newComment = undefined } = req.body;

   try {
      // validate comment and post id
      if (!validator.isMongoId(commentId) || !validator.isMongoId(postId)) {
         throw new Error('Invalid id.');
      }

      // find the post
      const post = await postModel.findById(postId);

      if (post) {
         // find comment
         const commentIndex = post.comments.findIndex((comment) =>
            comment._id.equals(commentId)
         );

         // comment found
         if (commentIndex != -1) {
            // check if user is authorized to edit (owns the comment)
            if (post.comments[commentIndex].owner.equals(userId)) {
               // check whether the comment is to be deleted or edited
               !newComment
                  ? post.comments.splice(commentIndex, 1)
                  : (post.comments[commentIndex].comment = newComment);

               // save changes
               await post.save();
               return res.status(200).send('Comment edited successfuly.');
            }
         }
      }

      // in case post or comment don't exist or user is unauthorized to edit comment (not theirs)
      throw new Error('Unable to edit comment.');
   } catch (e) {
      res.status(400).send(e.message);
   }
}

module.exports = editComment;
