const User = require('../models/Usermodel');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const transporter = require('../middleware/nodemailer');
const crypto = require('crypto');
const sharp = require('sharp');

exports.getHomePage = (req, res, next) => {
    res.render('home',{ pageTitle: "Sam's app"})
};

exports.getLogin = (req, res, next) => {
    const errors = req.flash('error');
    let error = null;
    if (errors.length >0) {
        error = errors[0];
    };
    res.render('login', {pageTitle: 'Login here', errorMessage: error })
};

exports.postLogin = async (req, res, next) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            req.flash('error', "Username doesn't exist, you can sign up here");
            return res.redirect('/register')
        } 
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                req.flash('error', 'Wrong password')
                res.redirect('/login')
            } else {
                req.session.isLoggedIn = true;
                req.session.user = user;
                res.redirect('/')
            }
        
    } catch (e) {
        next(e)
    }
};

exports.getRegister = (req, res, next) => {
    const errors = req.flash('error');
    let error = null;
    if (errors.length >0) {
        error = errors[0];
    };
    res.render('register', {
        pageTitle: 'Register here',
        errorMessage: error,
    });
};

exports.postRegister = async (req, res, next) => {
    const { username, password, email } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('register', {
            pageTitle: 'Register',
            errorMessage: errors.array()[0].msg,
        })
      }
    try {
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({
            email,
            username,
            password: hashedPassword,
        });
        await user.save();
        res.redirect('/login');
    } catch (e) {
        next(e)
    }

};

exports.getAccount = (req, res, next) => {
    res.render('account', {
        pageTitle: 'Your account',
        errorMessage: null,
    })
};

exports.updateAccount = async (req, res, next) => {
    const { username, password, email } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('account', {
            pageTitle: 'Your account',
            errorMessage: errors.array()[0].msg,
        })
      }
    try {
        const hashedPassword = await bcrypt.hash(password, 12);
        const obj = {
            username,
            email,
            password: hashedPassword,
        }
        await User.findByIdAndUpdate(req.user._id, obj);
        res.redirect('/login');
    } catch (e) {
        next(e)
    }
};

exports.logOut = async (req, res, next) => {
    await req.session.destroy();
    res.redirect('/')
};

exports.getLogout = (req, res, next) => {
    res.render('logout', {
        pageTitle: 'Logout',
    })
};

exports.getForgot = (req, res, next) => {
    const errors = req.flash('error');
    let error = null;
    if (errors.length >0) {
        error = errors[0];
    };
    res.render('forgot', {
        pageTitle: 'Forgot your password?',
        errorMessage: error,
    });
};

exports.postForgot = async (req, res, next) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if(!user) {
            req.flash('error', "Email address doesn't exist");
            res.redirect('/forgot')
        };
        const token = crypto.randomBytes(32).toString('hex');
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        await user.save();
        await transporter.sendMail({
            to: email,
            from: process.env.EMAIL,
            subject: 'Reset request',
            html: `
        <p>Click here to set a new password: <a href="${process.env.HOME_URL}/reset/${token}" >LINK</a>
        `
        });
        res.redirect('/')
    } catch(e) {
        res.send(e)
    }
};

exports.getResetPage = async (req, res, next) => {
    const { token } = req.params;
    const user = await User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}});
    if (!user) {
        req.flash('error', "Token has expired");
        res.redirect('/forgot')
    };

    res.render('resetpage', {
        pageTitle: 'Reset your password',
        passwordToken: token,
        userId: user._id.toString(),
    })
};

exports.resetpassword = async (req, res, next) => {
    const { password, userId } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 12);
        await User.findByIdAndUpdate(userId, {
            password: hashedPassword,
            resetToken: null,
            resetTokenExpiration: null,
        });
        res.redirect('/login')
    } catch (e) {
        next(e)
    }
};

exports.getImage = (req, res, next) => {
    res.render('postimage', {
        pageTitle: 'Upload an image',
    })
};

exports.postImage = async (req, res, next) => {
  try {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250}).png().toBuffer();
    await User.findByIdAndUpdate(req.user._id, {image: buffer });
    res.redirect('/')
  } catch (e) {
      next(e)
  }
};

exports.seeImage = async (req, res, next) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id);
        
        if ( !user ||  !user.image ) {
            throw new Error();
        } else {
            res.set('Content-Type', 'image/png');
            res.send(user.image)
        }
    } catch (e) {
        next(e);
    }
};
exports.authTask = (req, res, next) => {
    res.send('yeet')
};