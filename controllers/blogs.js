const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const { Types } = require('mongoose');

blogsRouter.get('/', async (request, response) => {
  await Blog.find({}).then(notes => {
    response.json(notes)
  })
})

blogsRouter.get('/:id', async (request, response) => {
  if (Types.ObjectId.isValid(request.params.id)) {
    await Blog.findById(request.params.id)
      .then(blog => {
        if (blog) {
          response.json(blog)
        } else {
          response.status(404).end()
        }
      })
  } else {
    response.status(400).end()
  }
})


blogsRouter.post('/', async (request, response) => {
  const blog = new Blog(request.body)

  if (!blog.title) {
    return response.status(400).json({
      error: 'The title is missing'
    })
  }

  if (!blog.url) {
    return response.status(400).json({
      error: 'The url is missing'
    })
  }

  await blog
    .save()
    .then(result => {
      response.status(201).json(result)
    })
})

blogsRouter.put('/:id', async (request, response) => {
  const { title, author, url, likes } = new Blog(request.body)

  if (!title) {
    return response.status(400).json({
      error: 'The title is missing'
    })
  }

  if (!url) {
    return response.status(400).json({
      error: 'The url is missing'
    })
  }

  const blog = {
    title: title,
    author: author,
    url: url,
    likes: likes
  }

  await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    .then(updatedBlog => {
      response.json(updatedBlog)
    })
})

blogsRouter.delete('/:id', (request, response) => {
  Blog.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
})


module.exports = blogsRouter