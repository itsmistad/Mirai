'use strict';

const View = require('../views/shared/view');
const configKeys = require('../services/config/configKeys');
let config;

class HomeController {
    constructor(root) {
        this.name = 'Home';
        config = root.config;
    }

    async run(route, req, res) {
        var v = new View(res, 'home');
        v.render({
            title: 'Home',
            slogan: await config.get(configKeys.theme.slogan)
        });
    }
}

module.exports = HomeController;