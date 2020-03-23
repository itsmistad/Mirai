'use strict';

const passport = require('passport');  
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const configKeys = require('./config/configKeys');

let log, config;

class AuthenticationService {
    constructor(root) {
        log = root.log;
        config = root.config;
    }

    async start(app) {
        log.debug('Starting authentication service...');
        const session_secret = await config.get(configKeys.authentication.session_secret);
        log.debug(`Session secret retrieved from configuration: ${session_secret}`);
        app.use(session({  
            secret: session_secret,
            resave: false,
            saveUninitialized: false,
        }));
        app.use(passport.initialize());  
        app.use(passport.session()); 
        passport.serializeUser((user, done) => {  
            done(null, user);
        });
        passport.deserializeUser((userDataFromCookie, done) => {  
            done(null, userDataFromCookie);
        });
        const accessProtectionMiddleware = (req, res, next) => {  
            if (req.isAuthenticated()) {
                next();
            } else {
                res.status(403).json({
                    message: 'must be logged in to continue',
                });
            }
        };
        const passport_google_clientid = await config.get(configKeys.authentication.passport_google_clientid);
        const passport_google_clientsecret = await config.get(configKeys.authentication.passport_google_clientsecret);
        const passport_google_redirect = await config.get(configKeys.authentication.passport_google_redirect);
        passport.use(new GoogleStrategy(  
            {
                clientID: passport_google_clientid,
                clientSecret: passport_google_clientsecret,
                callbackURL: passport_google_redirect,
                scope: ['email'],
            },
            // This is a "verify" function required by all Passport strategies
            (accessToken, refreshToken, profile, cb) => {
                console.log('Our user authenticated with Google, and Google sent us back this profile info identifying the authenticated user:', profile);
                return cb(null, profile);
            },
        ));
        app.get('/auth/google', passport.authenticate('google'));  
        app.get('/auth/google/callback',  
            passport.authenticate('google', { failureRedirect: '/', session: true }),
            (req, res) => {
                console.log('authentication successful, here is our user object:', req.user);
                res.redirect('/');
            }
        );
        
        
        app.get('/protected', accessProtectionMiddleware, (req, res) => {  
            res.json({
                message: 'You have accessed the protected endpoint!',
                yourUserInfo: req.user,
            });
        });
        return app;
    }
}

module.exports = AuthenticationService;