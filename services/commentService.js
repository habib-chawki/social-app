const httpError = require('http-errors');

const Comment = require('../models/comment');
const logger = require('../utils/logger');

async function createComment(owner, post, content) {
   try {
      const comment = await Comment.create({ owner, post, content });

      if (comment) {
         logger.info(
            'Comment created ' + JSON.stringify({ owner, post, content })
         );
         return comment;
      }

      throw new Error('Create comment failed');
   } catch (err) {
      logger.error('Create comment failed ' + err);
      throw httpError(500, 'Create comment failed');
   }
}

module.exports = { createComment };
