require('dotenv').config();

module.exports = {
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'dev_secret_change_me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  dbPath: process.env.DB_PATH || './db/ppdb.sqlite',
  similarityThreshold: Number(process.env.SIMILARITY_THRESHOLD || 0.35),
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
};
