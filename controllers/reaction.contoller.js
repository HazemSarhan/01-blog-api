import { PrismaClient } from '@prisma/client';
let prisma = new PrismaClient();
import { StatusCodes } from 'http-status-codes';
import BadRequestError from '../errors/bad-request.js';

export const BlogLike = async (req, res) => {
  const { id: blogId } = req.params;
  const userId = req.user.userId;

  const blog = await prisma.blog.findUnique({
    where: {
      id: parseInt(blogId, 10),
    },
  });
  if (!blog) {
    throw new BadRequestError(`No blog with id : ${blogId}`);
  }

  // Check if the user already liked the post
  const existingLike = await prisma.reaction.findFirst({
    where: {
      userId: userId,
      blogId: parseInt(blogId, 10),
      type: 'LIKE',
    },
  });

  if (existingLike) {
    // If a like already exists, return an error
    throw new BadRequestError('You have already liked this post');
  }

  const like = await prisma.reaction.create({
    data: {
      blogId: parseInt(blogId, 10),
      userId,
      type: 'LIKE',
    },
  });

  res.status(StatusCodes.OK).json({ like });
};

export const BlogDislike = async (req, res) => {
  const { id: blogId } = req.params;
  const userId = req.user.userId;

  const blog = await prisma.blog.findUnique({
    where: {
      id: parseInt(blogId, 10),
    },
  });
  if (!blog) {
    throw new BadRequestError(`No blog with id : ${blogId}`);
  }

  // Check if the user already disliked the post
  const existingDislike = await prisma.reaction.findFirst({
    where: {
      userId: userId,
      blogId: parseInt(blogId, 10),
      type: 'DISLIKE',
    },
  });

  if (existingDislike) {
    // If a dislike already exists, return an error
    throw new BadRequestError('You have already disliked this post');
  }

  // If the user liked, remove the like
  await prisma.reaction.deleteMany({
    where: {
      blogId: parseInt(blogId, 10),
      userId,
      type: 'LIKE',
    },
  });

  const dislike = await prisma.reaction.create({
    data: {
      blogId: parseInt(blogId, 10),
      userId,
      type: 'DISLIKE',
    },
  });

  res.status(StatusCodes.OK).json({ dislike });
};

export const getAllReactions = async (req, res) => {
  const reactions = await prisma.reaction.findMany();
  res.status(StatusCodes.OK).json({ reactions });
};

export const getBlogReactions = async (req, res) => {
  const { id: blogId } = req.params;

  const blog = await prisma.blog.findUnique({
    where: {
      id: parseInt(blogId, 10),
    },
  });
  if (!blog) {
    throw new BadRequestError(`No blog with id : ${blogId}`);
  }

  const reactions = await prisma.reaction.findMany({
    where: {
      blogId: parseInt(blogId, 10),
    },
  });

  res.status(StatusCodes.OK).json({ reactions });
};
