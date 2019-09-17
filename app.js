// Dependencies - External packages
const	express = require('express'),
		app = express(),
		bodyParser = require('body-parser'),
		mongoose = require('mongoose'),
		passport = require('passport'),
		LocalStrategy = require('passport-local'),
		passportLocalMongoose = require('passport-local-mongoose'),
		expressSession = require('express-session');

// Dependencies - Internal
const	User = require('./models/user');

mongoose.connect("mongodb://localhost:27017/auth_demo", { 
	useNewUrlParser: true,
	useUnifiedTopology: true
 });

// Letting Express know that we're serving up ejs templates by default.
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded( {extended: true} ));

// Configure express-session
app.use(expressSession({
	secret: 'We suffer more in imagination than in reality',
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser()); // Encode data, serialize it, write to session
passport.deserializeUser(User.deserializeUser()); // Read session, get data (unserialize it), unencode it

// Routes
//===========
app.get('/', (req, res) => {
	console.log("Session:", req.session);
	console.log("Session ID:", req.sessionID);
	res.render('home');
})

app.get('/secret', isLoggedIn, (req, res) => {
	console.log("Session:", req.session);
	console.log("Session ID:", req.sessionID);
	res.render('secret');
})

// register
app.get('/register', (req, res) => {
	console.log("Session:", req.session);
	console.log("Session ID:", req.sessionID);
	res.render('register');
})

app.post('/register', (req, res) => {
	// User.register is provided by the passport-local-mongoose module. It performs the function of creating a new user, hashing and salting the password, and saving this to db.
	User.register(new User({username: req.body.username}), req.body.password, (err, user) => {
		if(err) {
			console.log(err);
			return res.render('/register');
		} else {
			passport.authenticate('local')(req, res, () => {
				res.redirect('/secret');
			})
		}
	})
})

// login routes
app.get('/login', (req, res) => {
	console.log("Session:", req.session);
	console.log("Session ID:", req.sessionID);
	res.render('login');
})

app.post('/login', passport.authenticate('local', {
	successRedirect: '/secret',
	failureRedirect: '/login'
}) , (req, res) => {
});

// logout route
app.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/');
})

function isLoggedIn(req, res, next) {
	if(req.isAuthenticated()){
		return next();
	} 
	res.redirect('/login');
}


let port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log("Auth Demo Server started on port: " + port, '-', new Date().toLocaleString());
})
