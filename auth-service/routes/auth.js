// routes/auth.js
import { Router } from 'express';
import { signup, login, logout } from '../controllers/authController.js';
import { refreshAccessToken } from '../controllers/tokenController.js';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh', refreshAccessToken);
router.post('/logout', logout);

export default router;
