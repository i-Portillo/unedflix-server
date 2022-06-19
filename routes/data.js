import express from 'express';
import { getUser } from '../controllers/data.js';

export const router = express.Router();

router.get('/user', getUser);

export default router;