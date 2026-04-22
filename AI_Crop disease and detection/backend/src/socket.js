const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let ioInstance;

const extractCookieToken = (cookieHeader) => {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(';').map((part) => part.trim());
  const tokenPair = parts.find((part) => part.startsWith('token='));
  return tokenPair ? decodeURIComponent(tokenPair.split('=')[1]) : null;
};

const initSocket = (httpServer, corsOrigin) => {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: corsOrigin,
      credentials: true
    }
  });

  ioInstance.use((socket, next) => {
    try {
      const cookieToken = extractCookieToken(socket.handshake.headers.cookie);
      if (!cookieToken) return next(new Error('Unauthorized socket'));
      const decoded = jwt.verify(cookieToken, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      return next();
    } catch (error) {
      return next(new Error('Unauthorized socket'));
    }
  });

  ioInstance.on('connection', (socket) => {
    socket.join(`user:${socket.userId}`);
  });

  return ioInstance;
};

const getIO = () => ioInstance;

module.exports = { initSocket, getIO };
