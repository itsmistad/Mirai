'use strict';

let auth;

class AuthenticationController {
    constructor(root) {
        this.name = 'Authentication';
        auth = root.auth;
    }

    async run(route, req, res) {
        switch (route) {
        case 'callback':
            auth.processCallback(req, res);
            break;
        case 'logout':
            req.session.destroy();
            res.redirect('/');
            break;
        }
    }
}

module.exports = AuthenticationController;