'use strict';

const View = require('../../views/shared/view');
const fs = require('fs');
let root, mongo, env;

class UserController {
    constructor(_root) {
        this.name = 'User';
        root = _root;
        mongo = root.mongo;
        env = root.env;
    }

    async run(route, req, res) {
        let v, paramUser, filePath;

        switch (route) {
        case '/user/profile':
            paramUser =  await mongo.find('users', {
                googleId: req.query['googleId']
            });
            if (!paramUser) {
                res.redirect('/');
                return;
            }
            v = new View(root, res, 'user/profile');
            await v.render({
                title: `${paramUser.fullName}`,
                paramUserObj: JSON.stringify(paramUser)
            }, req.user);
            break;
        case '/user/preferences':
            if (!req.user) { // Prevent the page from loading if the user is not logged in.
                res.redirect('/');
                return;
            }
            v = new View(root, res, 'user/preferences');
            await v.render({
                title: 'Preferences'
            }, req.user);
            break;
        case '/user/upload/about':
            paramUser =  await mongo.find('users', {
                googleId: req.query['googleId']
            });
            if (!req.isAuthenticated() || !paramUser || req.user.googleId !== paramUser.googleId) { // Don't do anything if the user is not logged in, the target used cannot be found, or the logged in user is not the owning/target user.
                res.send({
                    response: 'err'
                });
                return;
            }
            mongo.update('users', {
                googleId: paramUser.googleId
            }, {
                $set: {
                    email: req.body.email,
                    job: req.body.job,
                    employer: req.body.employer,
                    location: req.body.location,
                    displayName: req.body.displayName
                }
            });
            res.send({
                response: 'ok'
            });
            break;
        case '/user/upload/preferences':
            if (!req.isAuthenticated()) { // Don't do anything if the user is not logged in
                res.send({
                    response: 'err'
                });
                return;
            }
            mongo.update('users', {
                googleId: req.user.googleId
            }, {
                $set: {
                    priorityStyle: req.body.priorityStyle,
                    nightMode: req.body.nightMode,
                    notifySound: req.body.notifySound,
                    backgroundTileName: req.body.backgroundTileName
                }
            });
            res.send({
                response: 'ok'
            });
            break;
        case '/user/upload/preferences/bg':
            if (!req.isAuthenticated()) { // Don't do anything if the user is not logged in
                res.send({
                    response: 'err'
                });
                return;
            }
            filePath = `/files/uploads/${req.file ? req.file.filename : ''}`;
            res.send({
                filePath
            });
            if (env.isProd) {
                // Delete original file from S3.
                
                // Store the new file path into user's mongo object.
            } else {
                // Delete original file from local storage.
                if (req.user.backgroundTile && req.user.backgroundTile.startsWith('/files/uploads/') && fs.existsSync(req.user.backgroundTile)) {
                    fs.unlink(req.user.backgroundTile);
                }

                // Store the new file path into user's mongo object.
                mongo.update('users', {
                    googleId: req.user.googleId
                }, {
                    $set: {
                        backgroundTile: req.file ? filePath : null
                    }
                });
            }
            break;
        case '/user/upload/picture':
        case '/user/upload/banner':
            // Example of "req.file":
            // {
            //     fieldname: 'file',
            //     originalname: 'alienboy-art.jpg',
            //     encoding: '7bit',
            //     mimetype: 'image/jpeg',
            //     destination: 'uploads/',
            //     filename: '99f4116bd15845ac29d0c73691967bbc',
            //     path: 'uploads\\99f4116bd15845ac29d0c73691967bbc',
            //     size: 213145
            // }
            paramUser =  await mongo.find('users', {
                googleId: req.query['googleId']
            });
            if (!req.isAuthenticated() || !paramUser || req.user.googleId !== paramUser.googleId) { // Don't do anything if the user is not logged in, the target used cannot be found, or the logged in user is not the owning/target user.
                res.send({
                    response: 'err'
                });
                return;
            }
            filePath = `/files/uploads/${req.file.filename}`;
            res.send({
                filePath
            });
            if (env.isProd) {
                // Delete original file from S3.
                
                // Store the new file path into paramUser's mongo object.
            } else {
                // Delete original file from local storage.
                if (paramUser.picture.startsWith('/files/uploads/') && fs.existsSync(paramUser.picture)) {
                    fs.unlink(paramUser.picture);
                }

                // Store the new file path into paramUser's mongo object.
                if (route === '/user/upload/picture') {
                    mongo.update('users', {
                        googleId: paramUser.googleId
                    }, {
                        $set: {
                            picture: filePath
                        }
                    });
                } else if (route === '/user/upload/banner') {
                    mongo.update('users', {
                        googleId: paramUser.googleId
                    }, {
                        $set: {
                            banner: filePath
                        }
                    });
                }
            }
            break;
        }
    }
}

module.exports = UserController;