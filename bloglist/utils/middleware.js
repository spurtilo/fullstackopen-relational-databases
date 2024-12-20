const jwt = require('jsonwebtoken');
const logger = require('./logger');
const User = require('../models/user');
const { Blog } = require('../models');

const requestLogger = (req, res, next) => {
  logger.info('Method:', req.method);
  logger.info('Path:  ', req.path);
  logger.info('Body:  ', req.body);
  logger.info('---');
  next();
};

const tokenExtractor = (req, res, next) => {
  const authorization = req.get('Authorization');
  req.token = null;

  if (authorization && authorization.startsWith('Bearer ')) {
    req.token = authorization.replace('Bearer ', '');
  }
  next();
};

const userExtractor = async (req, res, next) => {
  const decodedToken = jwt.verify(req.token, process.env.SECRET);
  if (!decodedToken.id) {
    res.status(401).json({
      error: 'Token invalid',
    });
    return;
  }

  req.user = await User.findById(decodedToken.id);
  next();
};

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' });
};

const errorHandler = (error, req, res, next) => {
  logger.error(error.message);

  if (error.name === 'CastError') {
    if (error.message.includes('Cast to ObjectId failed')) {
      res.status(400).json({
        error: 'malformatted id',
      });
      return;
    }
    if (error.message.includes('Cast to Number failed')) {
      res.status(400).json({
        error: 'invalid data format or type for value of `likes`',
      });
      return;
    }
    res.status(400).json({ error: error.message });
    return;
  }

  if (error.name === 'ValidationError') {
    if (error.message.includes('shorter than the minimum')) {
      res.status(400).json({
        error: '`username` is shorter than the minimum allowed length (3)',
      });
      return;
    }
    if (error.message.includes('`username` is required')) {
      res.status(400).json({
        error: '`username` is required',
      });
      return;
    }
    if (error.message.includes('`title` is required')) {
      res.status(400).json({
        error: '`title` is required',
      });
      return;
    }
    if (error.message.includes('`url` is required')) {
      res.status(400).json({
        error: '`url` is required',
      });
      return;
    }
    res.status(400).json({ error: error.message });
    return;
  }

  if (
    error.name === 'MongoServerError' &&
    error.message.includes('E11000 duplicate key error')
  ) {
    res.status(400).json({ error: 'expected `username` to be unique' });
    return;
  }

  if (error.name === 'JsonWebTokenError') {
    if (error.message.includes('jwt must be provided')) {
      res.status(401).json({ error: 'token required' });
    }
    res.status(400).json({
      error: 'token invalid',
    });
    return;
  }

  next(error);
};

const blogFinder = async (req, res, next) => {
  req.blog = await Blog.findByPk(req.params.id);
  next();
};

module.exports = {
  requestLogger,
  tokenExtractor,
  userExtractor,
  errorHandler,
  unknownEndpoint,
  blogFinder,
};
