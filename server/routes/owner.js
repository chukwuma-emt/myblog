const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const isOwner = require('../../middleware/isOwner');

const router = express.Router();

// Owner dashboard
router.get('/owner', isOwner, async (req, res) => {
  const users = await User.find({}); // exclude owner since it's not in DB
  res.render('owner/dashboard', { users });
});

// Register new user
router.post('/owner/register', isOwner, async (req, res) => {
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  await User.create({ username, password: hashed });
  res.redirect('/owner');
});

// Restrict a user
router.post('/owner/restrict/:id', isOwner, async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { role: 'restricted' });
  res.redirect('/owner');
});

// Unrestrict a user
router.post('/owner/unrestrict/:id', isOwner, async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { role: 'user' });
  res.redirect('/owner');
});

// Delete a user
router.post('/owner/delete/:id', isOwner, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.redirect('/owner');
});

module.exports = router;
