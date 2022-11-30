const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const dotenv = require("dotenv");
const app = express();

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
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback", // Replace with your callback URL
    },
    (accessToken, refreshToken, profile, done) => {
      // Handle user authentication and authorization
      // You can create or update the user in your database here
      // Call done() to indicate the authentication process is complete
      done(null, profile);
    }
  )
);

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

const userRoutes = require("./routes/UserRouter");
const postRoutes = require("./routes/PostRouter");
app.use(express.json());

// Define your routes

// Initiate Google authentication
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth2 callback
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // Successful authentication, redirect or respond with data as needed
    res.redirect("/profile");
  }
);

// Profile page (protected route)
app.get("/profile", (req, res) => {
  // Access user information from req.user
  res.send(`Welcome, ${req.user.displayName}!`);
});

app.use("/users", userRoutes);
app.use("/post", postRoutes);
app.get("/", (req, res) => {
  res.send("testing 1 ");
});
// Start the server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
