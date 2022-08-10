import express from 'express';
import { deleteMediaFromList, deleteReview, getMedias, getGenres, getMediaInList, getMediaSrc, getQuery, getReview, getUser, getUserGenres, getUserList, getUserReviews, getUserKeepWatching, getUserRole, getUsers, getViewLog, putMediaInList, putReview, putViewLog, getMediaSrcsAndProgress, getUserViewLogs } from '../controllers/data.js';

export const router = express.Router();

router.get('/user', getUser);
router.get('/user/role', getUserRole);
router.get('/user/genres', getUserGenres);
router.get('/user/list', getUserList);
router.get('/user/:user/reviews', getUserReviews);
router.get('/user/:user/viewlogs', getUserViewLogs);
router.get('/user/keepwatching', getUserKeepWatching);

router.get('/users', getUsers);

router.get('/medias', getMedias);

router.get('/medias/search/', getQuery);

router.get('/genres', getGenres);

router.get('/mediaSrc/:id', getMediaSrc);

router.get('/media/review', getReview);
router.put('/media/review', putReview);
router.delete('/media/review', deleteReview);

router.get('/media/:id/mediaSrc/progress', getMediaSrcsAndProgress);

router.get('/media/:id/list', getMediaInList);
router.put('/media/:id/list', putMediaInList);
router.delete('/media/:id/list', deleteMediaFromList);

router.get('/viewLog', getViewLog);
router.put('/viewlog', putViewLog);

export default router;