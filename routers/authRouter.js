const express = require('express');
const router = express.Router();
const { getHomePage, getLogin, getRegister, postRegister, postLogin, getAccount, logOut, getLogout, updateAccount,
     getForgot, postForgot, getResetPage, resetpassword, getImage, postImage, seeImage, authTask } = require('../controllers/authController');
const auth = require('../middleware/auth');
const { body } = require('express-validator');


router.get('/', getHomePage);

router.get('/login', getLogin);

router.post('/login', postLogin);

router.get('/register', getRegister);

router.post('/register',
    body('confirmpassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }
    return true;
  }),
  body('email').isEmail(),
  body('password').isLength({ min: 5 }),
    postRegister);

router.get('/account', auth, getAccount);

router.post('/update',
    body('confirmpassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            console.log('no confirm')
        throw new Error('Password confirmation does not match password');
        }
        return true;
    }),
    body('email').isEmail(),
    body('password').isLength({ min: 5 }).withMessage('Passwords should be at least 5 characters long.'),
    auth,
    updateAccount)

router.post('/logout', auth, logOut);

router.get('/logout', auth, getLogout);

router.get('/forgot', getForgot);

router.post('/forgot', postForgot);

router.get('/reset/:token', getResetPage);

router.get('/go', seeImage)

router.post('/resetpassword', resetpassword);

router.get('/image', getImage);

router.post('/image', auth, postImage);

router.get('/image/:id', seeImage);

module.exports = router;