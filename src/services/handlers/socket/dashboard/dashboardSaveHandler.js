'use strict';

let mongo;
const dataFormat = {
    folders: [],
    cards: []
};

class DashboardSaveHandler {
    constructor(root) {
        this.event = 'dashboardSave';
        mongo = root.mongo;
    }

    async handle(io, client, user, data) {
        if (!user.googleId) {
            client.emit('dashboardSaveFailed', {
                message: 'You must be logged in to save a dashboard.'
            });  
            return;
        }
        let result = [];
        Object.assign(result, dataFormat);
        for (let key in data) {
            if (dataFormat[key] == null) {
                client.emit('dashboardSaveFailed', {
                    message: `Failed to parse data. Unknown key "${key}".`
                });  
                return;
            }
            if (typeof dataFormat[key] !== typeof data[key]) {
                client.emit('dashboardSaveFailed', {
                    message: `Failed to parse data. Key "${key}" is not of the proper type.`
                });  
                return;
            }
            result[key] = data[key];
        }
        let userObj = await mongo.find('users', {
            googleId: user.googleId
        });
        mongo.update('dashboards', {
            _id: userObj.dashboardId
        }, {
            $set: {
                folders: result.folders,
                cards: result.cards
            }
        }).then(() => {
            client.emit('dashboardSaveComplete'); 
        });
    }
}

module.exports = DashboardSaveHandler;