const passport = require("passport");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
const prisma = new PrismaClient();
const dotenv = require("dotenv");
dotenv.config();

const registerController = async (req, res) => {
  const { email, password, fullName } = req.body;

  try {
    // Validate user input
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if the user already exists in the database
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user using Prisma
    const newUser = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        provider: "LOCAL",
      },
    });

    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred during registration" });
  }
};

const loginController = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "An error occurred during login" });
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    req.logIn(user, (err) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "An error occurred during login" });
      }
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "15m",
      });

      return res.status(200).json({ message: token });
    });
  })(req, res, next);
};
module.exports = {
  registerController,
  loginController,
};
