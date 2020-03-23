'use strict';

const passport = require('passport');  
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const configKeys = require('./config/configKeys');

let log, config, mongo;

class AuthenticationService {
    constructor(root) {
        log = root.log;
        config = root.config;
        mongo = root.mongo;
    }

    async start(app) {
        log.debug('Starting authentication service...');
        const session_secret = await config.get(configKeys.authentication.session_secret);
        log.debug(`Session secret retrieved from configuration: ${session_secret}`);
        // set up express-session
        app.use(session({  
            secret: session_secret,
            resave: false,
            saveUninitialized: false,
        }));
        // set up passport
        app.use(passport.initialize());  
        app.use(passport.session()); 
        passport.serializeUser((user, done) => {  
            done(null, user);
        });
        passport.deserializeUser((userDataFromCookie, done) => {  
            done(null, userDataFromCookie);
        });
        const passport_google_clientid = await config.get(configKeys.authentication.passport_google_clientid);
        log.debug(`Passport Google Client ID retrieved from configuration: ${passport_google_clientid}`);
        const passport_google_clientsecret = await config.get(configKeys.authentication.passport_google_clientsecret);
        log.debug(`Passport Google Client Secret retrieved from configuration: ${passport_google_clientsecret}`);
        const passport_google_redirect = await config.get(configKeys.authentication.passport_google_redirect);
        log.debug(`Passport Google Client Secret retrieved from configuration: ${passport_google_redirect}`);
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
        app.get('/auth/google/callback',  
            passport.authenticate('google', { failureRedirect: '/', session: true }),
            async (req, res) => {
                let mongoFind = {id: req.user.id};
                let retrieveUser = await mongo.find('users', mongoFind);
                if (retrieveUser == null) { 
                    const user = {
                        firstName: req.user.name.givenName,
                        lastName: req.user.name.familyName,
                        fullName: req.user.displayName,
                        picture: req.user._json.picture,
                        email: req.user._json.email,
                        googleId: req.user.id
                    };

                    mongo.save('users', user);
                    log.debug(`Stored user data: ${JSON.stringify(user)}`);
                }
                log.info(`Authentication successful for user ${req.user._json.email}`);
                res.redirect('/');
            }
        );
        app.get('/logout', (req, res) => {
            req.session.destroy();
            res.redirect('/');
        });
        return app;
    }
}

module.exports = AuthenticationService;