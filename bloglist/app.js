const express = require('express');
require('express-async-errors');
const cors = require('cors');

const loginRouter = require('./controllers/login');
const blogsRouter = require('./controllers/blogs');
const authorsRouter = require('./controllers/authors');
const usersRouter = require('./controllers/users');
const readingRouter = require('./controllers/reading_lists');
const middleware = require('./utils/middleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use(middleware.requestLogger);
app.use(middleware.tokenExtractor);

app.use('/api/login', loginRouter);
app.use('/api/blogs', blogsRouter);
app.use('/api/authors', authorsRouter);
app.use('/api/users', usersRouter);
app.use('/api/readinglists', readingRouter);

if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/testing'); // eslint-disable-line
  app.use('/api/testing', testingRouter);
}

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
