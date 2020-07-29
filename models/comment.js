const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
   owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
   post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
   content: String,
});

module.export = mongoose.model('Comment', commentSchema);
