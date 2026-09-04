const app = require('./app');
const { port } = require('./config/env');

app.listen(port, () => {
  console.log(`🚀 PPDB Chatbot backend berjalan di http://localhost:${port}`);
});
