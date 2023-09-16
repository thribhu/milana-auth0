const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const url = require('url');
const sdk = require('./Casdoor');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// cors for react application
app.use(
  cors({
    origin: 'http://localhost:9000',
    credentials: true,
  })
);

app.use('/', indexRouter);
app.get('/api/getUsersInfo', (req, res) => {
  const token = req.headers.authorization;
  let user = sdk.parseJwtToken(token.split(' ')[1]);
  res.send(JSON.stringify(user));
});
app.use('/api/users', usersRouter);
app.post('*', (req, res) => {
  let urlObj = url.parse(req.url, true).query;
  sdk.getAuthToken(urlObj.code).then((response) => {
    const accessToken = response.access_token;
    res.send(JSON.stringify({ token: accessToken }));
  });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
