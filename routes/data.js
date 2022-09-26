import express from 'express';
import { deleteMediaFromList, deleteReview, getMedias, getGenres, getMediaInList, getMediaSrc, getQuery, getReview, getUser, getUserGenres, getUserList, getUserReviews, getUserKeepWatching, getUserRole, getUsers, getViewLog, putMediaInList, putReview, putViewLog, getMediaSrcsAndProgress, getUserViewLogs, putUserData, deleteUser, postUser, putMediaData, deleteMedia, postMedia, getMediaReviewData, getListedData, putUserPassword, getUserBankDetails, postFile, postGenre, backupDB, restoreDB, getMostLiked, getMostDisliked, getMostListed, getMedia, getMediasList } from '../controllers/data.js';

export const router = express.Router();

router.get('/user', getUser);
router.get('/user/role', getUserRole);
router.get('/user/genres', getUserGenres);
router.get('/user/list', getUserList);
router.get('/user/bank', getUserBankDetails);
router.get('/user/:user/reviews', getUserReviews);
router.get('/user/:user/viewlogs', getUserViewLogs);
router.get('/user/keepwatching', getUserKeepWatching);

router.post('/user', postUser);

router.put('/user', putUserData);
router.put('/user/password', putUserPassword);

router.delete('/user/:user', deleteUser);

router.get('/users', getUsers);

router.get('/review', getReview);
router.put('/review', putReview);
router.delete('/review', deleteReview);

router.get('/genres', getGenres);
router.post('/genre', postGenre);

router.get('/mediaSrc/:id', getMediaSrc);

router.get('/media/:id/mediaSrc/progress', getMediaSrcsAndProgress);

router.get('/media/:id/list', getMediaInList);
router.put('/media/:id/list', putMediaInList);
router.delete('/media/:id/list', deleteMediaFromList);

router.get('/viewLog', getViewLog);
router.put('/viewlog', putViewLog);

router.get('/media/:mediaId/reviewData', getMediaReviewData);
router.get('/media/:mediaId/listedData', getListedData);

router.post('/upload', postFile);

router.get('/db/backup', backupDB);
router.post('/db/restore', restoreDB);

router.get('/review/mostliked', getMostLiked);
router.get('/review/mostdisliked', getMostDisliked);

router.get('/media/mostListed', getMostListed);

router.get('/media/:id', getMedia);
router.put('/media', putMediaData);
router.post('/media', postMedia);
router.delete('/media/:media', deleteMedia);

router.get('/medias', getMedias);
router.get('/medias/genre/:genre', getMediasList)

router.get('/medias/search/:query', getQuery);

export default router;