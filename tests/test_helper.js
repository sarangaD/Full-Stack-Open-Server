const Blog = require('../models/blog')

const initialBlogs = [
  { 
    title: 'Solid Principles', 
    author: 'Saranga Mahesh', 
    url: 'https://en.wikipedia.org/wiki/SOLID', 
    likes: 1250 
  },
  {
    title: 'Power Platform', 
    author: 'Nilushi Silshara', 
    url: 'https://en.wikipedia.org/wiki/SOLID', 
    likes: 252
  }
]

const nonExistingId = async () => {
  const blog = new Blog({
      title: 'willremovethissoon',
      author: 'Saranga Mahesh',
      url: 'https://en.wikipedia.org/wiki/SOLID',
      likes: 323
    })
  await blog.save()
  await blog.deleteOne()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

module.exports = {
  initialBlogs, nonExistingId, blogsInDb
}