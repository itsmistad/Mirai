'use strict';

const configKeys = require('../../services/config/configKeys');

let config, env, mongo;

class View {
    constructor(root, response, template) {
        config = root.config;
        mongo = root.mongo;
        env = root.env;
        this.response = response;
        this.template = template;
    }

    async render(locals, user) {
        if(this.response && this.template && locals) {
            let globals = {
                themeEnableMobile: await config.get(configKeys.theme.enableMobile),
                isProd: env.isProd,
                userObj: JSON.stringify('{}')
            };

            if (user)
                mongo.find('users', {
                    googleId: user.googleId
                }).then(async data => {
                    globals.userObj = JSON.stringify(data);
                    for (const global in globals) {
                        this.response.locals[global] = globals[global];
                    }
        
                    for (const local in locals) {
                        this.response.locals[local] = locals[local];
                    }
                    await this.response.render(this.template);
                });
            else {
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
}

module.exports = View;