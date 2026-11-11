// APP - builds the Express app (but does not start it; server.js does that).
// Keeping them apart lets the tests use the app without opening a real port.
//
// Every request goes through these steps, top to bottom:
//   cors -> read JSON body -> the matching route -> (no route: 404) -> error handler

const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { checkConnection } = require('./db/connection');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.disable('x-powered-by'); // do not tell everyone we run Express
app.use(cors()); // lets Expo web (a browser) call the API; phones do not need it
app.use(express.json({ limit: '200kb' })); // reads JSON bodies into req.body

// Quick "is it running?" check, also checks the database.
app.get('/health', async (req, res) => {
  await checkConnection();
  res.status(200).json({ status: 'ok' });
});

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
