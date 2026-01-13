const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const { connectDB, sequelize } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to Database
connectDB();

// Sync Database Models
const User = require('./models/User');
const Task = require('./models/Task');
// Force false to avoid dropping data, alter true to update schema
sequelize.sync({ alter: true }).then(() => {
  console.log('Database Synced');
}).catch(err => console.log('Error syncing database:', err));

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));

app.get('/', (req, res) => {
  res.send('AgileFlow Backend Running');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
