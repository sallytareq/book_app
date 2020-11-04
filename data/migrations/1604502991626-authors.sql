-- psql 
-- CREATE DATABASE books_app;
-- exit psql 
-- psql -f /data/schema.sql -d books_app
-- seed data into table
-- psql
-- CREATE DATABASE books_app_normal WITH TEMPLATE books_app;
-- psql -f /data/migrations/1604502991626-authors.sql -d books_app_normal

DROP TABLE IF EXISTS authors;

CREATE TABLE authors (id SERIAL PRIMARY KEY, name VARCHAR(255));

INSERT INTO authors(name) SELECT DISTINCT author FROM books;

ALTER TABLE books ADD COLUMN author_id INT;

UPDATE books SET author_id=author.id FROM (SELECT * FROM authors) AS author WHERE books.author = author.name;

ALTER TABLE books ADD CONSTRAINT fk_authors FOREIGN KEY (author_id) REFERENCES authors(id);