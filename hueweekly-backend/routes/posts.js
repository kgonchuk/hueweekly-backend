import express from "express"; 
import Post from "../models/Post.js";
import authenticate from "../middleware/auth.js";
import { addComment, toggleLike } from "../controllers/post.js";

import { upload } from "../config/cloudinary.js"; 

const router = express.Router();


router.post("/:postId/comments", authenticate, addComment);

router.post("/", authenticate, upload.single("photo"), async (req, res) => {
  try {
    if (!req.user) {
        return res.status(401).json({ message: "Користувач не знайдений" });
    }
    
    const { title, place, latitude, longitude } = req.body;
    
    if (!req.file) {
        return res.status(400).json({ message: "Фото не отримано від сховища" });
    }
    const photoUrl = req.file.path; 

    const postData = {
      title,
      image: photoUrl, 
      location: {
        name: place || "",
        latitude: parseFloat(latitude) || 0,
        longitude: parseFloat(longitude) || 0,
      },
      author: req.user._id, 
    };

   const post = await Post.create(postData);
const populatedPost = await Post.findById(post._id).populate("author", "username avatar");
res.status(201).json(populatedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Отримання всіх постів
router.get("/", authenticate, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "username avatar")
      .populate("comments.author", "username avatar");
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Лайки
router.post("/:postId/toggleLike", authenticate, toggleLike);

export default router;