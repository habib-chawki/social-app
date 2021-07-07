const postService = require('../../services/post-service');

const Post = require('../../models/post');
const User = require('../../models/user');

const post = {
   _id: '507f1f77bcf86cd799439010',
   owner: '507f1f77bcf86cd799439020',
   content: 'This is a post',
   comments: [],
};

const post2 = {
   _id: '507f1f77bcf86cd799439011',
   owner: '507f1f77bcf86cd799439020',
   content: 'This is another post',
   comments: [],
};

const postOwner = {
   _id: '507f1f77bcf86cd799439020',
   profile: {
      firstName: 'first',
      middleName: 'mid',
      lastName: 'last',
   },
};

it('should create post', async () => {
   // given the post model create() response
   Post.create = jest.fn().mockReturnValue(post);

   User.findById = jest.fn(() => ({
      select: jest.fn().mockReturnValue(postOwner),
   }));

   // given the expected response
   const expectedResponse = {
      ...post,
      owner: postOwner,
   };

   // when createPost() is invoked
   const response = await postService.createPost(post.owner, post.content);

   // then expect the post to have been created
   expect(response).toEqual(expectedResponse);
});

it('should get post by id', async () => {
   // given the post model findById() response
   Post.findById = jest.fn().mockReturnValue(post);

   // when a request to get the post by id is made
   const fetchedPost = await postService.getPostById(post._id);

   // then expect the post to have been fetched successfully
   expect(fetchedPost).toEqual(post);
});

it('should get posts', async () => {
   // given the post model find() response
   Post.find = jest.fn(() => ({
      skip: jest.fn(() => ({
         limit: jest.fn(() => ({
            populate: jest.fn(() => ({
               populate: jest.fn().mockReturnValue([post, post2]),
            })),
         })),
      })),
   }));

   // when a request to get a user's list of posts
   const fetchedPosts = await postService.getPosts(post.owner, 0, 10);

   // then expect the posts to have been fetched
   expect(fetchedPosts).toEqual([post, post2]);
});

it('should update post', async () => {
   // given the updated post content
   const updatedContent = 'updated content';
   const updatedPost = { ...post, content: updatedContent };

   // given the update response
   Post.findOneAndUpdate = jest.fn().mockReturnValue(updatedPost);

   // when an update request is made
   const response = await postService.updatePost(
      post._id,
      post.owner,
      updatedContent
   );

   // then expect the post to have been updated successfuly
   expect(response).toEqual(updatedPost);

   // expect update function to have been called with the right arguments
   expect(Post.findOneAndUpdate.mock.calls[0][0]).toEqual({
      _id: post._id,
      owner: post.owner,
   });
   expect(Post.findOneAndUpdate.mock.calls[0][1]).toEqual({
      content: updatedContent,
   });
});

it('should delete post by id', async () => {
   // given the delete post response
   Post.findOneAndDelete = jest.fn().mockReturnValue(post);

   // when a request to delete a post by id is made
   const response = await postService.deletePostById(post._id, post.owner);

   // then expect the post to have been deleted
   expect(response).toEqual(post);

   // expect the delete function to have been called with the proper arguments
   expect(Post.findOneAndDelete.mock.calls[0][0]).toEqual({
      owner: post.owner,
      _id: post._id,
   });
});

it('should delete posts', async () => {
   // given the delete many response
   const posts = [post, post2];
   Post.deleteMany = jest.fn().mockReturnValue({ deletedCount: posts.length });

   // when a delete posts request is made
   const response = await postService.deletePosts(post.owner);

   // then expect all the posts to have been deleted
   expect(response).toBe(posts.length);
   expect(Post.deleteMany.mock.calls[0][0]).toEqual({ owner: post.owner });
});
