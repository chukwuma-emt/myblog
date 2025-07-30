const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Comment = require('../models/Comment');

// Homepage with pagination
router.get('/', async (req, res) => {
  try {
    const locals = {
      title: "Node.js Blog",
      description: "Simple blog created with Node.js, Express, and MongoDB"
    };

    const perPage = 10;
    const page = Math.max(parseInt(req.query.page) || 1, 1);

    const posts = await Post.aggregate([{ $sort: { createdAt: -1 } }])
      .skip(perPage * (page - 1))
      .limit(perPage);

    const count = await Post.countDocuments();
    const hasNextPage = page < Math.ceil(count / perPage);

    res.render('index', {
      locals,
      data: posts,
      current: page,
      nextPage: hasNextPage ? page + 1 : null,
      currentRoute: '/'
    });
  } catch (error) {
    console.error('Homepage error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// View single post with comments, views, and likes
router.get('/post/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    const post = await Post.findOne({ slug });
    if (!post) return res.status(404).send("Post not found");

    // Count views (session-based)
    if (!req.session.viewedPosts) req.session.viewedPosts = [];
    if (!req.session.viewedPosts.includes(post._id.toString())) {
      await Post.findByIdAndUpdate(post._id, { $inc: { views: 1 } });
      req.session.viewedPosts.push(post._id.toString());
    }

    // Load comments
    const comments = await Comment.find({ postId: post._id }).sort({ createdAt: -1 });

    // Dynamic SEO-friendly metadata
    const plainText = post.body.replace(/(<([^>]+)>)/gi, '');
    const locals = {
      title: post.title,
      description: plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText
    };

    res.render('post', {
      locals,
      data: post,
      comments,
      currentRoute: `/post/${slug}`
    });
  } catch (error) {
    console.error('Post view error:', error);
    res.status(500).send("Server Error");
  }
});

// Like a post
router.post('/like/:id', async (req, res) => {
  try {
    const postId = req.params.id;

    if (!req.session.likedPosts) req.session.likedPosts = [];

    if (req.session.likedPosts.includes(postId)) {
      return res.status(400).json({ success: false, message: 'Already liked' });
    }

    const post = await Post.findByIdAndUpdate(postId, { $inc: { likes: 1 } }, { new: true });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    req.session.likedPosts.push(postId);

    res.json({ success: true, likes: post.likes });
  } catch (err) {
    console.error('Like error:', err);
    res.status(500).json({ success: false });
  }
});

// Submit a comment
router.post('/add', async (req, res) => {
  try {
    const { postId, username, text } = req.body;

    if (!postId || !username || !text || !username.trim() || !text.trim()) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const comment = new Comment({
      postId,
      username: username.trim(),
      text: text.trim()
    });

    await comment.save();
    res.status(200).json({ success: true, comment });
  } catch (err) {
    console.error('Comment error:', err);
    res.status(500).json({ success: false });
  }
});

// Search posts
router.post('/search', async (req, res) => {
  try {
    const rawSearch = req.body.searchTerm || '';
    const searchTerm = rawSearch.replace(/[^a-zA-Z0-9 ]/g, "").trim();

    if (!searchTerm) {
      return res.render('search', {
        data: [],
        locals: {
          title: "Search",
          description: "Search results"
        },
        currentRoute: '/search'
      });
    }

    const data = await Post.find({
      $or: [
        { title: new RegExp(searchTerm, 'i') },
        { body: new RegExp(searchTerm, 'i') }
      ]
    });

    res.render('search', {
      data,
      locals: {
        title: "Search",
        description: `Search results for "${searchTerm}"`
      },
      currentRoute: '/search'
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).send("Search error");
  }
});

// Static pages
router.get('/about', (req, res) => {
  res.render('about', {
    currentRoute: '/about'
  });
});

router.get('/contact', (req, res) => {
  res.render('contact', {
    currentRoute: '/contact'
  });
});

module.exports = router;
