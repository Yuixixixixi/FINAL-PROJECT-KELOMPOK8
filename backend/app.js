const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const { frontendOrigin, nodeEnv } = require('./config/env');
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');

const healthRoutes = require('./routes/health.routes');
const chatRoutes = require('./routes/chat.routes');
const adminRoutes = require('./routes/admin.routes');
const knowledgeRoutes = require('./routes/knowledge.routes');
const unansweredRoutes = require('./routes/unanswered.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const botProfileRoutes = require('./routes/botProfile.routes');

const app = express();

app.use(cors({ origin: frontendOrigin, credentials: true }));
app.use(express.json());
if (nodeEnv !== 'test') app.use(morgan('dev'));

// ---- Routes ----
app.use('/api/health', healthRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/knowledge', knowledgeRoutes);
app.use('/api/admin/unanswered', unansweredRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/bot-profile', botProfileRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
