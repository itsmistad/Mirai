'use strict';
const configKeys = require('../../services/config/configKeys');

module.exports = new function() {
    this.desc = `Inserts the following into the "config" collection:
- ${JSON.stringify(configKeys.email.address)}
- ${JSON.stringify(configKeys.email.name)}
- ${JSON.stringify(configKeys.mailgun.api_key)}
- ${JSON.stringify(configKeys.mailgun.domain)}`;

    this.up = async function(m) {
        await m.save('config', {
            key: configKeys.email.address.key,
            value: configKeys.email.address.defaultValue
        });
        await m.save('config', {
            key: configKeys.email.name.key,
            value: configKeys.email.name.defaultValue
        });
        await m.save('config', {
            key: configKeys.mailgun.api_key.key,
            value: configKeys.mailgun.api_key.defaultValue
        });
        await m.save('config', {
            key: configKeys.mailgun.domain.key,
            value: configKeys.mailgun.domain.defaultValue
        });
    };

    this.down = async function(m) {
        await m.delete('config', {
            key: configKeys.email.address.key
        });
        await m.delete('config', {
            key: configKeys.email.name.key
        });
        await m.delete('config', {
            key: configKeys.mailgun.api_key.key
        });
        await m.delete('config', {
            key: configKeys.mailgun.domain.key
        });
    };
};