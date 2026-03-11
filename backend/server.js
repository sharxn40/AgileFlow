const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');

dotenv.config();
// DB Config
const { admin } = require('./config/firebaseAdmin'); // Initialize Firebase Admin

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://agileflow-56.web.app",
      "https://agileflow-56.firebaseapp.com"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});
const PORT = process.env.PORT || 3000;

// Connect Database (SQLite - DISABLED)
// connectDB();

// Firestore Models (No manual sync needed)
// const User = require('./models/firestore/User');
// const Task = require('./models/firestore/Task');
// const Notification = require('./models/firestore/Notification');

// Firestore handles schema-less data, so no "sync" or "associations" setup is required here.
console.log("Firestore Mode: logic handled in controllers.");

app.use(cors());
app.use(express.json());

// Serve static uploaded files
const path = require('path');
app.use('/public', express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/sprints', require('./routes/sprintRoutes'));
app.use('/api/project-lead', require('./routes/projectLeadRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/issues', require('./routes/issueRoutes'));
app.use('/api/invitations', require('./routes/invitationRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/teams', require('./routes/teamRoutes'));
app.use('/api/vault', require('./routes/vaultRoutes'));

app.get('/', (req, res) => {
  res.send('AgileFlow Backend Running');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Socket.io Real-time Logic
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join_team', (teamId) => {
    socket.join(teamId);
    console.log(`Socket ${socket.id} joined team room: ${teamId}`);
  });

  socket.on('send_message', (data) => {
    // data: { teamId, messageId, userId, text, type, attachments, createdAt }
    // Broadcast to everyone in the team room EXCLUDING the sender
    socket.to(data.teamId).emit('receive_message', data);
  });

  socket.on('typing', (data) => {
    // data: { teamId, username }
    socket.to(data.teamId).emit('user_typing', data);
  });

  socket.on('read_message', (data) => {
    // data: { teamId, messageId, userId }
    socket.to(data.teamId).emit('message_read', data);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server & WebSockets running on port ${PORT}`);
  if (process.env.STRIPE_SECRET_KEY) console.log("Stripe Connected");
});
