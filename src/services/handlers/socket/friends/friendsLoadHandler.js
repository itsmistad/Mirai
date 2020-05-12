'use strict';

let mongo;

class FriendsLoadHandler {
    constructor(root) {
        this.event = 'friendsLoad';
        mongo = root.mongo;
    }

    async handle(io, otherUsers, currentUser) {
        if (!currentUser.googleId)
            return;
            
        let currentUsersFriends = (await mongo.find('friends', {
            userId: currentUser.googleId
        })).friendIds;
        let friends = [];
        for (let friendId of currentUsersFriends) {
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
        currentUser.client.emit('friendsLoadComplete', friends);
    }
}

module.exports = FriendsLoadHandler;