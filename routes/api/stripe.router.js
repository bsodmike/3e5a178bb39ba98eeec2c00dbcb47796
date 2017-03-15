const stripe = require('stripe')(process.env.STRIPE_KEY);

const validator = require('validator');

// const util = require('util');

module.exports = (app, router) => {
  router.post('/customers', (req, res) => {
    const data = req.body;
    const customerEmail = data.email;
    let description;
    let metaData;

    if (data.email === undefined) {
      res.status(422).json({ error: 'Required parameter missing!' });
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
    }).then((customer) => {
      res.json({
        id: customer.id,
        email: customer.email,
        created: customer.created,
        accountBalance: customer.account_balance,
      });
    }).catch((err) => {
      res.status(422).json({ error: err });
    });
  });

  return router;
};
