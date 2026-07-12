import express from "express"; 
import Post from "../models/Post.js";
import authenticate from "../middlware/auth.js";
import { addComment, createPost, toggleLike } from "../controllers/post.js";
import upload from "../config/cloudinary.js";

const router = express.Router();


router.post("/:postId/comments", authenticate, addComment);

router.post("/", authenticate, upload.single("photo"), createPost);

router.get("/", authenticate, async (req, res) => {
  try {
    const totalDocsInDb = await Post.countDocuments();
    console.log("📊 КІЛЬКІСТЬ ПОСТІВ У БАЗІ ДАНИХ:", totalDocsInDb);
    const posts = await Post.find()
  .sort({ createdAt: -1 }) 
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