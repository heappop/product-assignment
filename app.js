const express = require('express');
const db = require('./src/database/sql')
const routes = require('./src/routes/route'); // Adjust the path as necessary
require('dotenv').config();
const app = express();

const PORT = process.env.PORT || 3000;

// Use the routes defined in routes.js
app.use('/', routes); // Prefix all routes with '/api'

// Set up a basic route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
