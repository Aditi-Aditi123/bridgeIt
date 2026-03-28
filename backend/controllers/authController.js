import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// REGISTER
export const register = async (req, res) => {
  try {
    console.log('Register body:', req.body); // helps debugging

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });

  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    console.log('Login body:', req.body); // helps debugging

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const match = await user.matchPassword(password);
    if (!match) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: err.message });
  }
};