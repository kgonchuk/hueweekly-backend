import express from "express"; 
import Post from "../models/Post.js";
import authenticate from "../middlware/auth.js";
import { addComment, createPost, toggleLike } from "../controllers/post.js";
import upload from "../config/cloudinary.js";

const router = express.Router();


router.post("/:postId/comments", authenticate, addComment);

router.post("/", authenticate, upload.single("photo"), createPost);

// Отримання всіх постів
router.get("/", authenticate, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "displayname avatarUrl")
      .populate("comments.author", "displayname avatarUrl");
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Лайки
router.post("/:postId/toggleLike", authenticate, toggleLike);

export default router;