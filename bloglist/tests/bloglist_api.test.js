const { test, after, beforeEach, describe } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const supertest = require('supertest');
const bcrypt = require('bcrypt');
const helper = require('./test_helper');
const Blog = require('../models/blog');
const User = require('../models/user');

const app = require('../app');

const api = supertest(app);

describe('When there is initially one user at db', () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash('analasassalasana', 10);
    const user = new User({
      blogs: [],
      username: 'root',
      name: 'Superuser',
      passwordHash,
    });
    await user.save();
  });

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: 'spurtilo',
      name: 'Simo Purtilo',
      password: 'salainensana',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1);

    const usernames = usersAtEnd.map((u) => u.username);
    assert(usernames.includes(newUser.username));
  });

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      blogs: [],
      username: 'root',
      name: 'Superuser',
      password: 'analasassalasana',
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await helper.usersInDb();

    assert(result.body.error.includes('expected `username` to be unique'));
    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  });

  test('fails with proper statuscode and message if username is too short', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: 'sp',
      name: 'Simo Purtilo',
      password: 'salainensana',
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await helper.usersInDb();

    assert(
      result.body.error.includes(
        '`username` is shorter than the minimum allowed length (3)'
      )
    );
    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  });

  test('fails with proper statuscode and message if username is missing', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      name: 'Simo Purtilo',
      password: 'salainensana',
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await helper.usersInDb();

    assert(result.body.error.includes('`username` is required'));
    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  });

  test('fails with proper statuscode and message if password is too short', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: 'spurtilo',
      name: 'Simo Purtilo',
      password: 'ok',
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await helper.usersInDb();

    assert(
      result.body.error.includes(
        '`password` is shorter than the minimum allowed length (3)'
      )
    );
    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  });

  test('fails with proper statuscode and message if password is missing', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: 'spurtilo',
      name: 'Simo Purtilo',
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await helper.usersInDb();

    assert(result.body.error.includes('`password` is required'));
    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  });
});

