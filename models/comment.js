const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
   owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
   post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
   content: { type: String, required: true, trim: true },
});

module.exports = mongoose.model('Comment', commentSchema);
