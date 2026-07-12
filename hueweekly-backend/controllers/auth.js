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
  console.log("Отримане тіло запиту:", req.body);
  console.log("=== БЕКЕНД ОТРИМАВ ЗАПИТ ===");
  console.log("req.body:", req.body);
  try {
    const { displayname, email, password } = req.body;
   if (!email || !password || !displayname) {
      return res.status(400).json({ 
        message: "Відсутні обов'язкові поля", 
        received: { displayname, email, password: password ? "присутній" : "відсутній" } 
      });
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
   return res.status(201).json({ 
      message: "Користувача створено",
      accessToken,  
      refreshToken,
      user: { 
        id: newUser._id, 
        displayname: newUser.displayname,
        email: newUser.email,
      } 
    });
  } catch (err) {
 console.error("Помилка під час реєстрації:", err);
    return res.status(500).json({ message: "Помилка сервера" });
  }
}

export async function login(req, res) {
  try {
    const { email, password} = req.body;
    const user = await User.findOne({ email });             
    if (!user) {
      return res.status(400).json({ message: "Невірний email або пароль" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Невірний email або пароль" });
    }
    const { accessToken, refreshToken } = generateToken(user);
    await User.findByIdAndUpdate(user._id, { token: refreshToken });
    res.json({ 
  accessToken, 
  refreshToken, 
  user: { 
    id: user._id, 
    displayname: user.displayname, 
    email: user.email, 
    avatarUrl: user.avatarUrl
  } 
});
  } catch (err) {
    res.status(500).json({ message: "Помилка сервера" });
  }
}   

export async function logout(req, res) {
  try {
    const userId = req.user.id;
    await User.findByIdAndUpdate(userId, { token: null });
    res.json({ message: "User logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: "Помилка сервера" });
  }
}     

export async function getCurrentUser(req, res) {
  try {
   
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "Користувач не знайдений" });

    res.status(200).json({ 
        username: user.username, 
        email: user.email, 
        avatar: user.avatarUrl
    });
  } catch (err) {
    res.status(500).json({ message: "Помилка сервера" });
  }
}


export async function updateAvatar(req, res) {
  console.log("=== БЕКЕНД: req.user ===", req.user);
  console.log("=== БЕКЕНД: req.file ===", req.file);
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Фото не отримано від сховища Cloudinary" });
    }
    const avatarUrlFromCloudinary = req.file.path; 
    const userId = req.user._id || req.user.id;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatarUrl: avatarUrlFromCloudinary },
     { returnDocument: 'after' }
    );
    return res.status(200).json({
      message: "Аватар успішно оновлено",
      avatarUrl: updatedUser.avatarUrl 
    });

  } catch (err) {
    console.error("❌ ПОМИЛКА ОНОВЛЕННЯ АВАТАРА:", err);
    return res.status(500).json({ message: "Помилка сервера", error: err.message });
  }
}