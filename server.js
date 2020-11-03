'use strict';

// Load dotenv
require('dotenv').config();

// dotenv variables
const PORT = process.env.PORT || 3000;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

//  Dependencies
const express = require('express');
const superagent = require('superagent');
const cors = require('cors');
const pg = require('pg');

// App setup
const app = express();
app.set('view engine', 'ejs');
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Database Setup
const client = new pg.Client(DATABASE_URL);

// Resources directory
app.use(express.static('public'));

// Constructor
function Book(bookData) {
  this.image_url = bookData.imageLinks.thumbnail;
  this.title = bookData.title;
  this.author = bookData.authors || 'Author not mentioned';
  this.description = bookData.description || 'No description found.';
  this.isbn = `${bookData.industryIdentifiers[0].type} ${bookData.industryIdentifiers[0].identifier}` || 'ISBN not available';
}

// Listen
client.connect().then(() => {
  app.listen(PORT, () => console.log(`Listening on localhost: ${PORT}`));
}).catch(() => console.log(`Could not connect to database`));


// Routes
app.get('/searches/new', searchFunction);
app.post('/searches', resultsFunction);
app.get('/books/:id', singleBookFunction);
app.post('/books', addBookFunction);
app.get('/', bookShelfFunction);
app.use('*', errorFunction);

// Handlers
function bookShelfFunction(request, response) {
  const selectAll = 'SELECT * FROM books;';
  client.query(selectAll).then(bookData => {
    let books = bookData.rows.map((value) => value);
    const responseObject = { books: books };
    response.status(200).render('./pages/index.ejs', responseObject);
  });
}
function singleBookFunction(request, response) {
  const select = 'SELECT * FROM books WHERE id=$1;';
  const bookId = [request.params.id];
  client.query(select, bookId).then(bookData => {
    const responseObject = { books: bookData.rows };
    response.render('pages/books/detail.ejs', responseObject);
  });
}
function addBookFunction(request, response) {
  // console.log(request.body);
  let newBook = request.body.bookData.split('+++');
  const search = 'SELECT * FROM books WHERE author=$1 AND title=$2 AND isbn=$3 AND image_url=$4 AND description=$5;';
  const select = 'SELECT * FROM books;';
  const insert = 'INSERT INTO books (author, title, isbn, image_url, description) VALUES($1,$2,$3,$4,$5);';

  client.query(search, newBook).then(bookData => {
    let bookId = bookData.rows[0].id.toString();
    console.log('already in database');
    response.redirect(`/books/${bookId}`);
  }).catch(() => {
    console.log('Not existing in database');
    client.query(insert, newBook);
    client.query(select).then(bookData => {
      let i = Number(bookData.rows.length - 1);
      let bookId = bookData.rows[i].id.toString();
      response.redirect(`/books/${bookId}`);
    }).catch(console.error);
  });
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

