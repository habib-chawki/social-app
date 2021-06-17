const postService = require('../../services/post-service');
const Post = require('../../models/post');

jest.mock('../../models/post');

fit('should create post', async () => {
   const userId = '507f1f77bcf86cd799439011';
   const postContent = 'This is a post';

   const post = {
      owner: userId,
      content: postContent,
      comments: [],
   };

   // given the post model create method response
   Post.create.mockResolvedValue(post);

   // when createPost is invoked
   const createdPost = await postService.createPost(userId, postContent);

   // then expect the post to have been created
   expect(createdPost).toBe(post);
});
