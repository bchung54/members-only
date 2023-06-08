const Member = require('../models/member');
const Message = require('../models/message');
const bcrypt = require('bcryptjs');
const passport = require('passport');

const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

// Display Sign Up form on GET.
exports.signup_get = (req, res, next) => {
  res.render('partials/forms/signup_form', {
    member: '',
    action_list: ['/'],
    errors: '',
  });
};

// Handle Sign Up form on POST.
exports.signup_post = [
  // Validate and sanitize fields.
  body('first_name')
    .trim()
    .notEmpty()
    .escape()
    .withMessage('First name must be specified.'),
  body('last_name')
    .trim()
    .notEmpty()
    .escape()
    .withMessage('First name must be specified.'),
  body('username')
    .isLength({ min: 5 })
    .escape()
    .withMessage('Username must be at least 5 characters long.')
    .isAlphanumeric()
    .withMessage(
      'Username cannot include special characters, spaces or symbols.'
    )
    .custom(async (username) => {
      const member = await Member.findOne({ username: username }).exec();

      if (member) {
        throw new Error('Username already in use.');
      }
    })
    .withMessage('Username is already in use.'),
  body('password')
    .isLength({ min: 8 })
    .escape()
    .withMessage('Password must be at least 8 characters long.')
    .not()
    .isLowercase()
    .not()
    .isUppercase()
    .not()
    .isNumeric()
    .not()
    .isAlpha()
    .withMessage(
      'Password must contain each of the following: lowercase, uppercase and number.'
    ),
  body('confirmPassword').custom(async (confirmPassword, { req }) => {
    const password = req.body.password;

    if (password !== confirmPassword) {
      throw new Error('Passwords must be the same.');
    }
  }),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create Member object with data.
    const member = new Member({
      username: req.body.username,
      password: req.body.password,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      status: 'user',
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render('partials/forms/signup_form', {
        member: member,
        action_list: ['/'],
        errors: errors.array(),
      });
    } else {
      bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
        // if err, do something
        if (err) {
          return next(err);
        }
        // otherwise, store hashedPassword in DB
        try {
          const member = new Member({
            username: req.body.username,
            password: hashedPassword,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            status: 'user',
            admin: req.body.admin ? true : false,
          });
          // Data from form is valid.
          // Save member.
          await member.save();
          res.redirect('/');
        } catch (err) {
          return next(err);
        }
      });
    }
  }),
];

// Display Login form on GET.
exports.login_get = (req, res, next) => {
  res.render('partials/forms/login_form', {
    action_list: ['/'],
    errors: '',
  });
};

// Display Login form on GET.
exports.login_post = passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/',
});

// Display Secret form on GET.
exports.secret_get = (req, res, next) => {
  if (!res.locals.currentUser) {
    res.redirect('/login');
    return;
  }
  if (
    res.locals.currentUser.status === 'club' ||
    res.locals.currentUser.admin
  ) {
    res.send("You're already in!");
    return;
  }
  res.render('partials/forms/secret_form', {
    action_list: ['/'],
    errors: '',
  });
};

// Display Secret form on GET.
exports.secret_post = [
  // Validate and sanitize secret field.
  body('secret').notEmpty().trim().escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Process request after validation and sanitization.
    if (!errors.isEmpty()) {
      // There are errors.
      res.render('partials/forms/secret_form', {
        action_list: ['/'],
        errors: errors.array(),
      });
    } else if (req.body.secret !== process.env.CLUB_SECRET) {
      // Secret was incorrect.
      res.render('partials/forms/secret_form', {
        action_list: ['/'],
        errors: [new Error("Sorry that's not the correct secret")],
      });
    } else {
      const member = await Member.findById(res.locals.currentUser._id);
      member.status = 'club';
      await member.save();
      res.send("Congrats, you're in!");
    }
  }),
];

// Display new message form on GET.
exports.new_message_get = asyncHandler(async (req, res, next) => {
  if (!res.locals.currentUser) {
    res.redirect('/login');
  } else {
    res.render('partials/forms/new_message_form', {
      action_list: ['/'],
      message: '',
      errors: '',
    });
  }
});

// Display new message form on POST.
exports.new_message_post = [
  // Validate and sanitize fields.
  body('title').notEmpty().trim().escape(),
  body('message').notEmpty().trim().escape(),
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Find current user's Member object in DB.
    const member = await Member.findOne({
      username: res.locals.currentUser.username,
    });

    // Create Message object with escaped and trimmed data.
    const message = new Message({
      member: member,
      title: req.body.title,
      text: req.body.message,
    });

    if (!errors.isEmpty()) {
      res.render('partials/forms/new_message_form', {
        action_list: ['/'],
        message: message,
        errors: errors.array(),
      });
    } else {
      await message.save();
      res.redirect('/');
    }
  }),
];

exports.delete_message_post = asyncHandler(async (req, res, next) => {
  // No checks before removal
  await Message.findByIdAndDelete(req.body.delete);
  res.redirect('/');
});
