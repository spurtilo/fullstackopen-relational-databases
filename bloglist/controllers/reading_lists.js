const readingRouter = require('express').Router();
const middleware = require('../utils/middleware');
const { ReadingList } = require('../models');

readingRouter.post('/', middleware.userExtractor, async (req, res) => {
  const newListEntry = req.body;

  if (newListEntry.userId === req.user.id) {
    await ReadingList.create(newListEntry);

    res.status(201).json(newListEntry);
  } else {
    res
      .status(401)
      .json({ error: 'No permission to add to this reading list' });
  }
});

module.exports = readingRouter;
