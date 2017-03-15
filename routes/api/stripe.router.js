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

  router.get('/charges', (req, res) => {
    const customerToken = req.query.customer_id;

    if (customerToken === undefined) {
      res.status(422).json({ error: 'Required parameter missing!' });
      return;
    }

    stripe.charges.list({
      customer: customerToken,
    }).then((charges) => {
      const chargeData = charges.data;

      res.json({
        customer: customerToken,
        charges: chargeData,
        chargesCount: chargeData.length,
        hasMore: charges.has_more,
        url: charges.url,
      });
    }).catch((err) => {
      if (err.type === 'StripeInvalidRequestError' && err.message.match('No such customer')) {
        res.status(400).json({ error: err.message });
        return;
      }

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

    if (amount === undefined) {
      res.status(422).json({ error: 'Charge amount as cents is required!' });
      return;
    }

    if (currency === undefined) {
      res.status(422).json({ error: 'Charge currency is required!' });
      return;
    }

    if (!validator.isNumeric(amount.toString())) {
      res.status(422).json({ error: 'Charge amount must be cents only!' });
      return;
    }

    if (currency.length > 3 || !currency.match(/([a-zA-Z]{3})/)) {
      res.status(422).json({ error: 'Charge currency is invalid!' });
      return;
    }

    stripe.charges.create({
      customer: customerToken,
      amount,
      currency,
    }).then((charge) => {
      if (charge.paid) {
        res.json({
          id: charge.id,
          customer: charge.customer,
          amount: charge.amount,
          currency: charge.currency,
          paid: charge.paid,
          created: charge.created,
        });
      } else {
        // FIXME
        throw Error.new('Handle when charge \'paid\' property is false!');
      }
    })
    .catch((err) => {
      res.status(422).json({ error: err });
    });
  });

  return router;
};
