const postService = require('../../services/post-service');
const Post = require('../../models/post');

jest.mock('../../models/post');

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
   Post.create.mockResolvedValue(post);

   // when createPost() is invoked
   const createdPost = await postService.createPost(post.owner, post.content);

   // then expect the post to have been created
   expect(createdPost).toBe(post);
});

fit('should get post by id', async () => {
   // given the post model findById() response
   Post.findById.mockResolvedValue(post);

   // when a request to get the post by id is made
   const fetchedPost = await postService.getPostById(post._id);

   // then expect the post to have been fetched successfully
   expect(fetchedPost).toBe(post);
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
