import express from 'express';
import {
  createComment,
  getAllComments,
  getBlogComments,
  updateComment,
  deleteComment,
} from '../controllers/comment.controller.js';
import { authenticatedUser } from '../middleware/authentication.js';

const router = express.Router();

router.route('/').get(getAllComments);
router.route('/:id/create').post([authenticatedUser], createComment);
router
  .route('/:id')
  .get(getBlogComments)
  .patch([authenticatedUser], updateComment)
  .delete([authenticatedUser], deleteComment);

export default router;
