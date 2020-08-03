// grab the things we need
const {mongoose} = require('./../database/mongoose');
let Schema = mongoose.Schema;
let ObjectId = Schema.ObjectId;

const MessageType = {
    TEXT: 0,
    PICTURE: 1,
    AUDIO: 2,
    VIDEO: 3,
};

const EventType = {
    MESSAGE: 0,
    JOIN: 1,
    SERVER: 2,
    TYPING: 3
};

const ReadStatus = {
    FAILED: 0,
    SENT: 1,
    READ: 2,
};

// create a schema
let messageSchema = new Schema({
    //generate autoincrement id
    index: {type: String, unique: true},
    //user who send message
    from: {type: ObjectId, ref: "User", default: null},
    //in which room message sent
    room: {type: ObjectId, ref: "Room", default: null},
    //the content of the message
    content: {type: String, trim: true, default: '(empty)'},
    //type of the message it can be image , text
    content_type: {type: Number, required: true, default: MessageType.TEXT},
    //the type of the event it can be message , join , typing
    event_type: {type: Number, required: true, default: EventType.MESSAGE},
    //use for checking message status , we can use it for check that user is read message or not
    read_status: {type: Number, required: true, default: ReadStatus.SENT},
    //timestamp
    updated_at: {type: Number, required: true, default: new Date().getTime()},
    //timestamp
    created_at: {type: Number, required: true, default: new Date().getTime()}
});

messageSchema.pre('save', async function (next) {
    //get the count of the message document
    let count = await Message.countDocuments({});
    // and +1 for unique id
    this.index = count + 1;
    //timestamp
    this.updated_at = new Date().getTime();
    //timestamp
    this.created_at = new Date().getTime();
    next();
});

// the schema is useless so far
// we need to create a model using it
let Message = mongoose.model('Message', messageSchema);

// make this available to our users in our Node applications
module.exports = {Message, MessageType, EventType,ReadStatus};