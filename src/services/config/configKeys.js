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
    },
    email: {
        address: new ConfigKey('Email.Address', 'mirai@mistad.net'), // The email address the EmailService will use as the "from"; any string value that works as a validated email address
        name: new ConfigKey('Email.Name', 'Mirai') // The name the EmailService will use as the "from" name; any string value
    },
    mailgun: {
        api_key: new ConfigKey('Mailgun.ApiKey', ''), // Mirai's API key for Mailgun; any string value
        domain: new ConfigKey('Mailgun.Domain', '') // Mirai's domain for Mailgun; any string value
    },
    notifications: {
        email: new ConfigKey('Notifications.Email', 'mailto:mirai@mistad.net'), // Mirai's email to use for VAPID key; any string value
        public_key: new ConfigKey('Notifications.PublicKey', ''), // Mirai's private VAPID key for sending notifications; any string value
        private_key: new ConfigKey('Notifications.PrivateKey', '') // Mirai's private VAPID key for sending notifications; any string value
    },
    theme: {
        slogan: new ConfigKey('Theme.Slogan', 'Plan it your way.'), // The html for the "slogan" partial; any string value
        enableMobile: new ConfigKey('Theme.EnableMobile', false) // Toggles devices that fit our "for-small-tablet-down" sizes; true/false
    }
});

module.exports = configKeys;