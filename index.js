require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const multer = require('multer');
const upload = multer({
  limits: {
    fileSize: 1000000,
},
fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return cb(new Error('Please upload an image'))
    }
    cb(undefined, true)
}
});
const User = require('./models/Usermodel');
const { getErrorPage } = require('./controllers/errorController');

const app = express();
const store = new MongoDBStore({
    uri: process.env.MONGO_DB,
    collection: 'sessions'
  });
const PORT = process.env.PORT || 3000;
const rootDir = path.dirname(require.main.filename);
const viewsPath = path.join(rootDir, 'views');
const publicPath = path.join(rootDir, 'public');
const csrfProtection = csrf();
const authRouter = require('./routers/authRouter');
const taskRouter = require('./routers/taskRouter');


app.use(express.static(publicPath));
app.set('view engine', 'ejs');
app.set('views', viewsPath);
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: store
    })
  );
app.use(flash());
app.use(upload.single('image'))
app.use(csrfProtection);
app.use(async (req, res, next) => {
    if (!req.session.user) {
      return next();
    };
    try {
        const user = await User.findById(req.session.user._id);
        req.user = user;
        next()
    } catch (e) {
        next(e)
    };
  });

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn || false;
    res.locals.csrfToken = req.csrfToken();
    res.locals.user = req.user;
    next()
})

app.use('/', authRouter);
app.use('/task', taskRouter);

app.use(getErrorPage);

mongoose.connect(process.env.MONGO_DB, { useFindAndModify: false ,useUnifiedTopology: true, useNewUrlParser: true });

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
})