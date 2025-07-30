const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const upload = require('../../middleware/upload');
const slugify = require('slugify');

const adminLayout = 'layouts/admin';
const jwtSecret = process.env.JWT_SECRET;

// Auth middleware
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

// GET: Admin login page
router.get('/admin', (req, res) => {
  const locals = {
    title: "Admin Login",
    description: "Simple blog created with Node.js, Express, and MongoDB",
    error: req.query.error
  };
  res.render('admin/index', { locals, layout: adminLayout, currentRoute: req.path });
});

// POST: Admin login logic
router.post('/admin', async (req, res) => {
  const { username, password } = req.body;

  // Super admin shortcut
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

// POST: Register user
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      await User.create({ username, password: hashedPassword });
      return res.redirect('/admin?error=Account created! Please login.');
    } catch (err) {
      if (err.code === 11000) {
        return res.redirect('/admin?error=User already exists. Try logging in.');
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  } catch (err) {
    console.error(err);
    res.redirect('/admin?error=Registration failed');
  }
});

// GET: Dashboard
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: 'Dashboard',
      description: 'Blog Admin Dashboard'
    };
    const data = await Post.find().sort({ createdAt: -1 });

    res.render('admin/dashboard', {
      locals,
      data,
      layout: adminLayout,
      currentRoute: req.path
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Dashboard error');
  }
});

// GET: Add Post
router.get('/add-post', authMiddleware, (req, res) => {
  const locals = {
    title: 'Add Post',
    description: 'Create a new blog post'
  };
  res.render('admin/add-post', {
    locals,
    layout: adminLayout,
    currentRoute: req.path
  });
});

// POST: Add Post
router.post('/add-post', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { title, body } = req.body;
    const image = req.file ? req.file.filename : null;

    let baseSlug = slugify(title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;
    while (await Post.findOne({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const post = new Post({ title, body, image, slug });
    await post.save();
    res.redirect(`/post/${slug}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Post creation error');
  }
});

// GET: Edit Post
router.get('/edit-post/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const locals = {
      title: 'Edit Post',
      description: 'Edit your blog post'
    };
    res.render('admin/edit-post', {
      locals,
      data: post,
      layout: adminLayout,
      currentRoute: req.path
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Edit page error');
  }
});

// PUT: Edit Post
router.put('/edit-post/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { title, body } = req.body;
    const image = req.file ? req.file.filename : undefined;

    let baseSlug = slugify(title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;
    while (await Post.findOne({ slug, _id: { $ne: req.params.id } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const updatedPost = {
      title,
      body,
      slug,
      updatedAt: Date.now()
    };

    if (image) updatedPost.image = image;

    await Post.findByIdAndUpdate(req.params.id, updatedPost);
    res.redirect(`/edit-post/${req.params.id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Update error');
  }
});

// DELETE: Delete Post
router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Delete error');
  }
});

// GET: Logout
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/admin');
});

module.exports = router;
