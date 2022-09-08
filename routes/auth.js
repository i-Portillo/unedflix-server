import express from 'express';
import { allowThrough, loggedIn, signin, signout } from '../controllers/auth.js'

const router = express.Router();

router.post('/signin', signin);
router.post('/signout', signout)

router.get('/private', loggedIn, allowThrough);

export default router;