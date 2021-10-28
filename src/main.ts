import * as authRoutes from './components/auth/routes';
import * as userRoutes from './components/users/routes';
import * as addressRoutes from './components/address/routes';
import * as weatherRoutes from './components/weather/routes';
import * as path from 'path';
import express = require('express');
import mongoose = require('mongoose');
import exphbs = require('express-handlebars');
import flash = require('express-flash');
import session = require('express-session');
import cookieParser = require('cookie-parser');
import logger = require('morgan');
import createError = require('http-errors');

const start = async () => {
  const app: express.Application = express();

  // view engine setup
  app.engine('hbs', exphbs({extname: '.hbs', defaultLayout: 'layout'}));
  app.set('views', path.resolve(__dirname, 'views'));
  app.set('view engine', 'hbs');

  app.use(express.json());
  app.use(express.urlencoded({extended: false}));
  app.use(logger('dev'));
  app.use(cookieParser());

  app.use(express.static(path.join(__dirname, 'public')));

  app.get('/health', (req: express.Request, res: express.Response) => {
    res.send('OK');
  });

  app.use(
    session({
      secret: 'secret',
      resave: true,
      saveUninitialized: true,
    })
  );
  app.use(flash());
  app.use(express.static(path.join(__dirname, 'public')));

  // Database
  if (process.env.NODE_ENV == 'production') {
    mongoose.connect(process.env.MONGODB_URI);
  } else {
    mongoose.connect('mongodb://mongo/oauth', {
      useNewUrlParser: true,
    } as unknown as mongoose.ConnectOptions);
    mongoose.set('debug', true);
  }

  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'MongoDB error: '));
  db.once('open', console.log.bind(console, 'MongoDB connection successful'));

  require('./components/auth/models');
  require('./components/users/models');

  // Routers
  app.use(authRoutes.default);
  app.use(userRoutes.default);
  app.use(addressRoutes.default);
  app.use(weatherRoutes.default);

  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    next(createError(404));
  });

  // error handler
  app.use(function (err: any, req: any, res: any, next: any) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = err;

    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });

  app.listen(3000);
};

start()
  .then(() => console.log('Server succesfully started on port 3000.'))
  .catch((err) => console.log(err));