describe('when there is initially some blogs saved', () => {
  beforeEach(async () => {
    await Blog.deleteMany({});
    const initialBlogs = await helper.getInitialBlogs();
    await Blog.insertMany(initialBlogs);
  });

  test('The correct amount of blogs are returned as JSON', async () => {
    const blogsAtStart = await helper.blogsInDb();

    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/);

    assert.strictEqual(response.body.length, blogsAtStart.length);
  });

  test('The unique identifier property of blog posts is named "id"', async () => {
    const response = await api.get('/api/blogs');
    assert(response.body.every((entry) => 'id' in entry));
  });

  describe('Addition of a new blog', () => {
    test('succeeds with valid data', async () => {
      const token = await helper.getToken('root', 'analasassalasana');
      const blogsAtStart = await helper.blogsInDb();

      const newBlog = {
        url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
        title: 'Type wars',
        author: 'Robert C. Martin',
        likes: 2,
      };

      const response = await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/);

      const returnedBlog = response.body;
      const blogsAtEnd = await helper.blogsInDb();
      const createdBlog = blogsAtEnd.find(
        (blog) => blog.id === returnedBlog.id
      );

      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length + 1);
      assert.deepStrictEqual(createdBlog, {
        ...newBlog,
        user: createdBlog.user,
        id: createdBlog.id,
      });
    });

    test('with "like" property missing, default value is 0', async () => {
      const token = await helper.getToken('root', 'analasassalasana');
      const blogsAtStart = await helper.blogsInDb();

      const newBlog = {
        url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
        title: 'Type wars',
        author: 'Robert C. Martin',
      };

      const response = await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/);

      const returnedLikeValue = response.body.likes;
      const blogsAtEnd = await helper.blogsInDb();

      assert.strictEqual(returnedLikeValue, 0);
      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length + 1);
    });

    test('fails with "400 Bad Request" if "title" property missing', async () => {
      const token = await helper.getToken('root', 'analasassalasana');
      const blogsAtStart = await helper.blogsInDb();

      const newBlogNoTitle = {
        url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
        author: 'Robert C. Martin',
        likes: 2,
      };

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlogNoTitle)
        .expect(400)
        .expect('Content-Type', /application\/json/);

      const blogsAtEnd = await helper.blogsInDb();

      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length);
    });

    test('fails with "400 Bad Request" if "url" property missing', async () => {
      const token = await helper.getToken('root', 'analasassalasana');
      const blogsAtStart = await helper.blogsInDb();

      const newBlogNoUrl = {
        title: 'Type wars',
        author: 'Robert C. Martin',
        likes: 2,
      };

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlogNoUrl)
        .expect(400)
        .expect('Content-Type', /application\/json/);

      const blogsAtEnd = await helper.blogsInDb();

      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length);
    });

    test('fails with "401 Unauthorized" if a token is not provided', async () => {
      const blogsAtStart = await helper.blogsInDb();

      const newBlog = {
        url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
        title: 'Type wars',
        author: 'Robert C. Martin',
        likes: 2,
      };

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(401)
        .expect('Content-Type', /application\/json/);

      const blogsAtEnd = await helper.blogsInDb();

      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length);
    });
  });

  describe('Updating a blog', () => {
    test('with selected fields and valid data', async () => {
      const blogsAtStart = await helper.blogsInDb();
      const blogToUpdate = blogsAtStart[0];

      const updatedFields = {
        title: 'This is the updated title',
        likes: 56,
      };

      await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(updatedFields)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      const blogsAtEnd = await helper.blogsInDb();
      const updatedBlog = blogsAtEnd.find(
        (blog) => blog.id === blogToUpdate.id
      );

      assert.equal(updatedBlog.title, updatedFields.title);
      assert.equal(updatedBlog.likes, updatedFields.likes);

      assert.equal(updatedBlog.author, blogToUpdate.author);
      assert.equal(updatedBlog.url, blogToUpdate.url);
    });

    test('fails with statuscode 400 if "likes" data is invalid', async () => {
      const blogsAtStart = await helper.blogsInDb();
      const blogToUpdate = blogsAtStart[0];

      const updatedFields = {
        likes: 'Fifty six',
      };

      const result = await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(updatedFields)
        .expect(400)
        .expect('Content-Type', /application\/json/);

      const blogsAtEnd = await helper.blogsInDb();

      assert(
        result.body.error.includes(
          'invalid data format or type for value of `likes`'
        )
      );
      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length);
    });

    test('fails with statuscode 400 if id is invalid', async () => {
      const blogsAtStart = await helper.blogsInDb();
      const invalidBlogId = '48c93a8d94a434';
      const updatedFields = {
        title: 'This is the updated title',
        likes: 56,
      };

      await api
        .put(`/api/blogs/${invalidBlogId}`)
        .send(updatedFields)
        .expect(400)
        .expect('Content-Type', /application\/json/);

      const blogsAtEnd = await helper.blogsInDb();

      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length);
    });

    test('fails with statuscode 404 if blog does not exist', async () => {
      const blogsAtStart = await helper.blogsInDb();
      const validNonexistingId = await helper.nonExistingId();
      const updatedFields = {
        title: 'This is the updated title',
        likes: 56,
      };

      await api
        .put(`/api/blogs/${validNonexistingId}`)
        .send(updatedFields)
        .expect(404)
        .expect('Content-Type', /application\/json/);

      const blogsAtEnd = await helper.blogsInDb();

      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length);
    });
  });

  describe('Deletion of a blog', () => {
    test('succeeds with status 204 if id valid', async () => {
      const token = await helper.getToken('root', 'analasassalasana');
      const blogsAtStart = await helper.blogsInDb();
      const blogToDelete = blogsAtStart[0];

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      const blogsAtEnd = await helper.blogsInDb();

      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1);
      assert.strictEqual(
        blogsAtEnd.some((blog) => blog.id === blogToDelete.id),
        false
      );
    });

    test('fails with statuscode 400 if id is invalid', async () => {
      const token = await helper.getToken('root', 'analasassalasana');
      const blogsAtStart = await helper.blogsInDb();
      const invalidId = '48c93a8d94a434';

      const result = await api
        .delete(`/api/blogs/${invalidId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      const blogsAtEnd = await helper.blogsInDb();

      assert(result.body.error.includes('malformatted id'));
      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length);
    });

    test('fails with statuscode 404 if blog does not exist', async () => {
      const token = await helper.getToken('root', 'analasassalasana');
      const blogsAtStart = await helper.blogsInDb();
      const validNonexistingId = await helper.nonExistingId();

      await api
        .delete(`/api/blogs/${validNonexistingId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      const blogsAtEnd = await helper.blogsInDb();

      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length);
    });
  });
});

after(async () => {
  await mongoose.connection.close();
});
