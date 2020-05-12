'use strict';

let mongo;

class FriendRequestDeclineHandler {
    constructor(root) {
        this.event = 'friendRequestDecline';
        mongo = root.mongo;
    }

    async handle(io, otherUsers, currentUser, data) {
        if (!currentUser.googleId || !data || !data.senderId)
            return;
        mongo.delete('friend_requests', {
            senderId: data.senderId,
            recipientId: currentUser.googleId
        });
    }
}

module.exports = FriendRequestDeclineHandler;