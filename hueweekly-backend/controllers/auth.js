import User from "../models/User.js";
import bcrypt from "bcrypt"; 
import jwt from "jsonwebtoken";

const ACCESS_EXPIRES = "1h";
const REFRESH_EXPIRES = "7d";

export function generateToken(user) {
  const accessToken = jwt.sign(
    {
      id: user._id,
      displayname: user.displayname,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_EXPIRES }
  );

  const refreshToken = jwt.sign(
    {
      id: user._id,

    },
    process.env.JWT_SECRET,
    { expiresIn: REFRESH_EXPIRES }
  );

  return { accessToken, refreshToken };
}


export async function register(req, res) {
  try {
    const { displayname, email, password } = req.body;
    if (!email || !password || !displayname) {
      return res.status(400).json();
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Користувач з таким email вже існує" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ 
        displayname, 
        email, 
        password: hashedPassword 
    });
    await newUser.save();
    const { accessToken, refreshToken } = generateToken(newUser);
    res.status(201).json({ 
      message: "Користувача створено",
      user: { 
        id: newUser._id, 
        displayname: newUser.displayname,
        email: newUser.email,
      } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Помилка сервера" });
  }
}