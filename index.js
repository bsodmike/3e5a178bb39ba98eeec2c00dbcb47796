const express = require('express');

const app = express();
const port = process.env.PORT || 3000;
const chalk = require('chalk');
const bodyParser = require('body-parser');
require('dotenv').config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const stripeApiRouter = require('./routes/api/stripe.router');

app.use('/', stripeApiRouter(app, express.Router()));

app.listen(port, (err) => {
  console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), port, app.get('env'));
  console.log('  Press CTRL-C to stop\n');

  if (err) {
    console.log('Error running server %s', err);
  }
});

module.exports = app;
