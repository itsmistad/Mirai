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
        const v = new View(res, 'home');
        const slogan = await config.get(configKeys.theme.slogan);
        v.render({
            title: 'Home',
            slogan
        });
    }
}

module.exports = HomeController;