'use strict';

let mongo, log;

class ProfileLoadHandler {
    constructor(root) {
        this.event = 'profileLoad';
        mongo = root.mongo;
        log = root.log;
        log.debug('Loading');
    }

    // eslint-disable-next-line no-unused-vars
    async handle(io, client, user, data) {
        if (!data.googleId) {
            console.log('failed');
            return;
        }

        let userObj = await mongo.find('users', {
            googleId: data.googleId
        });

        log.debug('Loading profile for user: ' + user.googleId);

        if (!userObj.dashboardId) {
            client.emit('profileLoadComplete', {
                dashboard: {
                    cards: []
                }
            });  
        } else {
            // Load the user's personal dashboard.
            let dash = await mongo.get('dashboards', userObj.dashboardId);
            let cards = [];
            for (let card of dash.cards) {
                cards.push({
                    id: card.id,
                    name: card.name,
                    date: card.date,
                    time: card.time
                });
            }
            client.emit('profileLoadComplete', {
                cards: cards
            });  
        }
    }
}

module.exports = ProfileLoadHandler;