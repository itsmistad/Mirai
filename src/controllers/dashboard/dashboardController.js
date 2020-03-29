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
            req.session.redirect = req.originalUrl;
            res.redirect('/auth/google/callback');
            return;
        }
        const v = new View(root, res, 'dashboard/dashboard');
        await  v.render({
            title: 'Dashboard'
        }, req.user);
    }
}

module.exports = DashboardController;