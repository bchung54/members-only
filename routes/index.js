const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Message = require('../models/message');

// Controller modules
const form_controller = require('../controllers/formController');

/* GET home page. */
router.get(
  '/',
  asyncHandler(async (req, res, next) => {
    const message_list = await Message.find({}).populate('member').exec();
    res.render('index', {
      action_list: ['login', 'signup'],
      message_list: message_list,
    });
  })
);

router.get('/signup', form_controller.signup_get);

router.post('/signup', form_controller.signup_post);

router.get('/secret', form_controller.secret_get);

router.post('/secret', form_controller.secret_post);

router.get('/login', form_controller.login_get);

router.post('/login', form_controller.login_post);

router.get('/new-message', form_controller.new_message_get);

router.post('/new-message', form_controller.new_message_post);

router.post('/delete-message', form_controller.delete_message_post);

router.get('/logout', (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

module.exports = router;
