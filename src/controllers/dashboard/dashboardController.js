'use strict';

const View = require('../../views/shared/view');
let config;

class DashboardController {
    constructor(root) {
        this.name = 'Dashboard';
        config = root.config;
    }

    async run(route, req, res) {
        const v = new View(config, res, 'dashboard/dashboard');
        await  v.render({
            title: 'Dashboard'
        });
    }
}

module.exports = DashboardController;