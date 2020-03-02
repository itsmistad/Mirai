'use strict';
const View = require('../views/shared/view');

class HomeController {
    constructor() {
        this.name = 'Home';
    }

    run(route, req, res) {
        var v = new View(res, 'home');
        v.render({
            title: 'Home'
        });
    }
}

module.exports = HomeController;