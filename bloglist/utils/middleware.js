const jwt = require('jsonwebtoken');
const logger = require('./logger');
const { User, Blog } = require('../models');

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

  req.user = await User.findByPk(decodedToken.id);
  next();
};

const blogFinder = async (req, res, next) => {
  req.blog = await Blog.findByPk(req.params.id);
  next();
};

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' });
};

const errorHandler = (error, req, res, next) => {
  logger.error(error.message);

  if (error.name === 'SequelizeValidationError') {
    if (error.message.includes('blog.title cannot be null')) {
      res.status(400).json({
        error: 'Validation error: Title field is required',
      });
      return;
    }
    if (error.message.includes('blog.url cannot be null')) {
      res.status(400).json({
        error: 'Validation error: Url field is required',
      });
      return;
    }
    if (error.message.includes('Validation isEmail on username failed')) {
      res.status(400).json({
        error: 'Validation error: Username must be a valid email address',
      });
      return;
    }
    if (
      error.message.includes('Validation min on year failed') ||
      error.message.includes('Validation max on year failed')
    ) {
      const currentYear = new Date().getFullYear();
      res.status(400).json({
        error: `Validation error: Year must be between 1991 and ${currentYear}`,
      });
      return;
    }
    res.status(400).json({ error: error.message });
    return;
  }

  if (error.name === 'JsonWebTokenError') {
    if (error.message.includes('Jwt must be provided')) {
      res.status(401).json({ error: 'Token is required' });
    }
    res.status(400).json({
      error: 'Token is invalid',
    });
    return;
  }

  res.status(500).json({ error: 'An unexpected error occurred' });

  next(error);
};

module.exports = {
  requestLogger,
  tokenExtractor,
  userExtractor,
  errorHandler,
  unknownEndpoint,
  blogFinder,
};
