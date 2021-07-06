const httpError = require('http-errors');

const Post = require('../models/post');
const User = require('../models/user');

const logger = require('../utils/logger');

async function createPost(userId, postContent) {
   try {
      // fetch post owner
      const postOwner = await User.findById(userId).select(
         'avatar profile.firstName profile.middleName profile.lastName'
      );

      // create new post
      const createdPost = await Post.create({
         owner: userId,
         content: postContent,
      });

      // associate post with owner
      const post = {
         ...createdPost,
         owner: {
            id: postOwner._id,
            avatar: postOwner.avatar,
            ...postOwner.profile,
         },
      };

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

async function getPosts(userId, skip, limit) {
   try {
      // limit number of comments
      const numberOfComments = 5;

      // fetch list of posts
      const posts = await Post.find(userId)
         .skip(parseInt(skip))
         .limit(parseInt(limit))
         .populate(
            'owner',
            'avatar profile.firstName profile.middleName profile.lastName'
         )
         .populate({ path: 'comments', perDocumentLimit: numberOfComments });

      logger.info('Fetched posts ' + JSON.stringify(posts));
      return posts;
   } catch (err) {
      logger.error('Could not fetch posts ' + err);
      throw httpError(404, 'Posts not found');
   }
}

async function updatePost(postId, postOwner, postContent) {
   try {
      const post = await Post.findOneAndUpdate(
         { _id: postId, owner: postOwner },
         { content: postContent },
         { new: true }
      );

      if (post) {
         logger.info('Post updated ' + JSON.stringify(post));
         return post;
      }

      throw new Error('Post update failed');
   } catch (err) {
      logger.error('Post update failed ' + err);
      throw httpError(500, 'Post update failed');
   }
}

async function deletePostById(postId, postOwner) {
   try {
      const post = await Post.findOneAndDelete({
         owner: postOwner,
         _id: postId,
      });

      if (post) {
         logger.info('Post deleted ' + JSON.stringify({ post }));
         return post;
      }

      throw httpError(500, 'Delete post failed');
   } catch (err) {
      logger.error('Delete post failed ' + err);
      throw httpError(500, 'Delete post failed');
   }
}

async function deletePosts(postsOwner) {
   try {
      // remove posts and return number of deleted documents
      const { deletedCount } = await Post.deleteMany({ owner: postsOwner });

      if (deletedCount) {
         logger.info('Deleted posts ' + { numOfDeletedPosts: deletedCount });
         return deletedCount;
      }

      throw httpError(500, 'Delete posts failed');
   } catch (err) {
      logger.error('Failed to delete posts ' + err);
      throw httpError(500, 'Delete posts failed');
   }
}

module.exports = {
   createPost,
   getPostById,
   getPosts,
   updatePost,
   deletePostById,
   deletePosts,
};
