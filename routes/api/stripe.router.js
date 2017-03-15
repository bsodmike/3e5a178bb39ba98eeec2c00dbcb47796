const stripe = require('stripe')(process.env.STRIPE_KEY);

const validator = require('validator');

// const util = require('util');

module.exports = (app, router) => {
  router.post('/customers', (req, res) => {
    const data = req.body;
    const customerEmail = data.email;
    const paymentSource = data.source;
    let description;
    let metaData;

    if (data.email === undefined) {
      res.status(422).json({ error: 'Required parameter missing!' });
      return;
    }

    if (paymentSource === undefined) {
      res.status(422).json({ error: 'Required parameter for payment source is missing!' });
      return;
    }

    if (!validator.isEmail(customerEmail)) {
      res.status(422).json({ error: 'Required parameter has invalid format!' });
      return;
    }

    if (data.description !== undefined) {
      description = data.description;
    }

    if (data.metaData !== undefined) {
      metaData = data.metaData;
    }

    stripe.customers.create({
      email: customerEmail,
      description,
      metadata: metaData,
      source: {
        object: 'card',
        number: paymentSource.number,
        exp_month: paymentSource.expMonth,
        exp_year: paymentSource.expYear,
        name: paymentSource.name,
        cvc: paymentSource.cvc,
      },
    }).then((customer) => {
      res.json({
        id: customer.id,
        email: customer.email,
        created: customer.created,
        accountBalance: customer.account_balance,
      });
    }).catch((err) => {
      console.log('ERROR: %s', err);
      res.status(422).json({ error: err });
    });
  });

  router.post('/charges', (req, res) => {
    const data = req.body;
    const customerToken = data.customer;
    const amount = data.amount;
    const currency = data.currency;

    if (customerToken === undefined) {
      res.status(422).json({ error: 'Customer token is required!' });
      return;
    }

    // if (!validate.isNumeric(amount)) {
    //   res.status(422).json({ error: 'Charge amount must be cents only!' });
    //   return;
    // }

    stripe.charges.create({
      customer: customerToken,
      amount,
      currency,
    }).then((charge) => {
      console.log('RESULT %s', charge);
    })
    .catch((err) => {
      res.status(422).json({ error: err });
    });
  });

  return router;
};
