require('dotenv').config(); // Absolute line 1

const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const flash = require('connect-flash');

const db = require('./config/mongoose-connection');

const ownersRouter = require('./routes/ownersRouter');
const usersRouter = require('./routes/usersRouter');
const productsRouter = require('./routes/productsRouter');
const cartRouter = require('./routes/cartRouter');
const { isLoggedIn } = require('./middleware/IsLoggedIn');
const { redirectIfAuthenticated } = require('./middleware/redirectIfAuthenticated');
const { getAccountPage, uploadProfilePic } = require('./controllers/userController');
const upload = require('./config/multer');

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(expressSession({
    resave: false,
    saveUninitialized: false, 
    secret: process.env.EXPRESS_SESSION_SECRET
}));

app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.registerError = req.flash('registerError');
    res.locals.loginError = req.flash('loginError');
    res.locals.currentPath = req.path;
    next(); 
});

app.use('/owners', ownersRouter);
app.use('/users', usersRouter);
app.use('/products', productsRouter);
app.use('/cart', cartRouter);



app.get('/', redirectIfAuthenticated, function(req, res) {
    res.render("index");
});

app.get('/account', isLoggedIn, getAccountPage);
app.post('/account/upload', isLoggedIn, upload.single('profilepic'), uploadProfilePic);



app.get('/logout', function(req, res){
    res.clearCookie('token'); 
    res.redirect('/');
});

app.use(function(req, res) {
    res.status(404).render('404');
});

app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send("Something went wrong on our end. Please try again later.");
});

app.listen(3000, () => {
    console.log("Server running smoothly on port 3000");
});