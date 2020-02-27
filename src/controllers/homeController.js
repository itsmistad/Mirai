'use strict';
const BaseController = require('./baseController');
const View = require('../views/view');

class HomeController extends BaseController {
    constructor() {
        super();
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