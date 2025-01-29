const blogsRouter = require('express').Router();
const { Op } = require('sequelize');
const middleware = require('../utils/middleware');
const { User, Blog } = require('../models');

blogsRouter.get('/', async (req, res) => {
  let where = {};

  if (req.query.search) {
    where = {
      [Op.or]: [
        {
          author: {
            [Op.iLike]: `%${req.query.search}%`,
          },
        },
        {
          title: {
            [Op.iLike]: `%${req.query.search}%`,
          },
        },
      ],
    };
  }

  const blogs = await Blog.findAll({
    attributes: { exclude: ['userId'] },
    include: {
      model: User,
      attributes: ['username', 'name'],
    },
    where,
    order: [['likes', 'DESC']],
  });
  res.json(blogs);
});

blogsRouter.post('/', middleware.userExtractor, async (req, res) => {
  const { user } = req;
  const newBlog = await Blog.create({
    ...req.body,
    userId: user.id,
  });

  const blogWithUser = await Blog.findByPk(newBlog.id, {
    include: {
      model: User,
      attributes: ['username', 'name'],
    },
  });

  res.status(201).json(blogWithUser);
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
