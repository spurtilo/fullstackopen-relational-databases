const blogsRouter = require('express').Router();
const middleware = require('../utils/middleware');
const Blog = require('../models/blog');

blogsRouter.get('/', async (req, res) => {
  const blogs = await Blog.findAll();
  res.json(blogs);
});

blogsRouter.post('/', middleware.userExtractor, async (req, res) => {
  const { user } = req;
  const blog = await Blog.create({
    ...req.body,
    userId: user.id,
  });
  res.status(201).json(blog);
});

blogsRouter.put('/:id', middleware.blogFinder, async (req, res) => {
  if (req.blog) {
    req.blog.likes = req.body.likes;
    await req.blog.save();
    res.json(req.blog);
  } else {
    res.status(404).json({ error: 'Blog not found' }).end();
  }
});

blogsRouter.delete(
  '/:id',
  middleware.blogFinder,
  middleware.userExtractor,
  async (req, res) => {
    const { user, blog } = req;

    if (!blog) {
      res.status(404).json({ error: 'Blog not found' });
      return;
    }

    if (user.id !== blog.userId) {
      res.status(401).json({
        error: 'No permission to delete this blog',
      });
      return;
    }

    await blog.destroy();
    res.status(204).end();
  }
);

module.exports = blogsRouter;
