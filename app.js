const express = require('express');
const app = express();
const morgan = require('morgan');

//custom modules
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utilities/appError');
const globalErrorHandler = require('./controllers/errorController');
//1) MIDDLEWARE START
if (process.env.NODE_ENV === 'development') {
  // console.log(process.env.NODE_ENV);
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});
// END OF MIDDLEWARE

//ROUTES
app.use('/api/v1/tours', tourRouter); //middleware
app.use('/api/v1/users', userRouter); //middleware
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'failed',
  //   message: `Can not find ${req.originalUrl} on this server!`,
  // });
  // const err = new Error(`Can not find ${req.originalUrl} on this server!`);
  // err.statusCode = 404;
  // err.status = 'failed';
  next(new AppError(`Can not find ${req.originalUrl} on this server!`, 404));
});
app.use(globalErrorHandler);
//END OF ROUTES

//SERVER START
module.exports = app;
