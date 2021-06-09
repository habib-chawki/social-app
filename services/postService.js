const httpError = require('http-errors');

const Post = require('../models/post');
const logger = require('../utils/logger');

async function createPost(userId, postContent) {
   try {
      // create new post
      const post = await Post.create({
         owner: userId,
         content: postContent,
      });

      // return post when created successfully
      logger.info('Post created ' + JSON.stringify({ userId, postContent }));
      return post;
   } catch (err) {
      logger.error(
         'Could not create post ' + JSON.stringify({ userId, postContent })
      );
      throw httpError(500, 'Could not create post');
   }
}

async function getPostById(postId) {
   try {
      // find post by id
      const post = await Post.findById(postId);

      // return post if found
      logger.info('Post found by id ' + JSON.stringify({ post }));
      return post;
   } catch (err) {
      logger.error('Post not found ' + JSON.stringify({ postId }));
      throw httpError(404, 'Post not found');
   }
}

async function getPosts(query, skip, limit) {
   try {
      // limit number of comments
      const numberOfComments = 5;

      // fetch list of posts
      const posts = await Post.find(query)
         .skip(parseInt(skip))
         .limit(parseInt(limit))
         .populate({ path: 'comments', perDocumentLimit: numberOfComments });

      logger.info('Fetched posts ' + JSON.stringify(posts));
      return posts;
   } catch (err) {
      logger.error('Could not fetch posts ' + err);
      throw httpError(404, 'Posts not found');
   }
}

module.exports = { createPost, getPostById, getPosts };
