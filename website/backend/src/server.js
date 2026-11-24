// SERVER - starts the website backend.   npm start   (or   npm run dev   to restart on changes)

const app = require('./app');
const config = require('./config');

app.listen(config.port, () => {
  console.log(`KidBuddy website backend on http://localhost:${config.port}`);
  console.log(`  forwarding /api to the shared KidBuddy API at ${config.upstream.url}`);
  console.log(`  API docs: http://localhost:${config.port}/web-api/docs`);
});
