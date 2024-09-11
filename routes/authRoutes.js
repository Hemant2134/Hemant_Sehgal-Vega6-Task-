const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const User = require('../models/user');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); 
  }
});

const upload = multer({ storage: storage });

router.post('/signup', upload.single('profileImage'), async (req, res) => {
  const { email, password } = req.body;
  const profileImage = req.file ? req.file.path : '';
  if (!email || !password) {
    return res.status(400).send('Email and password are required.');
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      password: hashedPassword,
      profileImage
    });
    await newUser.save();
    res.status(201).send('User registered successfully.');
  } catch (error) {
    res.status(500).send('An error occurred while registering the user.');
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send('Invalid credentials.');

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).send('Invalid credentials.');

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '4d' });
    res.json({ token });
  } catch (error) {
    res.status(500).send('An error occurred while logging in.');
  }
});

module.exports = router;
