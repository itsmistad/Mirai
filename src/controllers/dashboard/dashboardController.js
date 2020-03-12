'use strict';

const View = require('../../views/shared/view');

class DashboardController {
    constructor() {
        this.name = 'Dashboard';
    }

    async run(route, req, res) {
        const v = new View(res, 'dashboard/dashboard');
        v.render({
            title: 'Dashboard'
        });
    }
}

module.exports = DashboardController;