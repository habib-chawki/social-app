const validator = require('validator');
const postModel = require('../models/post');

async function editComment({
   postId,
   commentId,
   newComment = '',
   toDelete = false
}) {
   // validate comment and post id
   if (!validator.isMongoId(commentId) || !validator.isMongoId(postId)) {
      throw new Error('Invalid id.');
   }

   // find the post
   const post = await postModel.findById(postId);

   if (post) {
      // find comment
      const commentIndex = post.comments.findIndex(comment =>
         comment._id.equals(commentId)
      );

      // check whether the comment is to be deleted or edited
      toDelete
         ? post.comments.splice(commentIndex, 1)
         : (post.comments[commentIndex].comment = newComment);

      // save changes
      return await post.save();
   }

   // erroneous editing
   throw new Error('Unable to edit comment.');
}

module.exports = editComment;
