/* global __dirname */
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const projectsRoutes = require('./routes/projects');
const tasksRoutes = require('./routes/tasks');
const notificationsRoutes = require('./routes/notifications');
const usersRoutes = require('./routes/users');
const uploadRoutes = require('./routes/upload');
const siteProgressRoutes = require('./routes/siteProgress');
const inventoryRoutes = require('./routes/inventory');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/auth', authRoutes);
app.use('/projects', projectsRoutes);
app.use('/tasks', tasksRoutes);
app.use('/notifications', notificationsRoutes);
app.use('/users', usersRoutes);
app.use('/upload', uploadRoutes);
app.use('/site-progress', siteProgressRoutes);
app.use('/inventory', inventoryRoutes);

app.get('/', (req, res) => res.send('BuildSphere API is running ✅'));

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ BuildSphere API running at http://localhost:${PORT}`);
});
