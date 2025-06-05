import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import pino from 'pino';
import MessageBroker, { CHAT_MESSAGES_TOPIC_NAME } from './broker.js';

const logger = pino();
const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;

const redisUri = process.env.REDIS_URI || "redis://localhost:6379"
const broker = MessageBroker.build({ url: redisUri}, logger);

const socketServer = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000", "http://demo.chats.local"],
    methods: ["GET", "POST"]
  }
});

socketServer.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });

  socket.on('join-chat', (chatId) => {
    // update number of online users for chat?
  });

  // change this to API REST 
  socket.on('send-message', (messageData) => {
    // publish to broker
    messageData = JSON.parse(messageData);
    messageData.socketId = socket.id;
    broker.publish(CHAT_MESSAGES_TOPIC_NAME, messageData);
  })
});

broker.listen(CHAT_MESSAGES_TOPIC_NAME, (message) => {
  logger.info("Message received from redis");
  logger.info(message);
  const messageInfo = JSON.parse(message);
  // send to other clients
  socketServer.emit(messageInfo.chatId, messageInfo.text);
});

httpServer.listen(PORT, () => {
  logger.info(`Server running at http://localhost:${PORT}`);
});