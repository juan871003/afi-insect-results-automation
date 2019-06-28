const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const app = express();

const scrapper = require('./scrapperCtrlr');
const minutesLoop = app.get('env') === 'development' ? 0.5 : 5;
scrapper.initialise(app.get('env'), minutesLoop);

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const entryProcessorRouter = require('./routes/entryprocessor')(scrapper);


/// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/processentry', entryProcessorRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  console.error(err.message);

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
