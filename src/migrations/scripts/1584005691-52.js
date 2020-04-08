'use strict';
const configKeys = require('../../services/config/configKeys');

module.exports = new function() {
    this.desc = `Inserts ${JSON.stringify(configKeys.theme.enableMobile)} into the "config" collection.`;

    this.up = async function(m) {
        await m.save('config', {
            key: configKeys.theme.enableMobile.key,
            value: configKeys.theme.enableMobile.defaultValue
        });
    };

    this.down = async function(m) {
        await m.delete('config', {
            key: configKeys.theme.enableMobile.key
        });
    };
};