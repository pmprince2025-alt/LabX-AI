const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { handleQuery } = require('./modules/queryHandler');

const app = express();
const server = http.createServer(app);

// Setup CORS
app.use(cors({
  origin: '*', // Allow Vite dev server
  methods: ['GET', 'POST']
}));
app.use(express.json());

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('send_query', async (data) => {
    console.log(`Query received bounds: ${data.query}`);
    await handleQuery(socket, data.query);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`LabX Server running on port ${PORT}`);
});

