import express from 'express';
import { deleteMediaFromList, getGenres, getMediaInList, getMediaSrc, getReview, getUser, getUserGenres, getUserList, getUserRole, putMediaInList, putReview } from '../controllers/data.js';

export const router = express.Router();

router.get('/user', getUser);
router.get('/user/role', getUserRole);
router.get('/user/genres', getUserGenres);
router.get('/user/list', getUserList);

router.get('/genres', getGenres);

router.get('/mediaSrc/:id', getMediaSrc);

router.get('/media/review', getReview);
router.put('/media/review', putReview);

router.get('/media/:id/list', getMediaInList);
router.put('/media/:id/list', putMediaInList);
router.delete('/media/:id/list', deleteMediaFromList);

export default router;