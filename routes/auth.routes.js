import express from 'express';
import { register, login, logout } from '../controllers/auth.controller.js';
import validateRequest from '../middleware/validation.js';
import { registerSchema } from '../validation/register.schema.js';
const router = express.Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', login);
router.get('/logout', logout);

export default router;
