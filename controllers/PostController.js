const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createPost = async (req, res) => {
  let authorId = "6468f2b0b53524dde254ad05";
  const newPost = await prisma.post.create({
    data: {
      title: "My First Post",
      description: "This is the content of my first post.",
      author: { connect: { id: authorId } },
    },
  });
  res.json({ message: "hi" });
};

const getPost = async (req, res) => {
  const { postId } = req.body;
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new Error("Post not found");
  }

  const author = await prisma.user.findUnique({
    where: { id: post.authorId },
    select: {
      fullName: true,
      // createdAt: true,
    },
  });

  // return { ...post, author };

  res.json({ ...post, author });
};
module.exports = {
  createPost,
  getPost,
};
