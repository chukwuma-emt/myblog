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

  // 🔥 NEW FIELDS (SEO + STRUCTURE)
  category: {
    type: String,
    default: 'general'
  },

  excerpt: {
    type: String
  },

  tags: {
    type: [String],
    default: []
  },

  seoTitle: {
    type: String
  },

  metaDescription: {
    type: String
  },

  // MEDIA
  mediaFile: {
    type: String
  },

  mediaType: {
    type: String,
    enum: ['image', 'video', 'audio'],
    default: 'image'
  },

  // ENGAGEMENT
  likes: {
    type: Number,
    default: 0
  },

  views: {
    type: Number,
    default: 0
  },

  // SLUG
  slug: {
    type: String,
    unique: true,
    index: true
  }

}, {
  timestamps: true // ✅ replaces createdAt & updatedAt
});


// 🔥 AUTO-GENERATE SLUG (SMART VERSION)
PostSchema.pre('save', async function (next) {
  if (!this.isModified('title') && this.slug) return next();

  let baseSlug = this.slug
    ? slugify(this.slug, { lower: true, strict: true })
    : slugify(this.title, { lower: true, strict: true });

  let slug = baseSlug;
  let counter = 1;

  while (await mongoose.models.Post.findOne({ slug })) {
    slug = `${baseSlug}-${counter++}`;
  }

  this.slug = slug;

  next();
});


module.exports = mongoose.model('Post', PostSchema);