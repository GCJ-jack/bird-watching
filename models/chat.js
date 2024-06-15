/**
 * chat.js - Chat Model
 */
const mongoose = require("mongoose");

/**
 * Define the chat history schema
 */
const ChatSchema = new mongoose.Schema({
  sight: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BirdSight'
  },
  sender: String,
  message: String
}, {
  timestamps: true
});

/**
 * Define the chat model
 */
const ChatModel = mongoose.model('Chat', ChatSchema);

/**
 * Export the ChatModel
 */
module.exports = {
  ChatModel
}

