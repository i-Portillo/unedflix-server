import express from 'express';
import { deleteMediaFromList, deleteReview, getGenres, getMediaInList, getMediaSrc, getReview, getUser, getUserGenres, getUserList, getUserRole, getViewLog, putMediaInList, putReview, putViewLog } from '../controllers/data.js';

export const router = express.Router();

router.get('/user', getUser);
router.get('/user/role', getUserRole);
router.get('/user/genres', getUserGenres);
router.get('/user/list', getUserList);

router.get('/genres', getGenres);

router.get('/mediaSrc/:id', getMediaSrc);

router.get('/media/review', getReview);
router.put('/media/review', putReview);
router.delete('/media/review', deleteReview);

router.get('/media/:id/list', getMediaInList);
router.put('/media/:id/list', putMediaInList);
router.delete('/media/:id/list', deleteMediaFromList);

router.get('/viewLog', getViewLog);
router.put('/viewlog', putViewLog);

export default router;