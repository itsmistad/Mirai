'use strict';

let mongo;

class FriendRemoveHandler {
    constructor(root) {
        this.event = 'friendRemove';
        mongo = root.mongo;
    }

    async handle(io, otherUsers, currentUser, data) {
        if (!currentUser.googleId || !data || !data.userId)
            return;
        let currentUsersFriends = (await mongo.find('friends', {
            userId: currentUser.googleId
        })).friendIds;
        let targetUsersFriends = (await mongo.find('friends', {
            userId: data.userId
        })).friendIds;

        currentUsersFriends.splice(currentUsersFriends.findIndex(_ => _  === data.userId), 1);
        targetUsersFriends.splice(targetUsersFriends.findIndex(_ => _  === currentUser.googleId), 1);

        mongo.update('friends', {
            userId: currentUser.googleId
        }, {
            $set: {
                friendIds: currentUsersFriends
            }
        });
        mongo.update('friends', {
            userId: data.userId
        }, {
            $set: {
                friendIds: targetUsersFriends
            }
        });
    }
}

module.exports = FriendRemoveHandler;