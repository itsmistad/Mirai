'use strict';

let mongo;

class FriendRequestAcceptHandler {
    constructor(root) {
        this.event = 'friendRequestAccept';
        mongo = root.mongo;
    }

    async handle(io, otherUsers, currentUser, data) {
        if (!currentUser.googleId || !data || !data.senderId)
            return;
        mongo.delete('friend_requests', {
            senderId: data.senderId,
            recipientId: currentUser.googleId
        });
        mongo.update('friends', {
            userId: currentUser.googleId
        }, {
            $set: {
                userId: currentUser.googleId
            },
            $push: {
                friendIds: data.senderId
            }
        }, true);
        mongo.update('friends', {
            userId: data.senderId
        }, {
            $set: {
                userId: data.senderId
            },
            $push: {
                friendIds: currentUser.googleId
            }
        }, true);

        let senderUser = otherUsers.find(_ => _.googleId === data.senderId);
        if (senderUser) {
            let currentUserObj = await mongo.find('users', {
                googleId: currentUser.googleId
            });
            senderUser.client.emit('friendRequestAccepted', {
                fullName: currentUserObj.fullName
            });
            senderUser.client.emit('friendAdded', {
                googleId: currentUserObj.googleId,
                picture: currentUserObj.picture,
                fullName: currentUserObj.fullName,
                displayName: currentUserObj.displayName
            });
        }

        let senderUserObj = await mongo.find('users', {
            googleId: data.senderId
        });
        currentUser.client.emit('friendAdded', {
            googleId: senderUserObj.googleId,
            picture: senderUserObj.picture,
            fullName: senderUserObj.fullName,
            displayName: senderUserObj.displayName
        });
    }
}

module.exports = FriendRequestAcceptHandler;