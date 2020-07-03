const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;
const db = require('./queries');

const rooms = [{
    id: 1,
    name: 'sports',
    display_name: 'Sports',
    messages: [
    ]

},
{
    id: 2,
    name: 'chillout',
    display_name: 'Chillout',
    messages: [
    ]
},
{
    id: 3,
    name: 'seriesenmovies',
    display_name: 'Series en Movies',
    messages: [
    ] 
},
{
    id: 4,
    name: 'nightlife',
    display_name: 'Nightlife',
    messages: [
    ] 
}];

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/:room_name', (req, res) => {
    const room = rooms.find((room) => {
        return room.name == req.params.room_name;
    });

    if (!room) {
        res.status(404).send('Not Found');
    } else {
        res.sendFile(__dirname + '/public/room.html');
    }
});


//tech namespace
const tech = io.of('/tech');

tech.on('connection', (socket) => {
    socket.on('join', (data) => {
        socket.join(data.room);

        const room = rooms.find((room) => {
            return room.name == data.room;
        });
        const history = room.messages;

        tech.in(data.room).emit('history', history).emit('message', { 'username': 'System', 'msg': `New user joined ${data.room} room!` })
    })

    socket.on('message', (data) => {
        const roomIndex = rooms.findIndex((room) => {
            return room.name == data.room;
        });

        const room = rooms[roomIndex];
        room.messages.push({ id: Date.now(), message: { msg: data.msg, username: data.username } });

        rooms[roomIndex] = room;

        tech.in(data.room).emit('message', { 'username': data.username, 'msg': data.msg });

        console.log(rooms);
    });

    socket.on('disconnect', () => {
        tech.emit('message', 'user disconnected');
    });
})
