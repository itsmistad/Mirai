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

    async handle(io, otherUsers, currentUser, data) {
        if (!currentUser.googleId) {
            currentUser.client.emit('dashboardSaveFailed', {
                message: 'You must be logged in to save a dashboard.'
            });  
            return;
        }
        let result = [];
        Object.assign(result, dataFormat);
        for (let key in data) {
            if (dataFormat[key] == null) {
                currentUser.client.emit('dashboardSaveFailed', {
                    message: `Failed to parse data. Unknown key "${key}".`
                });  
                return;
            }
            if (typeof dataFormat[key] !== typeof data[key]) {
                currentUser.client.emit('dashboardSaveFailed', {
                    message: `Failed to parse data. Key "${key}" is not of the proper type.`
                });  
                return;
            }
            result[key] = data[key];
        }
        let userObj = await mongo.find('users', {
            googleId: currentUser.googleId
        });
        mongo.update('dashboards', {
            _id: userObj.dashboardId
        }, {
            $set: {
                folders: result.folders,
                cards: result.cards
            }
        }).then(() => {
            currentUser.client.emit('dashboardSaveComplete'); 
        });
    }
}

module.exports = DashboardSaveHandler;