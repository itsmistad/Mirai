'use strict';

const path = require('path');
const express = require('express');
const configKeys = require('./config/configKeys');
const bodyParser = require('body-parser');
const multer = require('multer');
const multerS3 = require('multer-s3');
const fs = require('fs');
const crypto = require('crypto');
let upload;

let log, app, config, root, controllers = [], env, socket;
let notification, auth;
let routes = [
//  ['/route/to/page', '<page>Controller', 'GET' or 'POST']
    ['/', 'homeController', 'GET'],
    ['/dashboard', '/dashboard/dashboardController', 'GET'],
    ['/subscribe', '/notifications/notificationController', 'POST'],
    ['/auth/google/callback', '/authentication/authenticationController', 'GET'],
    ['/auth/logout', '/authentication/authenticationController', 'GET'],
    ['/user/profile', '/user/userController', 'GET'],
    ['/user/preferences', '/user/userController', 'GET'],
    ['/user/friends', '/user/userController', 'GET'],
    ['/user/upload/picture', '/user/userController', 'POST'],
    ['/user/upload/banner', '/user/userController', 'POST'],
    ['/user/upload/about', '/user/userController', 'POST'],
    ['/user/upload/preferences', '/user/userController', 'POST'],
    ['/user/upload/preferences/bg', '/user/userController', 'POST'],
    ['/policies/privacy', '/policies/policiesController', 'GET'],
    ['/policies/terms', '/policies/policiesController', 'GET'],
    ['/policies/cookies', '/policies/policiesController', 'GET']
];

function setStaticRoutes() {
    app.use('/js', express.static(path.join(__dirname, '..', 'dist/assets/js')));
    app.use('/css', express.static(path.join(__dirname, '..', 'dist/assets/css')));
    app.use('/files', express.static(path.join(__dirname, '..', 'dist/assets/files')));
    app.use('/files/uploads', express.static(path.join(__dirname, '..', 'uploads')));
    app.use('/lottie', express.static(path.join(__dirname, '..', 'assets/files/lottie')));
    app.use('/webfonts', express.static(path.join(__dirname, '..', 'assets/files/webfonts')));
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
    app.use(upload.single('file')); 
    app.use(upload.array('files')); 
}

function setRoutes() {
    app.set('views', path.join(__dirname, '..', 'dist/views'));
    app.set('view engine', 'hjs');
    app.set('layout', 'shared/layout');
    app.set('partials', {
        loading: 'shared/loading',
        header: 'shared/header',
        footer: 'shared/footer'
    });
    app.engine('hjs', require('hogan-express'));
    
    routes.forEach(entry => {
        const routePath = entry[0];
        const controllerName = entry[1];
        const requestType = entry[2];
        try {
            let controller = controllers.find(_ => _.constructor.name === controllerName);
            if (!controller) {
                const Controller = require(`../controllers/${controllerName}`);
                controller = new Controller(root);
                controllers.push(controller);
            }
            switch (requestType) {
            case 'POST':
                app.post(routePath, function(req, res, next) {
                    controller.run(routePath, req, res, next);
                });
                break;
            case 'GET':
                app.get(routePath, function(req, res, next) {
                    if (routePath !== '/auth/google/callback')
                        req.session.redirect = req.originalUrl;
                    controller.run(routePath, req, res, next);
                });
                break;
            }
        }
        catch (ex) {
            log.error(`Failed to bind route "${routePath}" to controller "${controllerName}"! Error: ${ex}`);
        }
    });
}

async function hookServices() {
    // Insert any networking services here (push notifications, socket.io, etc.).
    log.info('Setting up notification service...');
    await notification.start(app);
    log.info('Setting up socket.io service...');
    await socket.setup(app);
    log.info('Setting up authentication service...');
    await auth.start(app);
}

class WebService {
    constructor(_root) {
        log = _root.log;
        config = _root.config;
        root = _root;
        notification = _root.notification;
        auth = _root.auth;
        env = _root.env;
        socket = _root.socket;
    }

    async start() {
        log.info('Current directory: ' + __dirname);
        log.info('Current working directory: ' + process.cwd());

        const port = parseInt(process.env.PORT || await config.get(configKeys.web.port));
        log.debug(`Port retrieved from configuration: ${port}`);

        log.info('Starting web service...');

        if (!env.isProd) {
            let dir = path.join(__dirname, '..', 'uploads');
            if (!fs.existsSync(dir))
                fs.mkdirSync(dir);
            let storage = multer.diskStorage({
                destination: function (req, file, cb) {
                    cb(null, 'uploads/');
                },
                filename: function (req, file, cb) {
                    const extension = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);
                    let customFileName = crypto.randomBytes(10).toString('hex');
                    cb(null, `${customFileName}-${Date.now() + extension}`);
                }
            });
            
            upload = multer({ storage: storage });
        } else {
            upload = multer({
                storage: multerS3({
                    s3: root.s3._s3,
                    bucket: root.s3._bucketName,
                    acl: 'public-read',
                    metadata: function (req, file, cb) {
                        cb(null, {fieldName: file.fieldname});
                    },
                    key: function (req, file, cb) {
                        const extension = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);
                        let customFileName = crypto.randomBytes(10).toString('hex');
                        cb(null, `uploads/${customFileName}-${Date.now() + extension}`);
                    }
                })
            });
        }

        app = express();
        setStaticRoutes();
        await hookServices();
        setRoutes();
        socket.listen(port, () => {
            log.info(`Successfully started web service! Listening on port ${port}.`);
        });
    }
}

module.exports = WebService;