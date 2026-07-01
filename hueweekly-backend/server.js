import dotenv from "dotenv";
import express from "express"; 
import mongoose from "mongoose"; 
import cors from "cors"; 
import connectDB from "./db.js"; 
import authRoute from "./routes/authRoute.js";
import postRoutes from "./routes/posts.js"

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();
app.get('/test', (req, res) => res.json({ status: "Сервер працює" }));

app.use('/api/auth', authRoute);
app.use("/api/posts", postRoutes);

app.use((err, req, res, next) => {
  console.error("💥 ГЛОБАЛЬНА ПОМИЛКА СЕРВЕРА:");
  console.error(err); // Виведе повний стек помилки з номерами рядків
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Сервер запущено на порті ${PORT}`));