require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(require('./routes'));

console.log(process.env.MONGODB_URI);
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pizza-hunt', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(
    () => {
      app.listen(PORT, () => console.log(`🌍 Connected on localhost:${PORT}`));
    },
    (err) => {
      console.log(err);
    }
  );
