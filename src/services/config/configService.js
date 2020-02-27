'use strict';

/*
 * Assuming "this.root" and "configKeys" is referenceable...
 *  - JSON configuration values can be accessed through "this.root.config['insert key here']".
 *  - Database configuration values can be accessed through "this.root.config.get(configKeys.<group>.<entry>)".
 * This service does not currently support on-the-fly changes.
 */

class ConfigService {
    constructor(root) {
        this.root = root;
    }

    load() {
        const map = require('../../../config/config');
        for (const key in map) {
            this[key] = map[key];
        }
        
        const pkg = require('../../../package');
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

    async get(entry) {
        try {
            const result = await this.root.mongo.find('config', {
                key: entry.key
            }); 
            return result.value;
        } catch (ex) {}

        return entry.defaultValue;
    }
}

module.exports = ConfigService;