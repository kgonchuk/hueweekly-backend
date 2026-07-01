import mongoose from "mongoose";
import Post from "../models/Post.js";

export async function createPost(req, res) {
  try {
    if (!req.user) {
        return res.status(401).json({ message: "Користувач не авторизований" });
    }
    const { title, place, latitude, longitude } = req.body;
    if (!req.file) {
        return res.status(400).json({ message: "Фото не отримано від сховища Cloudinary" });
    }
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ message: "Некоректні координати" });
    }
    const photoUrl = req.file.path; 
    const userId = req.user._id || req.user.id;
    const postData = {
      title,
      image: photoUrl, 
      location: {
        name: place || "Невідома локація",
        latitude: lat,
        longitude: lon,
      },
      author: mongoose.Types.ObjectId.isValid(userId) 
    ? new mongoose.Types.ObjectId(userId) 
    : userId,
    };
    const post = await Post.create(postData);
    const populatedPost = await Post.findById(post._id).populate("author", "displayname avatarUrl");
    
    return res.status(201).json(populatedPost);
  } catch (err) {
  console.error("❌ КРИТИЧНА ПОМИЛКА БЕКЕНДУ:", err);
    return res.status(500).json({ message: "Помилка сервера", error: err.message });
  }
}


export async function addComment(req, res) {
  try {
    const { postId } = req.params;
    const { text } = req.body; 
    const authorId = req.user._id; 

    if (!authorId) {
      return res.status(401).json({ message: "Автор не ідентифікований (відсутній токен)" });
    }
const newCommentData = { text, author: authorId, postId };
  const updatedPost = await Post.findByIdAndUpdate(
  postId,
  { $push: { comments: newCommentData } },
  { new: true }
);

    if (!updatedPost) {
      return res.status(404).json({ message: "Пост не знайдений" });
    }

const populatedPost = await Post.findById(postId).populate({
  path: "comments.author",
  select: "username avatar email", 
  model: "User"                    
});

const validComments = populatedPost.comments.filter(c => c && c.author);
const newComment = validComments[validComments.length - 1];
res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ message: "Помилка сервера" });
  }
}

export async function toggleLike(req, res) {
  try {
    const { postId } = req.params;
    const userId = req.user.id; 
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Пост не знайдено" });

    const isLiked = post.likes.includes(userId);
    const updateQuery = isLiked 
      ? { $pull: { likes: userId } } 
      : { $addToSet: { likes: userId } };

    const updatedPost = await Post.findByIdAndUpdate(postId, updateQuery, { new: true });
    res.status(200).json({ likes: updatedPost.likes });
  } catch (err) {
    res.status(500).json({ message: "Помилка сервера" });
  }
}