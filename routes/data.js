import express from 'express';
import { getGenres, getUser, getUserGenres } from '../controllers/data.js';

export const router = express.Router();

router.get('/user', getUser);
router.get('/user/genres', getUserGenres);

router.get('/genres', getGenres);

export default router;