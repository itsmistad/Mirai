'use strict';

const configKeys = require('../../services/config/configKeys');

class View {
    constructor(config, response, template) {
        this.config = config;
        this.response = response;
        this.template = template;
    }

    async render(locals, partials) {
        if(this.response && this.template && locals) {
            const globals = {
                themeEnableMobile: await this.config.get(configKeys.theme.enableMobile)
            };
            for (const global in globals) {
                this.response.locals[global] = globals[global];
            }

            for (const local in locals) {
                this.response.locals[local] = locals[local];
            }
            if (partials)
                await this.response.render(this.template, partials);
            else 
                await this.response.render(this.template);
        }
    }
}

module.exports = View;