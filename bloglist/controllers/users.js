const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const { User, Blog } = require('../models');

usersRouter.get('/', async (req, res) => {
  const users = await User.findAll({
    attributes: { exclude: ['passwordHash', 'createdAt', 'updatedAt'] },
    include: [
      {
        model: Blog,
        attributes: { exclude: ['userId'] },
      },
    ],
  });
  res.json(users);
});

usersRouter.get('/:id', async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: ['passwordHash', 'createdAt', 'updatedAt'] },
    include: [
      {
        model: Blog,
        as: 'readings',
        attributes: { exclude: ['userId'] },
        through: {
          attributes: [],
        },
      },
    ],
  });

  if (user) {
    res.json(user);
  } else {
    res.status(404).end();
  }
});

usersRouter.post('/', async (req, res) => {
  const { password } = req.body;

  if (!password) {
    res.status(400).json({ error: '`password` is required' });
    return;
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = User.build({
    ...req.body,
    passwordHash,
  });

  await user.save();
  res.status(201).json(user);
});

usersRouter.put('/:username', async (req, res) => {
  const user = await User.findOne({
    where: { username: req.params.username },
  });

  if (user) {
    user.name = req.body.name;
    await user.save();
    res.status(200).json(user);
  } else {
    res.status(404).end();
  }
});

module.exports = usersRouter;
