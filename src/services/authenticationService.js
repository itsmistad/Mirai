'use strict';

const passport = require('passport');  
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const configKeys = require('./config/configKeys');
const passportSocketIO = require('passport.socketio');
const sessionstore = require('sessionstore');

let log, config, mongo, socket;

class AuthenticationService {
    constructor(root) {
        log = root.log;
        config = root.config;
        mongo = root.mongo;
        socket = root.socket;
    }

    async start(app) {
        const session_secret = await config.get(configKeys.authentication.session_secret);
        log.debug(`Session secret retrieved from configuration: ${session_secret}`);
        const passport_google_clientid = await config.get(configKeys.authentication.passport_google_clientid);
        log.debug(`Passport Google Client ID retrieved from configuration: ${passport_google_clientid}`);
        const passport_google_clientsecret = await config.get(configKeys.authentication.passport_google_clientsecret);
        log.debug(`Passport Google Client Secret retrieved from configuration: ${passport_google_clientsecret}`);
        const passport_google_redirect = await config.get(configKeys.authentication.passport_google_redirect);
        log.debug(`Passport Google Client Secret retrieved from configuration: ${passport_google_redirect}`);
        //if (env.isProd)
        //    app.set('trust proxy', 1); // Trust the AWS proxy the request is coming from.
        let mongoConfig = config['database']['mongo'];
        let sessionStore = sessionstore.createSessionStore({
            type: 'mongodb',
            host: mongoConfig.host,
            port: mongoConfig.port,
            dbName: 'mirai',
            collectionName: 'sessions',
            timeout: 10000,
            username: mongoConfig.user,
            password: mongoConfig.pass
        });
        app.use(session({
            key: 'express.sid',
            secret: session_secret,
            resave: false,
            saveUninitialized: true,
            store: sessionStore,
            cookie: {
                //secure: env.isProd,
                maxAge: 86400000 * 3 // 3 days
            }
        }));
        socket._io.use(passportSocketIO.authorize({
            cookieParser: require('cookie-parser'),
            key: 'express.sid', 
            secret: session_secret,
            store: sessionStore
        }));
        // set up passport
        app.use(passport.initialize());  
        app.use(passport.session()); 
        passport.serializeUser((user, done) => {  
            done(null, user);
        });
        passport.deserializeUser((user, done) => {  
            done(null, user);
        });
        passport.use(new GoogleStrategy(  
            {
                clientID: passport_google_clientid,
                clientSecret: passport_google_clientsecret,
                callbackURL: passport_google_redirect,
                scope: ['profile', 'email'],
            },
            (accessToken, refreshToken, profile, cb) => {
                return cb(null, profile);
            },
        ));
        this.passport = passport;
        log.info('Successfully started authentication service!');
    }

    async processCallback(req, res) {
        passport.authenticate('google', { failureRedirect: '/?badLogin=1', session: true }, async function (err, user) {
            if (err) {
                log.error(`Failed to authenticate user. Error: ${err}`);
                return;
            }
            let mongoFind = {googleId: user.id};
            let retrievedUser = await mongo.find('users', mongoFind);
            let userObj;
            if (retrievedUser == null) { 
                userObj = {
                    firstName: user.name.givenName,
                    lastName: user.name.familyName,
                    fullName: user.displayName,
                    picture: user._json.picture,
                    email: user._json.email,
                    googleId: user.id
                };
                mongo.save('users', userObj);
            }
            userObj = {
                googleId: user.id
            };
            retrievedUser = userObj;
            req.login(retrievedUser, (err) => {
                if (err) {
                    log.error(`Failed to login user. Error: ${err}`);
                    res.redirect('/?badLogin=2');
                    return;
                }
                log.debug(`User logged in successfully: ${JSON.stringify(req.user)}`);
                // From this point on, we can (on the server) use "req.isAuthenticated()" to check if the user is logged in and "req.user.googleId" to grab the user's googleId.
                // We can also (within a view or client-side js file) use "user.*" to grab the user's data as defined above.
                res.redirect(req.session.redirect && !req.session.redirect.includes('/auth/google/callback') ? req.session.redirect : 'back'); // Redirect back to the previous page.
            });
        })(req, res);
    }
}

module.exports = AuthenticationService;