const blogsRouter = require('express').Router();
const middleware = require('../utils/middleware');
const Blog = require('../models/blog');

blogsRouter.get('/', async (req, res) => {
  const blogs = await Blog.findAll();
  res.json(blogs);
});

blogsRouter.post('/', async (req, res) => {
  // const { url, title, author, likes } = req.body;
  // const { user } = req;

  // if (req.body.likes && typeof req.body.likes !== 'number') {
  //   throw Error('"likes" must be a number');
  // }

  // const savedBlog = await blog.save();
  // await savedBlog.populate('user', { username: 1, name: 1, id: 1 });
  // user.blogs = user.blogs.concat(savedBlog._id);
  // await user.save();

  // if (typeof req.body.author !== 'string') {
  //   throw Error('Author name must be a string');
  // }

  const { url, title, author, likes } = req.body;

  const newBlog = {
    url,
    title,
    author,
    likes,
  };

  const blog = await Blog.create(newBlog);

  res.status(201).json(blog);
});

blogsRouter.put('/:id', middleware.blogFinder, async (req, res) => {
  // const updateData = { ...req.body };
  // const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, updateData, {
  //   new: true,
  //   runValidators: true,
  // });

  if (req.blog) {
    req.blog.likes = req.body.likes;
    await req.blog.save();
    res.json(req.blog);
  } else {
    res.status(404).json({ error: 'Blog not found' }).end();
  }

  // await updatedBlog.populate('user', { username: 1, name: 1, id: 1 });
});

blogsRouter.delete(
  '/:id',
  middleware.userExtractor,
  middleware.blogFinder,
  async (req, res) => {
    // const { user } = req;

    if (!req.blog) {
      res.status(404).json({ error: 'Blog not found' });
      return;
    }
    // if (user.id !== blog.user.toString()) {
    //   res.status(401).json({
    //     error: 'No permission to delete this blog',
    //   });
    //   return;
    // }

    await req.blog.destroy();
    res.status(204).end();
  }
);

module.exports = blogsRouter;
