const mongoose = require('mongoose');
const Post = require('./post');

const commentSchema = mongoose.Schema(
   {
      owner: {
         type: mongoose.Schema.Types.ObjectId,
         required: [true, 'User id is required'],
         ref: 'User',
      },
      post: {
         type: mongoose.Schema.Types.ObjectId,
         required: [true, 'Post id is required'],
         ref: 'Post',
      },
      content: {
         type: String,
         required: [true, 'Comment content is required'],
         trim: true,
      },
   },
   {
      timestamps: true,
   }
);

// add the newly created comment to the appropriate post's list of comments
commentSchema.post('save', async function () {
   // find the post
   const post = await Post.findById(this.post);

   // add the comment and save the updated post
   post.comments.push(this._id);
   await post.save();
});

// remove the newly deleted comment from the post's list of comments
commentSchema.post('findOneAndDelete', async function () {
   const comment = this.getQuery();
   const post = await Post.findById(comment.post);

   // delete comment
   const index = post.comments.indexOf(comment._id);
   post.comments.splice(index, 1);

   // save updated post
   await post.save();
});

module.exports = mongoose.model('Comment', commentSchema);
