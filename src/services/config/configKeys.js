'use strict';

/*
 * This object maintains all of the config keys that exist in the database.
 * The following is an example definition of a config key "Feature" with default value 0 for feature group "FeatureGroup":
 * 
 *     featureGroup: {
 *         feature: new ConfigKey('FeatureGroup.Feature', 0) // <description>; <acceptable values if not true/false>
 *     }
 * 
 * The following is a usage example for this config key where the value is 1 in the database (assuming this.root is referenceable):
 * 
 *     const configKeys = require('./config/configKeys');
 *     const val = this.root.config.get(configKeys.featureGroup.feature);
 * 
 * "val" will equal 1 if the config key is properly set in the database and the database is reachable.
 * "val" will equal 0 if something goes wrong and the default value is used instead.
 */

class ConfigKey {
    constructor(key, defaultValue) {
        this.key = key;
        this.defaultValue = defaultValue;
    }
}

const configKeys = Object.freeze({
    logging: {
        level: new ConfigKey('Logging.Level', 2) // Controls what level of logs are stored to the database; 3 = All, 2 = No debugs, 1 = Only errors, 0 = None
    },
    web: {
        port: new ConfigKey('Web.Port', 3000) // Defines the port that the Express.js web service listens to; Any integer
    }
});

module.exports = configKeys;