const fs = require('fs');
const path = require('path');
require('dotenv').config();

const distStandaloneServer = path.join(__dirname, 'dist', 'standalone', 'server.js');

process.env.PORT = process.env.PORT || '3000';
process.env.HOSTNAME = process.env.HOSTNAME || '0.0.0.0';
process.env.PUBLIC_ORIGIN =
  process.env.PUBLIC_ORIGIN ||
  process.env.RENDER_EXTERNAL_URL?.replace(/\/$/, '') ||
  `http://${process.env.HOSTNAME}:${process.env.PORT}`;

if (!fs.existsSync(distStandaloneServer)) {
  throw new Error('Missing backend/dist/standalone/server.js. Run npm install in backend so the frontend build copies into backend/dist before starting in production.');
}

process.chdir(path.dirname(distStandaloneServer));
require(distStandaloneServer);
