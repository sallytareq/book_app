'use strict';

// load dotenv
require('dotenv').config();

// dotenv variables
const PORT = process.env.PORT || 3000;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

//  Dependencies
const express = require('express');
const superagent = require('superagent');
const cors = require('cors');
const pg = require('pg');

// App setup
const app = express();
app.set('view engine', 'ejs');
app.use(cors());

// Listen
app.listen(PORT, () => console.log(`Listening on localhost: ${PORT}`));

// Routes
app.get('/hello', general);
// app.get('/hello', testFunction);
app.use('*', errorFunction);

// Handlers
function general(request, response) {
  response.render('./pages/index.ejs');
}
function errorFunction(request, response) {
  response.status(500).send('Sorry, something went wrong');
}
