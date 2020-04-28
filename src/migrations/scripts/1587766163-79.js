'use strict';
const configKeys = require('../../services/config/configKeys');

module.exports = new function() {
    this.desc = `Inserts the following into the "config" collection:
- ${JSON.stringify(configKeys.remind.time_interval)}`;

    this.up = async function(m) {
        await m.save('config', {
            key: configKeys.remind.time_interval.key,
            value: configKeys.remind.time_interval.defaultValue
        });
    };

    this.down = async function(m) {
        await m.delete('config', {
            key: configKeys.remind.time_interval.key
        });
    };
};