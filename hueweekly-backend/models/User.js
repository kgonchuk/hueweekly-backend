import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  displayname: { type: String, required: true },
  password: { type: String, required: true }, 
  googleId: { type: String },
  avatarUrl: { 
    type: String, 
    default: null 
  },
  token: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", UserSchema);