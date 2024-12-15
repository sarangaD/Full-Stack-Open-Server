const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')


beforeEach(async () => {
  await Blog.deleteMany({})
  let blogObject = new Blog(helper.initialBlogs[0])
  await blogObject.save()

  blogObject = new Blog(helper.initialBlogs[1])
  await blogObject.save()
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')

  assert.strictEqual(response.body.length, helper.initialBlogs.length)
})

test('Verify that `id` exists and `_id` does not', async () => {
  const response = await api.get('/api/blogs')
  const json = response.body[0];

  assert.strictEqual(json.hasOwnProperty("id"), true, "id property should exist");
  assert.strictEqual(json.hasOwnProperty("_id"), false, "_id property should not exist");

})


test('a valid blog can be added ', async () => {
  const newBlog = {
    title: 'async/await simplifies making async calls',
    author: 'Saranga Mahesh',
    url: 'https://en.wikipedia.org/wiki/SOLID',
    likes: 323
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

  const titles = blogsAtEnd.map(n => n.title)

  assert(titles.includes('async/await simplifies making async calls'))
})

describe('missing properties', () => {
  test('should default the likes property to 0 if it is missing in the request', async () => {
    const newBlog = {
      title: 'Blog without likes',
      author: 'John Doe',
      url: 'https://example.com/blog-without-likes',
    };

    const response = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const savedBlog = response.body;
    assert.strictEqual(savedBlog.likes, 0);

    const blogsInDb = await helper.blogsInDb();
    const blogInDb = blogsInDb.find((blog) => blog.title === 'Blog without likes');
    assert.strictEqual(blogInDb.likes, 0);
  })

  test('should respond with 400 Bad Request if the title property is missing', async () => {
    const newBlog = {
      author: 'John Doe',
      url: 'https://example.com/blog-without-likes',
      likes: 6
    };

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400);
  })

  test('should respond with 400 Bad Request if the url property is missing', async () => {
    const newBlog = {
      title: 'Blog Missing URL',
      author: 'Jane Doe',
      likes: 5,
    };

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400);
  })
})


describe('viewing a specific blog', () => {

  test('succeeds with a valid id', async () => {
    const blogsAtStart = await helper.blogsInDb()

    const blogToView = blogsAtStart[0]

    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.deepStrictEqual(resultBlog.body, blogToView)
  })

  test('fails with statuscode 404 if blog does not exist', async () => {
    const validNonexistingId = await helper.nonExistingId()

    await api
      .get(`/api/blogs/${validNonexistingId}`)
      .expect(404)
  })

  test('fails with statuscode 400 id is invalid', async () => {
    const invalidId = '5a3d5da59070081a82a3445'

    await api
      .get(`/api/blogs/${invalidId}`)
      .expect(400)
  })
})

describe('deletion of a blog', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)

    const tile = blogsAtEnd.map(r => r.title)
    assert(!tile.includes(blogToDelete.content))
  })
})

after(async () => {
  await mongoose.connection.close()
})