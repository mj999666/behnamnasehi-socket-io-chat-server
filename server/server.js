const express = require('express')
    , http = require('http')
    , bodyParser = require('body-parser')
    , hashMap = require('hashmap')


let app = express();
app.set('port', 3000);
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

let server = http.createServer(app);
let io = require('socket.io')(server);

const userApi = require('./routes/api/user');
const {User} = require('./schema/user');
const roomApi = require('./routes/api/room');
const messageApi = require('./routes/api/message');
const {authenticateUser} = require('./middleware/authenticateUser')

app.post('/v1/user/login', userApi.login);
app.post('/v1/user/register', userApi.register);
app.get('/v1/user/:username', userApi.findUserName);
app.get('/v1/user/:fcm_key', userApi.findUserName);
app.post('/v1/room', authenticateUser, roomApi.createRoom);
app.get('/v1/room', authenticateUser, roomApi.getRooms);
app.get('/v1/room/:room', authenticateUser, roomApi.getRoom);

let clients = new hashMap(); // for store online users

io.use(async (socket, next) => {
    try {
        //check to see if there is such a user?
        let user = await User.findOne({public_key: socket.handshake.query.public_key});
        if (user) {//exist : store user to hashmap and next()
            clients.set(socket.id, (user._id).toString())
            console.log(clients)
            await User.findByIdAndUpdate(user._id, {last_seen: 0});
            return next();
        } else {//not exist: don't allow user
            console.log("err")
        }
    } catch (e) {
        console.log(e)
    }
})

io.on('connection', function (socket) {

    console.log("[socket] connected :" + socket.id);

    //event join room
    socket.on('join', async function (room) {
        //android device pass parameter "room id " to the event and join
        socket.join(room);
    })

    socket.on('message_detection', async function (data) {
        //detect the message and send it to user
        await messageApi.sendMessage(data, io, socket)

        //notify user that have new message
        await messageApi.notifyDataSetChanged(data.room, io, clients)
    })

    socket.on('disconnect', async function () {
        console.log("[socket] disconnected :" + socket.id);
        //in this event we get user from database and set last seen to now
        await User.findByIdAndUpdate(clients.get(socket.id), {last_seen: new Date().getTime()});
        //search in hashmap and find the related socket and delete it
        await clients.delete(socket.id);
    })

});

server.listen(app.get('port'), function () {
    console.log('[server] server listening on port ' + app.get('port'));
});
