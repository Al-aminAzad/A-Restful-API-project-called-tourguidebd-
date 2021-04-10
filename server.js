const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

// console.log(app.get('env'));//set by express

// console.log(process.env);

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log('DB connected successfully'));
// const testTour = new Tour({ name: 'The Park Hamper', price: 997 });
// testTour
//   .save()
//   .then((doc) => console.log(doc))
//   .catch((err) => console.log('Error:', err));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`listening port on ${port}`);
});

process.on('unhandledRejection', (err) => {
  //console.log(err);
  console.log(err.name, err.message);
  console.log('UNHANDLE REJECTION! Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});
