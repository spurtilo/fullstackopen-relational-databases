const readingRouter = require('express').Router();
const middleware = require('../utils/middleware');
const { ReadingList } = require('../models');

readingRouter.post('/', middleware.userExtractor, async (req, res) => {
  const newListEntry = req.body;

  if (newListEntry.user_id === req.user.id) {
    await ReadingList.create({
      userId: newListEntry.user_id,
      blogId: newListEntry.blog_id,
    });

    res.status(201).json(newListEntry);
  } else {
    res
      .status(401)
      .json({ error: 'No permission to add to this reading list' });
  }
});

readingRouter.put('/:id', middleware.userExtractor, async (req, res) => {
  const readingListEntry = await ReadingList.findByPk(req.params.id);

  if (readingListEntry && readingListEntry.userId === req.user.id) {
    if (readingListEntry.read) {
      res.status(400).json({ error: 'This blog is already marked as read' });
      return;
    }

    readingListEntry.read = true;
    await readingListEntry.save();

    res.status(200).json(readingListEntry);
  } else {
    res
      .status(403)
      .json({ error: 'Only blogs on your reading list can be marked as read' });
  }
});

module.exports = readingRouter;
