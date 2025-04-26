const express = require('express');
const { AccessToken } = require('livekit-server-sdk');
const cors = require('cors');
const path = require('path');
const config = require('../config');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true,
    }
});

// Parse JSON request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.IO connection handling
io.on('connection', (socket) => {
    socket.on('disconnect', () => {

    });
});

app.post('/api/get-token', (req, res) => {
    try {
        const { roomName, participantName } = req.body;

        if (!roomName || !participantName) {
            return res.status(400).json({ error: 'Room name and participant name are required' });
        }

        // Create a token with LiveKit SDK
        const token = new AccessToken(config.livekit.apiKey, config.livekit.apiSecret, {
            identity: participantName,
        });

        token.addGrant({
            roomJoin: true,
            room: roomName,
        });

        // Return the token
        res.json({
            token: token.toJwt(),
            url: config.livekit.url
        });
    } catch (error) {
        console.error('Error generating token:', error);
        res.status(500).json({ error: 'Failed to generate token' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Start the server
const PORT = config.port;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
    console.log(`Socket.IO server is running`);
});
