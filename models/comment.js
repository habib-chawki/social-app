const mongoose = require('mongoose');
const Post = require('./post');

const commentSchema = mongoose.Schema(
   {
      owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
      content: { type: String, required: true, trim: true },
   },
   {
      timestamps: true,
   }
);

commentSchema.post('save', async function () {
   // add comment to appropriate post
   const post = await Post.findById(this.post);
   post.comments.push(this._id);
   await post.save();
});

module.exports = mongoose.model('Comment', commentSchema);
