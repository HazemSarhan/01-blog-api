import express from 'express';
import {
  BlogLike,
  BlogDislike,
  getAllReactions,
  getBlogReactions,
} from '../controllers/reaction.contoller.js';
import { authenticatedUser } from '../middleware/authentication.js';

const router = express.Router();

router.route('/').get(getAllReactions);
router.route('/:id').get(getBlogReactions);
router.route('/:id/like').post([authenticatedUser], BlogLike);
router.route('/:id/dislike').post([authenticatedUser], BlogDislike);

export default router;
