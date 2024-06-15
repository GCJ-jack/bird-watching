/**
 * Module: createError
 * Description: Create HTTP error objects.
 */
var createError = require('http-errors');
/**
 * Module: express
 * Description: Express.js framework for creating web applications.
 */
var express = require('express');
/**
 * Module: path
 * Description: offer ability for working with file and directory paths
 */
var path = require('path');
/**
 * Module: cookieParser
 * Description: Parse Cookie header and populate req.cookies.
 */
var cookieParser = require('cookie-parser');
/**
 * Module: logger
 * Description: HTTP request logger middleware for node.js.
 */
var logger = require('morgan');
/**
 * Router: indexRouter
 * Description: Handles routes for the index page.
 */
var indexRouter = require('./controllers/index');
/**
 * Router: usersRouter
 * Description: Handles routes for user-related actions.
 */
var usersRouter = require('./controllers/users');
/**
 * Router: birdSightRouter
 * Description: Handles routes for relate bird sighting.
 */
var birdSightRouter = require("./controllers/sightings");
/**
 * Model: ChatModel
 * Description: Model representing a chat in the database.
 */
const {ChatModel} = require("./models/chat");
const mongoose = require("mongoose");

// Create the Express app
var app = express();
// Create an HTTP server using the Express app
const server = require('http').createServer(app);

// Set up Socket.IO for real-time communication
const io = require('socket.io')(server);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//Set up middleware
app.use(logger('dev'));
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Define routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use("/sights", birdSightRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const PORT = process.env.PORT || 3000;
/**
 * Object: ChatSessions
 * Description: Stores active chat sessions.
 */
const ChatSessions = {};

io.on('connection', (socket) => {
  socket.on('sendMessage', async (dataStr) => {
    const data = JSON.parse(dataStr);
    const {sightId, message, sender} = data;
    await ChatModel.create({
      sight: new mongoose.mongo.ObjectId(sightId),
      message,
      sender
    });
    let messages = await ChatModel.find();
    messages = messages.filter(message => {
      return message.sight.toString() === sightId;
    })
    const sockets = ChatSessions[sightId];
    if (Array.isArray(sockets)) {
      try {

        for (let soc of sockets) {
          io.to(soc.id).emit('updateMessages', JSON.stringify(messages));
        }
      } catch (err) {
        console.log(`Emit update message fail`, err);
      }
    }
  })

  socket.on('joinSession', async (data) => {
    if (!ChatSessions[data]) {
      ChatSessions[data] = [{
        id: socket.id,
        socket
      }];
    } else {
      ChatSessions[data].push({
        id: socket.id,
        socket
      });
    }
    let messages = await ChatModel.find();

    messages = messages.filter(message => {
      return message.sight.toString() === data;
    })
    try {
      socket.emit('updateMessages', JSON.stringify(messages));
    } catch (err) {

    }

  });
  socket.on('disconnect', () => {
    for (let sightId in ChatSessions) {
      const sockets = ChatSessions[sightId];
      for (let soc of sockets) {
        if (soc.id === socket.id) {
          ChatSessions[sightId] = sockets.filter(soc => soc.id !== socket.id)
          return;
        }
      }
    }
  });
});
// Start the server and listen on the specified port
server.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});
