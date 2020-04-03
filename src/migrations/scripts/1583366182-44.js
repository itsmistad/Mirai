'use strict';
const configKeys = require('../../services/config/configKeys');

module.exports = new function() {
    this.desc = `Inserts the following into the "config" collection:
- ${JSON.stringify(configKeys.notifications.email)}
- ${JSON.stringify(configKeys.notifications.public_key)}
- ${JSON.stringify(configKeys.notifications.private_key)}`;

    this.up = async function(m) {
        await m.save('config', {
            key: configKeys.notifications.email.key,
            value: configKeys.notifications.email.defaultValue
        });
        await m.save('config', {
            key: configKeys.notifications.public_key.key,
            value: configKeys.notifications.public_key.defaultValue
        });
        await m.save('config', {
            key: configKeys.notifications.private_key.key,
            value: configKeys.notifications.private_key.defaultValue
        });
    };

    this.down = async function(m) {
        await m.delete('config', {
            key: configKeys.notifications.email.key
        });
        await m.delete('config', {
            key: configKeys.notifications.public_key.key
        });
        await m.delete('config', {
            key: configKeys.notifications.private_key.key
        });
    };
};