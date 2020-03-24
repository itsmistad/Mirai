'use strict';

const configKeys = require('../../services/config/configKeys');

let config, env;

class View {
    constructor(root, response, template) {
        config = root.config;
        env = root.env;
        this.response = response;
        this.template = template;
    }

    async render(locals, user) {
        if(this.response && this.template && locals) {
            const globals = {
                themeEnableMobile: await config.get(configKeys.theme.enableMobile),
                userObj: JSON.stringify(user || {}),
                isProd: env.isProd
            };
            for (const global in globals) {
                this.response.locals[global] = globals[global];
            }

            for (const local in locals) {
                this.response.locals[local] = locals[local];
            }
            await this.response.render(this.template);
        }
    }
}

module.exports = View;