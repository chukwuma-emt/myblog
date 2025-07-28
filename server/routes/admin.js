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

// Middleware to check login
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'unauthorized' });

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'unauthorized' });
  }
};

// Admin login page
router.get('/admin', async (req, res) => {
  try {
    const locals = {
      title: "Admin",
      description: "simple blog created with nodejs , express and mongodb",
      error: req.query.error
    };
    res.render('admin/index', { locals, layout: adminLayout, currentRoute: req.path });
  } catch (error) {
    console.log(error);
  }
});

// Admin login logic
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

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.redirect('/admin?error=Invalid credentials');

    const token = jwt.sign({ userId: user._id, role: user.role }, jwtSecret);
    res.cookie('token', token, { httpOnly: true });

    if (user.role === 'restricted') {
      return res.redirect('/admin?error=Access restricted');
    }

    res.redirect('/dashboard');
  } catch (error) {
    console.log(error);
    res.redirect('/admin?error=Something went wrong');
  }
});



// Register Logic (POST)




// Dashboard
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: 'Dashboard',
      description: 'simple blog created with nodejs, express and mongodb'
    };
    const data = await Post.find();
    res.render('admin/dashboard', {
      locals,
      data,
      layout: adminLayout,
      currentRoute: req.path
    });
  } catch (error) {
    console.log(error);
  }
});

// Add Post (GET)
router.get('/add-post', authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: 'Add Post',
      description: 'simple blog created with nodejs, express and mongodb'
    };
    res.render('admin/add-post', {
      locals,
      layout: adminLayout,
      currentRoute: req.path
    });
  } catch (error) {
    console.log(error);
  }
});

// Add Post (POST)
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

    const newPost = new Post({ title, body, image, slug });
    await newPost.save();
    res.redirect(`/post/${slug}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating post');
  }
});

// Edit Post (GET)
router.get('/edit-post/:id', authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: 'Edit Post',
      description: 'simple blog created with nodejs, express and mongodb'
    };
    const data = await Post.findOne({ _id: req.params.id });
    res.render('admin/edit-post', {
      locals,
      data,
      layout: adminLayout,
      currentRoute: req.path
    });
  } catch (error) {
    console.log(error);
  }
});

// Edit Post (PUT)
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

    if (image) {
      updatedPost.image = image;
    }

    await Post.findByIdAndUpdate(req.params.id, updatedPost);
    res.redirect(`/edit-post/${req.params.id}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating post');
  }
});


// Delete Post
router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
  try {
    await Post.deleteOne({ _id: req.params.id });
    res.redirect('/dashboard');
  } catch (error) {
    console.log(error);
  }
});



router.post('/register', async (req,res)=>{
    try {
        
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10)

    try {
        const user = await User.create({ username, password: hashedPassword})
        return res.redirect('/admin?error=account created!!! please login here')
        //res.status(201).json({ message: 'User Created', user})
    } catch (error) {
        if(error.code === 11000){
            return res.redirect('/admin?error=this User already in exist! login or create new account')
            //res.status(409).json({ message: 'User already in user'})
        }
        res.status(500).json({ message: 'internal server error'})
    }

    } catch (error) {
        console.log(error)
    }
        
    });


// Logout
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/admin');
});






module.exports = router;
