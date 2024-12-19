const blogsRouter = require('express').Router();
const middleware = require('../utils/middleware');
const Blog = require('../models/blog');

blogsRouter.get('/', async (req, res) => {
  const blogs = await Blog.findAll();
  res.json(blogs);
});

blogsRouter.post('/', middleware.userExtractor, async (req, res) => {
  const { url, title, author, likes } = req.body;
  const { user } = req;
  const blog = new Blog({
    url,
    title,
    author,
    user: user._id,
    likes,
  });

  const savedBlog = await blog.save();
  await savedBlog.populate('user', { username: 1, name: 1, id: 1 });
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();

  res.status(201).json(savedBlog);
});

blogsRouter.put('/:id', async (req, res) => {
  const { title, author, url, user, likes } = req.body;
  const updatedBlog = await Blog.findByIdAndUpdate(
    req.params.id,
    {
      title,
      author,
      url,
      user: user.id,
      likes,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  await updatedBlog.populate('user', { username: 1, name: 1, id: 1 });

  if (!updatedBlog) {
    res.status(404).json({ error: 'Blog not found' });
    return;
  }
  res.json(updatedBlog);
});

blogsRouter.delete('/:id', middleware.userExtractor, async (req, res) => {
  const { user } = req;
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    res.status(404).json({ error: 'Blog not found' });
    return;
  }
  if (user.id !== blog.user.toString()) {
    res.status(401).json({
      error: 'No permission to delete this blog',
    });
    return;
  }

  await Blog.findByIdAndDelete(blog.id);
  res.status(204).end();
});

module.exports = blogsRouter;
