const FCM = require('fcm-node');
const serverKey = 'AAAAqTFc4W4:APA91bHOw7__lx3DPzYOlFGoJ4jktmBEVLAPVLt5sDaRnZCHQV2G1MyLqEubvm6MFxlf9CrnwEBaLqcRJRBOsUhU64lm0OkDytYqzwCmQOHV1yEE22Gbfm2ilgAOpzywrk_BYrwGk'; //put your server key here
const fcm = new FCM(serverKey);

//notify user from unread message with firebase
exports.unreadMessage = function (message, FCM_KEY) {

    let payloadOK = {
        to: FCM_KEY,
        data: { //some data object (optional)
            room: message.room
        },
        priority: 'high',
        content_available: true,
        notification: { //notification object
            title: message.from.username, body: message.content, sound: "default", badge: "1"
        }
    };

    return fcm.send(payloadOK, function (err, response) {
        if (err) {
            console.log("Something has gone wrong!" + err);
        } else {
            console.log("Successfully sent with response: ", response);
        }
    });
};
