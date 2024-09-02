const express = require('express');
const db = require('./src/database/sql')
const routes = require('./src/routes/route'); 
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use('/', routes); 

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

