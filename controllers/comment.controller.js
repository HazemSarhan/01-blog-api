import { PrismaClient } from '@prisma/client';
let prisma = new PrismaClient();
import { StatusCodes } from 'http-status-codes';
import BadRequestError from '../errors/bad-request.js';
import NotFoundError from '../errors/not-found.js';
import checkPermission from '../utils/checkPermissions.js';

export const createComment = async (req, res) => {
  const { id: blogId } = req.params;
  const userId = req.user.userId;
  const { content } = req.body;

  // check if blog exists
  const blog = await prisma.blog.findUnique({
    where: {
      id: parseInt(blogId, 10),
    },
  });
  if (!blog) {
    throw new NotFoundError(`No blog with id : ${blogId}`);
  }

  // check if user commented before or no
  const existingComment = await prisma.comment.findFirst({
    where: {
      userId: userId,
      blogId: parseInt(blogId, 10),
    },
  });

  if (existingComment) {
    throw new BadRequestError('You have already commented on this blog');
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      blogId: parseInt(blogId, 10),
      userId,
    },
  });

  res.status(StatusCodes.CREATED).json({ comment });
};

export const getAllComments = async (req, res) => {
  const comments = await prisma.comment.findMany();
  res.status(StatusCodes.OK).json({ comments });
};

export const getBlogComments = async (req, res) => {
  const { id: blogId } = req.params;

  const blog = await prisma.blog.findUnique({
    where: {
      id: parseInt(blogId, 10),
    },
  });
  if (!blog) {
    throw new BadRequestError(`No blog with id : ${blogId}`);
  }

  const comments = await prisma.comment.findMany({
    where: {
      blogId: parseInt(blogId, 10),
    },
  });
  res.status(StatusCodes.OK).json({ comments });
};

export const updateComment = async (req, res) => {
  const { id: commentId } = req.params;
  const { content } = req.body;
  const userId = req.user.userId;

  const comment = await prisma.comment.findUnique({
    where: {
      id: parseInt(commentId, 10),
    },
  });
  if (!comment) {
    throw new NotFoundError(`No comment with id : ${commentId}`);
  }

  console.log(userId);
  console.log(comment.userId);

  checkPermission({ userId }, comment.userId);

  const updatedComment = await prisma.comment.update({
    where: {
      id: parseInt(commentId, 10),
    },
    data: {
      content,
    },
  });

  res.status(StatusCodes.OK).json({ comment: updatedComment });
};

export const deleteComment = async (req, res) => {
  const { id: commentId } = req.params;
  const userId = req.user.userId;

  const comment = await prisma.comment.findUnique({
    where: {
      id: parseInt(commentId, 10),
    },
  });
  if (!comment) {
    throw new NotFoundError(`No comment with id : ${commentId}`);
  }

  checkPermission({ userId }, comment.userId);

  await prisma.comment.delete({
    where: {
      id: parseInt(commentId, 10),
    },
  });
  res.status(StatusCodes.OK).json({ msg: 'Comment deleted' });
};
