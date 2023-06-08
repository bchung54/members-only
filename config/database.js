const mongoose = require('mongoose');
require('dotenv').config();

mongoose.set('strictQuery', false);
/* mongoose.set('debug', (collectionName, method, query, doc) => {
  console.log(`${collectionName}.${method}`, JSON.stringify(query), doc);
}); */

const mongoDB = process.env.MONGO_URL;
mongoose.connect(mongoDB, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongo connection error'));
