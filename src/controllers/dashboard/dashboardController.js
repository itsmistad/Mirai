'use strict';

const View = require('../../views/shared/view');
let root;

class DashboardController {
    constructor(_root) {
        this.name = 'Dashboard';
        root = _root;
    }

    async run(route, req, res) {
        if (!req.user) { // Prevent the page from loading if the user is not logged in.
            if (req.query['login']) {
                res.redirect('/auth/google/callback');
            } else
                res.redirect('/');
        } else {
            if (req.query['login']) {
                res.redirect('/dashboard');
                return;
            }
            const v = new View(root, res, 'dashboard/dashboard');
            await  v.render({
                title: 'Dashboard'
            }, req.user);
        }
    }
}

module.exports = DashboardController;