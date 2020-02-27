'use strict';
const View = require('../views/view');

class HomeController {
    constructor() {
        this.name = 'Home';
    }

    run(req, res) {
        var v = new View(res, 'home');
        v.render({
            title: 'Home'
        });
    }
}

module.exports = HomeController;