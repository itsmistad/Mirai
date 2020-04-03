'use strict';

const View = require('../views/shared/view');
const configKeys = require('../services/config/configKeys');
let config, root;

class HomeController {
    constructor(_root) {
        this.name = 'Home';
        config = _root.config;
        root = _root;
    }

    async run(route, req, res) {
        const v = new View(root, res, 'home');
        const slogan = await config.get(configKeys.theme.slogan);
        await v.render({
            title: 'Home',
            slogan,
            badLogin: req.query['badLogin'] || 0
        }, req.user);
    }
}

module.exports = HomeController;