const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;
const db = require('./queries');

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/chillout', (req, res) => {
    res.sendFile(__dirname + '/public/chillout.html');
});

app.get('/nightlife', (req, res) => {
    res.sendFile(__dirname + '/public/nightlife.html');
});

app.get('/seriesenmovies', (req, res) => {
    res.sendFile(__dirname + '/public/seriesenmovies.html');
});

app.get('/sports', (req, res) => {
    res.sendFile(__dirname + '/public/sports.html');
});

//tech namespace
const tech = io.of('/tech');

tech.on('connection', (socket) => {
    socket.on('join', (data) => {
        socket.join(data.room);
        tech.in(data.room).emit('message', `New user joined ${data.room} room!`)
    })

    socket.on('message', (data) => {
        console.log(`message: ${data.msg}`);
        tech.in(data.room).emit('message', data.msg);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');

        tech.emit('message', 'user disconnected');
    });
})
