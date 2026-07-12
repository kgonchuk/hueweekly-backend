import express from 'express'; 
import { register, login, logout, updateAvatar } from '../controllers/auth.js';
import authenticate from '../middlware/auth.js';
import upload  from '../config/cloudinary.js'; 
const router = express.Router();

router.post('/register', register)
router.patch('/avatar', authenticate, upload.single('avatar'), updateAvatar);
router.post('/login', login)
router.post('/logout',authenticate, logout);

export default router;