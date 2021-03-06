const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const compress = require('compression');
const helmet = require('helmet');
const cors = require('cors');

const routes = require('../api');
const { logs } = require('./constants');
const { handler, converter, notFound } = require('../middlewares/errors');

const app = express();

const server = require('http').Server(app);
const io = require('socket.io')(server);

const sockets = [];
let host = '';

io.on('connection', (socket) => {

  sockets.push(socket.id);

  socket.on('join', (room) => {
    console.log(room);
    socket.join(room.room);
    const clients = io.sockets.adapter.rooms[room.room];
    console.log(clients);

    if (room.isHost) {
      host = socket.id;
    }
    io.emit('added', {
      clients : Object.keys(clients.sockets)
    });
    io.to(socket.id).emit('me', { me : socket.id, host })
  });


  socket.on('disconnect', () => {
    console.log('user disconnected')
  });

  socket.emit('add-users', {
    users: sockets
  });

  socket.broadcast.emit('add-users', {
    users: [socket.id]
  });

  socket.on('make-offer', function(data) {
    console.log('made', data);
    socket.to(data.to).emit('offer-made', {
      offer: data.offer,
      socket: socket.id
    });
  });

  socket.on('new-candidate', function(data) {
    console.log('made', data);
    io.to(data.to).emit('candidate', {
      candidate: data.candidate,
      socket: socket.id
    });
  });

  socket.on('make-answer', function(data) {
    console.log(data);
    io.to(data.to).emit('answer-made', {
      socket: socket.id,
      answer: data.answer
    });
  });

  socket.on('disconnect', function() {
    sockets.splice(sockets.indexOf(socket.id), 1);
    io.emit('remove-user', socket.id);
  });

});

app.use(morgan(logs));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compress());
app.use(helmet());
app.use(cors());

app.use('/v1', routes);

app.use(converter);
app.use(notFound);
app.use(handler);

module.exports = server;
