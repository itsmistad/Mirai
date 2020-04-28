'use strict';

let mongo, log;

class ProfileLoadHandler {
    constructor(root) {
        this.event = 'profileLoad';
        mongo = root.mongo;
        log = root.log;
        log.debug('Loading');
    }

    async handle(io, otherUsers, currentUser, data) {
        if (!data.googleId) {
            console.log('failed');
            return;
        }

        let userObj = await mongo.find('users', {
            googleId: data.googleId
        });

        log.debug('Loading profile for user: ' + currentUser.googleId);

        // Load the user's personal dashboard.
        let dash = await mongo.get('dashboards', userObj.dashboardId || 0);
        let cards = [];
        if (dash)
            for (let card of dash.cards) {
                cards.push({
                    id: card.id,
                    name: card.name,
                    date: card.date,
                    time: card.time
                });
            }
        let friends = [];
        let userObjFriends = (await mongo.find('friends', {
            userId: data.googleId
        })).friendIds;
        for (let friendId of userObjFriends) {
            let friendUserObj = await mongo.find('users', {
                googleId: friendId
            });
            friends.push({
                googleId: friendUserObj.googleId,
                picture: friendUserObj.picture,
                fullName: friendUserObj.fullName,
                displayName: friendUserObj.displayName
            });
        }
        currentUser.client.emit('profileLoadComplete', {
            cards: cards,
            friends: friends
        });  
    }
}

module.exports = ProfileLoadHandler;