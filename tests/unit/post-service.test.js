const postService = require('../../services/post-service');
const Post = require('../../models/post');

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

fit('should create post', async () => {
   // given the post model create() response
   Post.create = jest.fn().mockReturnValue(post);

   // when createPost() is invoked
   const createdPost = await postService.createPost(post.owner, post.content);

   // then expect the post to have been created
   expect(createdPost).toEqual(post);
});

fit('should get post by id', async () => {
   // given the post model findById() response
   Post.findById = jest.fn().mockReturnValue(post);

   // when a request to get the post by id is made
   const fetchedPost = await postService.getPostById(post._id);

   // then expect the post to have been fetched successfully
   expect(fetchedPost).toEqual(post);
});

fit('should get posts', async () => {
   // given the post model find() response
   Post.find = jest.fn(() => ({
      skip: jest.fn(() => ({
         limit: jest.fn(() => ({
            populate: jest.fn().mockReturnValue([post, post2]),
         })),
      })),
   }));

   // when a request to get a user's list of posts
   const fetchedPosts = await postService.getPosts(post.owner, 0, 10);

   // then expect the posts to have been fetched
   expect(fetchedPosts).toEqual([post, post2]);
});

fit('should update post', async () => {
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
