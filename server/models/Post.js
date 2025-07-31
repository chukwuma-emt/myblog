const mongoose = require('mongoose');
const slugify = require('slugify');

const Schema = mongoose.Schema;

const PostSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  mediaFile: {           // Updated from "image"
    type: String
  },
  mediaType: {           // New field to track file type: 'image', 'video', 'audio'
    type: String,
    enum: ['image', 'video', 'audio'],
    default: 'image'
  },
  likes: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  slug: {
    type: String,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-generate slug before save
PostSchema.pre('save', async function (next) {
  if (!this.isModified('title')) return next();

  let baseSlug = slugify(this.title, { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 1;

  while (await mongoose.models.Post.findOne({ slug })) {
    slug = `${baseSlug}-${counter++}`;
  }

  this.slug = slug;
  next();
});

module.exports = mongoose.model('Post', PostSchema);
