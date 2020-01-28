'use strict';

/*
 * Configuration values can be accessed through "this.root.config['insert key here']"
 * This service does not currently support on-the-fly changes.
 */

class ConfigService {
    constructor(root) {
        this.root = root;
        this.load();
    }

    load() {
        this.map = require('../../config/config');
        for (let key in this.map) {
            this[key] = this.map[key];
        }
    }
}

module.exports = ConfigService;