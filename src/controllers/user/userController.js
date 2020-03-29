'use strict';

const View = require('../../views/shared/view');
let root, mongo;

class UserController {
    constructor(_root) {
        this.name = 'User';
        root = _root;
        mongo = root.mongo;
    }

    async run(route, req, res) {
        let v, user;

        switch (route) {
        case 'profile':
            user =  await mongo.find('users', {
                googleId: req.query['googleId']
            });
            if (!user) {
                res.redirect('/');
                return;
            }
            v = new View(root, res, 'user/profile');
            await  v.render({
                title: `${user.fullName}`
            }, req.user);
            break;
        case 'preferences':
            if (req.route.path.includes('/upload/')) {
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
                        notifySound: req.body.notifySound
                    }
                });
                res.send({
                    response: 'ok'
                });
            } else {
                if (!req.user) { // Prevent the page from loading if the user is not logged in.
                    res.redirect('/');
                    return;
                }
                v = new View(root, res, 'user/preferences');
                await v.render({
                    title: 'Preferences'
                }, req.user);
            }
            break;
        }
    }
}

module.exports = UserController;