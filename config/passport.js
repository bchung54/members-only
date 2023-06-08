const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const Member = require('../models/member');

const verifyCallback = async (username, password, done) => {
  // Authenticates user by matching username and password to DB (bcrypt used for password matching)
  try {
    const user = await Member.findOne({ username: username });
    if (!user) {
      return done(null, false, { message: 'Incorrect username' });
    }
    bcrypt.compare(password, user.password, (err, res) => {
      if (res) {
        // passwords match! log user in
        return done(null, user);
      } else {
        // passwords do not match!
        return done(null, false, { message: 'Incorrect password' });
      }
    });
  } catch (err) {
    return done(err);
  }
};

const strategy = new LocalStrategy(verifyCallback);

passport.use(strategy);

// Keep user logged in through use of cookies
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function (id, done) {
  try {
    const user = await Member.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});
