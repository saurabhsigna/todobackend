const passport = require("passport");

// Initiate Google authentication
const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
});

// Google OAuth2 callback
const googleCallback = passport.authenticate("google", {
  failureRedirect: "/login",
});

// Redirect or respond with data after successful authentication
const googleCallbackHandler = (req, res) => {
  res.redirect("/profile");
};

module.exports = {
  googleAuth,
  googleCallback,
  googleCallbackHandler,
};
