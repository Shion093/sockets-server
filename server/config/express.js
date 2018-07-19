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

const MediaServer = require('medooze-media-server');

const ip = '127.0.0.1';

//Create UDP server endpoint
const endpoint = MediaServer.createEndpoint(ip);

console.log(endpoint);

const SemanticSDP	= require('semantic-sdp');
const SDPInfo		= SemanticSDP.SDPInfo;
const MediaInfo		= SemanticSDP.MediaInfo;
const CandidateInfo	= SemanticSDP.CandidateInfo;
const DTLSInfo		= SemanticSDP.DTLSInfo;
const ICEInfo		= SemanticSDP.ICEInfo;
const StreamInfo	= SemanticSDP.StreamInfo;
const TrackInfo		= SemanticSDP.TrackInfo;
const Direction		= SemanticSDP.Direction;
const CodecInfo		= SemanticSDP.CodecInfo;

//Create new streamer
const streamer = MediaServer.createStreamer();

//Create new video session codecs
const video = new MediaInfo("video","video");

//Add h264 codec
video.addCodec(new CodecInfo("h264",96));

//Create session for video
const session = streamer.createSession(video, {
  local  : {
    port: 5004
  }
});

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

  socket.on('make-offer', function(frame) {
    console.log(frame);
    var data = JSON.parse(frame);
    var offer = SDPInfo.process(data.offer);

    console.log('gtgtg', offer);

    //Create an DTLS ICE transport in that enpoint
    const transport = endpoint.createTransport({
      dtls : offer.getDTLS(),
      ice  : offer.getICE()
    });

    console.log('ferferfe', transport)

    //Set RTP remote properties
    transport.setRemoteProperties({
      audio : offer.getMedia("audio"),
      video : offer.getMedia("video")
    });

    //Get local DTLS and ICE info
    const dtls = transport.getLocalDTLSInfo();
    const ice  = transport.getLocalICEInfo();


    //Get local candidates
    const candidates = endpoint.getLocalCandidates();

    console.log('234234234', candidates)

    //Create local SDP info
    let answer = new SDPInfo();

    //Add ice and dtls info
    answer.setDTLS(dtls);
    answer.setICE(ice);
    //For each local candidate
    for (let i=0;i<candidates.length;++i)
      //Add candidate to media info
      answer.addCandidate(candidates[i]);

    //Get remote video m-line info
    let audioOffer = offer.getMedia("audio");

    console.log('dasdwdww', audioOffer)

    //If offer had video
    if (audioOffer)
    {
      //Create video media
      let  audio = new MediaInfo(audioOffer.getId(), "audio");
      //Set recv only
      audio.setDirection(Direction.INACTIVE);
      //Add it to answer
      answer.addMedia(audio);
    }

    //Get remote video m-line info
    let videoOffer = offer.getMedia("video");


    console.log('dasdwdww', videoOffer)
    //If offer had video
    if (videoOffer)
    {
      //Create video media
      let  video = new MediaInfo(videoOffer.getId(), "video");

      console.log('videooo', video)

      //Get codec types
      let h264 = videoOffer.getCodec("h264");
      //Add video codecs
      video.addCodec(h264);
      //Set recv only
      video.setDirection(Direction.RECVONLY);
      //Add it to answer
      answer.addMedia(video);
    }

    //Set RTP local  properties
    transport.setLocalProperties({
      audio : answer.getMedia("audio"),
      video : answer.getMedia("video")
    });


    //Create new local stream with only video
    const outgoingStream  = transport.createOutgoingStream({
      audio: false,
      video: true
    });


    console.log('rfuryfur', outgoingStream)
    console.log('rfuryfur333', outgoingStream.getVideoTracks());

    //Copy incoming data from the broadcast stream to the local one
    outgoingStream.getVideoTracks()[0].attachTo(session.getIncomingStreamTrack());

    //Get local stream info
    const info = outgoingStream.getStreamInfo();

    //Add local stream info it to the answer
    answer.addStream(info);


    io.to(socket.id).emit('answer-made', {
      socket: socket.id,
      answer: answer,
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
    io.to(data.to).emit('answer-made2', {
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
