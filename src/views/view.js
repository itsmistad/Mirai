'use strict';

class View {
    constructor(response, template) {
        this.response = response;
        this.template = template;
    }

    render(locals, partials) {
        if(this.response && this.template && locals) {
            for (const local in locals) {
                this.response.locals[local] = locals[local];
            }
            if (partials)
                this.response.render(this.template, partials);
            else 
                this.response.render(this.template);
        }
    }
}

module.exports = View;