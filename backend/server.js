const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
// DB Config
// const { connectDB, sequelize } = require('./config/database');
const { admin } = require('./config/firebaseAdmin'); // Initialize Firebase Admin

const app = express();
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

app.get('/', (req, res) => {
  res.send('AgileFlow Backend Running');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
