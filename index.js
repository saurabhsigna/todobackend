const express = require("express");
const session = require("express-session");
const passport = require("./controllers/PassportFile");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/GoogleAuthRouter");
const userRoutes = require("./routes/UserRouter");
const postRoutes = require("./routes/PostRouter");
const localRoutes = require("./routes/LocalAuthRouter");
const testingRoutes = require("./routes/TestingRouter");
const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URI,
    credentials: true,
  })
);
dotenv.config();

// Set up session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Configure Passport.js with Google OAuth2 strategy

app.use(express.json());

app.get("/", (req, res) => {
  res.send("testing 6 ");
});

// Profile page (protected route)
app.get("/profile", (req, res) => {
  res.send("hello");
});
app.get(
  "/protected",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // This route will only be accessible if a valid JWT is provided in the Authorization header.
    // You can access the authenticated user using req.user.
    res.json({
      message: "Protected route accessed successfully!",
      user: req.user,
    });
  }
);
app.use("/users", userRoutes);
app.use("/post", postRoutes);
app.use("/", localRoutes);
app.use("/auth", authRoutes);
app.use("/", testingRoutes);
// Start the server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
