const express = require('express');
require('dotenv').config();
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const PORT = process.env.PORT;
const JWKSURI = process.env.JWKSURI;
app.use(cors());
const mongoose = require('mongoose');
const axios = require('axios');

const client = jwksClient({
  jwksUri: JWKSURI,
});

app.get('/', (request, response) => {
  response.send('Hello World 🥳');
});

app.get('/profile', (request, response) => {});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    var signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

app.get('/verify-token', (request, response) => {
  const token = request.headers.authorization.split(' ')[1];
  // console.log(token);

  jwt.verify(token, getKey, {}, (error, user) => {
    if (error) {
      response.send('invalid token');
    }
    response.json(user);
  });
});

mongoose.connect('mongodb://localhost:27017/book_fav', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const BooksSchema = new mongoose.Schema({
  title: String,
  status: String,
  description: String,
  email: { type: String, unique: true },
});
const Book = mongoose.model('Book', BooksSchema);
function SeedBooksCollection() {
  const gameofthrones = new Book({
    title: 'Game of thrones',
    status: 'good',
    description: 'a bunch of kings fighting on a chair',
    email: 'm7moud.abubaker.92@gmail.com',
  });
  const harrypoter = new Book({
    title: 'harry poter',
    status: 'perfect',
    description: 'some wizard stuffs',
    email: 'deyaa.pozan@gmail.com',
  });
  const fightclub = new Book({
    title: 'fightclub',
    status: 'the best',
    description: "don't talk about fight club (first rule)",
    email: 'abod.kafaween@gmail.com',
  });

  gameofthrones.save();
  harrypoter.save();
  fightclub.save();
}

SeedBooksCollection();
function handlebooks(req, res) {
  console.log('dayaaaaa');
  axios
    .get(`http://localhost:8080/books?email=${req.query.email}`)
    .then((resultemail) => {
      console.log(req.query.email);
      Book.findOne({ email: req.query.email }, function (error, result) {
        if (error) {
          res.send(error.message);
        } else if (result === undefined) {
          res.send('data is not found');
        } else {
          res.send(result);
        }
      });
    })
    .catch((error) => {
      res.send(error.message);
    });
}

app.get('/books', handlebooks);

app.listen(PORT, () => console.log(`listening on ${PORT}`));
