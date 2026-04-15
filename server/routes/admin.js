const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const upload = require('../../middleware/upload');
const slugify = require('slugify');
const { marked } = require('marked'); // ✅ NEW

const adminLayout = 'layouts/admin';
const jwtSecret = process.env.JWT_SECRET;

// ================= AUTH =================
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId || null;
    req.role = decoded.role;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

// ================= LOGIN =================
router.get('/admin', (req, res) => {
  res.render('admin/index', {
    layout: adminLayout,
    error: req.query.error
  });
});

router.post('/admin', async (req, res) => {
  const { username, password } = req.body;

  const ownerUsername = 'owner';
  const ownerPassword = 'supersecret123';

  if (username === ownerUsername && password === ownerPassword) {
    const token = jwt.sign({ role: 'owner' }, jwtSecret);
    res.cookie('token', token, { httpOnly: true });
    return res.redirect('/owner');
  }

  try {
    const user = await User.findOne({ username });
    if (!user) return res.redirect('/admin?error=Invalid credentials');

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.redirect('/admin?error=Invalid credentials');

    if (user.role === 'restricted') {
      return res.redirect('/admin?error=Access restricted');
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, jwtSecret);
    res.cookie('token', token, { httpOnly: true });

    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.redirect('/admin?error=Login error');
  }
});

// ================= DASHBOARD =================
router.get('/dashboard', authMiddleware, async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });

  res.render('admin/dashboard', {
    layout: adminLayout,
    data: posts
  });
});

// ================= ADD POST PAGE =================
router.get('/add-post', authMiddleware, (req, res) => {
  res.render('admin/add-post', {
    layout: adminLayout
  });
});

// ================= CREATE POST =================
router.post('/add-post', authMiddleware, upload.single('media'), async (req, res) => {
  try {
    const {
      title,
      body,
      slug,
      category,
      excerpt,
      tags,
      seoTitle,
      metaDescription
    } = req.body;

    const mediaFile = req.file ? req.file.filename : null;
    const mediaType = req.file ? req.file.mimetype.split('/')[0] : null;

    let baseSlug = slug
      ? slugify(slug, { lower: true, strict: true })
      : slugify(title, { lower: true, strict: true });

    let finalSlug = baseSlug;
    let counter = 1;

    while (await Post.findOne({ slug: finalSlug })) {
      finalSlug = `${baseSlug}-${counter++}`;
    }

    const post = new Post({
      title,
      body, // ✅ store markdown as-is
      slug: finalSlug,
      category,
      excerpt,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      seoTitle,
      metaDescription,
      mediaFile,
      mediaType
    });

    await post.save();

    res.redirect(`/post/${finalSlug}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Post creation error');
  }
});

// ================= SHOW POST (🔥 FIXED HERE) =================
router.get('/post/:slug', async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug });

    if (!post) return res.status(404).send('Post not found');

    // ✅ Convert Markdown → HTML
    const htmlBody = marked(post.body);

    // increment views
    post.views = (post.views || 0) + 1;
    await post.save();

    res.render('post', {
      data: {
        ...post.toObject(),
        body: htmlBody // ✅ send HTML instead
      },
      comments: []
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading post');
  }
});

// ================= EDIT PAGE =================
router.get('/edit-post/:id', authMiddleware, async (req, res) => {
  const post = await Post.findById(req.params.id);

  res.render('admin/edit-post', {
    layout: adminLayout,
    data: post
  });
});

// ================= UPDATE POST =================
router.put('/edit-post/:id', authMiddleware, upload.single('media'), async (req, res) => {
  try {
    const {
      title,
      body,
      slug,
      category,
      excerpt,
      tags,
      seoTitle,
      metaDescription
    } = req.body;

    let baseSlug = slug
      ? slugify(slug, { lower: true, strict: true })
      : slugify(title, { lower: true, strict: true });

    let finalSlug = baseSlug;
    let counter = 1;

    while (await Post.findOne({ slug: finalSlug, _id: { $ne: req.params.id } })) {
      finalSlug = `${baseSlug}-${counter++}`;
    }

    const updateData = {
      title,
      body,
      slug: finalSlug,
      category,
      excerpt,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      seoTitle,
      metaDescription,
      updatedAt: Date.now()
    };

    if (req.file) {
      updateData.mediaFile = req.file.filename;
      updateData.mediaType = req.file.mimetype.split('/')[0];
    }

    await Post.findByIdAndUpdate(req.params.id, updateData);

    res.redirect(`/post/${finalSlug}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Update error');
  }
});

// ================= DELETE =================
router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.redirect('/dashboard');
});

// ================= LOGOUT =================
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/admin');
});

module.exports = router;