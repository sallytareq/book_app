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

// App setup
const app = express();
app.set('view engine', 'ejs');
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// specify the public directory to access resources
app.use(express.static('public'));

// Listen
app.listen(PORT, () => console.log(`Listening on localhost: ${PORT}`));

// Routes
app.get('/', general);
// app.get('/hello', general);
app.get('/searches/new', searchFunction);
app.post('/searches', resultsFunction);
app.use('*', errorFunction);

// Handlers
function general(request, response) {
  response.status(200).render('./pages/index.ejs');
}

function searchFunction(request, response) {
  response.status(200).render('./pages/searches/new.ejs');
}

function resultsFunction(request, response) {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${request.body.property}:${request.body.search}&key=${GOOGLE_API_KEY}`;

  superagent.get(url).then(bookData => {
    // console.log(bookData.body);
    let books = bookData.body.items.map((value, index) => {
      if (index < 10) { return (new Book(value.volumeInfo)); }
    });
    const responseObject = { books: books };
    response.status(200).render('./pages/searches/show.ejs', responseObject);
  }).catch(console.error);
}

function errorFunction(request, response) {
  response.status(404).render('./pages/error.ejs');
}

// Constructors
function Book(bookData) {
  this.image = bookData.imageLinks.thumbnail;
  this.title = bookData.title;
  this.author = bookData.authors;
  this.description = bookData.description || 'No description found.';
}