'use strict';

let mongo;

class FriendRequestsLoadHandler {
    constructor(root) {
        this.event = 'friendRequestsLoad';
        mongo = root.mongo;
    }

    async handle(io, otherUsers, currentUser) {
        if (!currentUser.googleId)
            return;

        let requests = await mongo.findMany('friend_requests', {
            recipientId: currentUser.googleId
        });
        if (requests.length) {
            let responseArray = [];
            for (let request of requests) {
                let senderUserObj = await mongo.find('users', {
                    googleId: request.senderId
                });
                responseArray.push({
                    id: senderUserObj.googleId,
                    fullName: senderUserObj.fullName,
                    displayName: senderUserObj.displayName
                });
            }
            currentUser.client.emit('friendRequestsLoadComplete', responseArray);
        }
    }
}

module.exports = FriendRequestsLoadHandler;