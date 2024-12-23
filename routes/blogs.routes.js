import express from 'express';
import {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
} from '../controllers/blogs.controller.js';
import {
  authenticatedUser,
  authorizePermissions,
} from '../middleware/authentication.js';
import validateRequest from '../middleware/validation.js';
import { blogSchema } from '../validation/blog.schema.js';

const router = express.Router();

router
  .route('/')
  .get(getAllBlogs)
  .post([authenticatedUser], validateRequest(blogSchema), createBlog);
router
  .route('/:id')
  .get(getBlogById)
  .patch([authenticatedUser, authorizePermissions('ADMIN')], updateBlog)
  .delete([authenticatedUser, authorizePermissions('ADMIN')], deleteBlog);

export default router;
