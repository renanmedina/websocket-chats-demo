import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;
const __dirname = dirname(fileURLToPath(import.meta.url));

const configs = {
  chatsService: {
    websocketUri: process.env.WEBSOCKET_URI || 'localhost:3001',
    transports: [ 'websocket' ]
  }
}

// handle html requests
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'pages/lobby.html'));
});

app.get('/configs', (req, res) => {
  res.status(200).json(configs);
})

app.get('/chat', (req, res) => {
  res.sendFile(join(__dirname, 'pages/chat.html'));
});

httpServer.listen(PORT, () => {
  console.log(`server running at http://localhost:${PORT}`);
});