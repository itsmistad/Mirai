'use strict';

/*
 * Configuration values can be accessed through "this.root.config['insert key here']"
 * This service does not currently support on-the-fly changes.
 */

class ConfigService {
    constructor() {
    }

    load() {
        const map = require('../../config/config');
        for (const key in map) {
            this[key] = map[key];
        }
        
        const pkg = require('../../package');
        if (this['application'] != null) {
            this['application']['version'] = pkg['version'];
        } else {
            this['application'] = {
                environment: 'local',
                travis_build: 0,
                version: pkg['version']
            };
        }
    }
}

module.exports = ConfigService;