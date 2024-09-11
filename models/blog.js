const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  blogImage: { type: String, default: '' },
  comments: [{
    comment: String,
    replies: [{ reply: String }]
  }]
});

module.exports = mongoose.model('blog', BlogSchema);
