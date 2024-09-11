const express = require('express');
const multer = require('multer');
const Blog = require('../models/blog');
const path = require('path');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'blogImage') {
      cb(null, 'uploads/blog_images');
    }
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.post('/', upload.single('blogImage'), async (req, res) => {
  const { title, description } = req.body;
  const blogImage = req.file ? req.file.path : '';

  if (!title || !description) return res.status(400).send('Title and description are required.');

  const newBlog = new Blog({ title, description, blogImage });
  await newBlog.save();

  res.status(201).send('Blog created successfully.');
});

router.get('/', async (req, res) => {
  const blogs = await Blog.find();
  res.json(blogs);
});

router.put('/:id', upload.single('blogImage'), async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  const blogImage = req.file ? req.file.path : '';
  const updatedBlog = await Blog.findByIdAndUpdate(id, { title, description, blogImage }, { new: true });
  if (!updatedBlog) return res.status(404).send('Blog not found.');
  res.json(updatedBlog);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const deletedBlog = await Blog.findByIdAndDelete(id);
  if (!deletedBlog) return res.status(404).send('Blog not found.');

  res.send('Blog deleted successfully.');
});

router.post('/:id/comments', async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;

  const blog = await Blog.findById(id);
  if (!blog) return res.status(404).send('Blog not found.');

  blog.comments.push({ comment, replies: [] });
  await blog.save();

  res.status(201).send('Comment added.');
});

router.get('/:id/comments', async (req, res) => {
  const { id } = req.params;

  const blog = await Blog.findById(id);
  if (!blog) return res.status(404).send('Blog not found.');

  res.json(blog.comments);
});

module.exports = router;
