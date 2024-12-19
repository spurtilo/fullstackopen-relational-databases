require('dotenv').config();

const PORT = process.env.PORT; // eslint-disable-line

const MONGODB_URI = // eslint-disable-line
  process.env.NODE_ENV === 'test'
    ? process.env.TEST_MONGODB_URI
    : process.env.MONGODB_URI;

module.exports = {
  MONGODB_URI,
  PORT,
};
