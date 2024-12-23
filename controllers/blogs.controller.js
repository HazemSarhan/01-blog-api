import { PrismaClient } from '@prisma/client';
let prisma = new PrismaClient();
import { StatusCodes } from 'http-status-codes';
import BadRequestError from '../errors/bad-request.js';
import NotFoundError from '../errors/not-found.js';
import cloudinary from '../configs/cloudinaryConfig.js';

export const createBlog = async (req, res) => {
  const { title, description } = req.body;
  const userId = req.user.userId;

  if (!title || !description) {
    throw new BadRequestError('Please provide all values');
  }

  let image = '/uploads/default.jpeg';
  if (req.files && req.files.image) {
    const result = await cloudinary.uploader.upload(
      req.files.image.tempFilePath,
      {
        use_filename: true,
        folder: 'lms-images',
      },
    );
    image = result.secure_url;
  }

  const blog = await prisma.blog.create({
    data: {
      title,
      description,
      image,
      userId,
    },
  });

  res.status(StatusCodes.CREATED).json({ blog });
};

export const getAllBlogs = async (req, res) => {
  const blogs = await prisma.blog.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });
  const blogsWithReactionCounts = await Promise.all(
    blogs.map(async (blog) => {
      const [likeCount, dislikeCount] = await Promise.all([
        prisma.reaction.count({
          where: {
            blogId: blog.id,
            type: 'LIKE',
          },
        }),
        prisma.reaction.count({
          where: {
            blogId: blog.id,
            type: 'DISLIKE',
          },
        }),
      ]);

      return { ...blog, likeCount, dislikeCount };
    }),
  );

  res.status(StatusCodes.OK).json({ blogs: blogsWithReactionCounts });
};

export const getBlogById = async (req, res) => {
  const { id: blogId } = req.params;
  const blog = await prisma.blog.findUnique({
    where: {
      id: parseInt(blogId, 10),
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });
  res.status(StatusCodes.OK).json({ blog });
};

export const updateBlog = async (req, res) => {
  const { id: blogId } = req.params;
  const { title, description } = req.body;
  const blog = await prisma.blog.findUnique({
    where: {
      id: parseInt(blogId, 10),
    },
  });

  let image = blog.image;
  if (req.files && req.files.image) {
    const result = await cloudinary.uploader.upload(
      req.files.image.tempFilePath,
      {
        use_filename: true,
        folder: 'lms-images',
      },
    );
    image = result.secure_url;
  }

  const updateBlog = await prisma.blog.update({
    where: {
      id: parseInt(blogId, 10),
    },
    data: {
      title,
      description,
      image,
    },
  });
  res.status(StatusCodes.OK).json({ updateBlog });
};

export const deleteBlog = async (req, res) => {
  const { id: blogId } = req.params;
  const blog = await prisma.blog.findUnique({
    where: {
      id: parseInt(blogId, 10),
    },
  });
  if (!blog) {
    throw new NotFoundError(`No blog with id : ${blogId}`);
  }

  // delete all reactions associated with the blog
  await prisma.reaction.deleteMany({
    where: {
      blogId: parseInt(blogId, 10),
    },
  });

  await prisma.blog.delete({
    where: {
      id: parseInt(blogId, 10),
    },
  });
  res.status(StatusCodes.OK).json({ msg: 'Blog deleted' });
};
