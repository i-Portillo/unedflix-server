import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

import User from '../models/user.js';

export const signin = async (req, res) => {

  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if(!existingUser) return res.status(404).json({ message: "User doesn't exist."});

    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);

    if(!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials."});

    const token = jwt.sign({ email: existingUser.email, id: existingUser._id, role: existingUser.role }, process.env.JWT_SECRET, {});

    res.status(200).json({ result: { id: existingUser._id, email: existingUser.email, role: existingUser.role }, token});

  } catch (err) {
    res.status(500).json({ message: "Something went wrong," });
  }
}

export const signup = async (req, res) => {
  const { email, password, confirmPassword, firstName, familyName } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if(existingUser) return res.status(404).json({ message: "User already exists."});

    if(password !== confirmPassword) return res.status(400).json({ message: "Passwords don't match."});

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await User.create({ email, password: hashedPassword });

    const token = jwt.sign({ email: existingUser.email, id: existingUser._id, role: existingUser.role }, process.env.JWT_SECRET, {});

    res.status(200).json({ result: existingUser, token});

  } catch(err) {
    res.status(500).json({ message: "Something went wrong," });
  }
}