const supertest = require('supertest');
const jwt = require('jsonwebtoken');
const Blog = require('../models/blog');
const User = require('../models/user');

const app = require('../app');

const api = supertest(app);

const nonExistingId = async () => {
  const blog = new Blog({
    title: 'This will be removed soon',
    url: 'http://example.com',
  });
  await blog.save();
  await blog.deleteOne();

  return blog._id.toString();
};

const blogsInDb = async () => {
  const blogs = await Blog.find({});
  return blogs.map((blog) => blog.toJSON());
};

const usersInDb = async () => {
  const users = await User.find({});
  return users.map((u) => u.toJSON());
};

const getToken = async (username, password) => {
  const response = await api
    .post('/api/login')
    .send({ username, password })
    .expect(200)
    .expect('Content-Type', /application\/json/);

  return response.body.token;
};

const getInitialBlogs = async () => {
  const token = await getToken('root', 'analasassalasana');
  const decodedToken = jwt.verify(token, process.env.SECRET);
  return [
    {
      url: 'https://reactpatterns.com/',
      title: 'React patterns',
      author: 'Michael Chan',
      user: decodedToken.id,
      likes: 7,
    },
    {
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      user: decodedToken.id,
      likes: 5,
    },
    {
      url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
      title: 'First class tests',
      author: 'Robert C. Martin',
      user: decodedToken.id,
      likes: 10,
    },
  ];
};

module.exports = {
  getInitialBlogs,
  nonExistingId,
  blogsInDb,
  usersInDb,
  getToken,
};
