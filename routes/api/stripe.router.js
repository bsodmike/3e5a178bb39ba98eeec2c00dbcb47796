const stripe = require('stripe')(process.env.STRIPE_KEY);

// const util = require('util');

module.exports = (app, router) => {
  router.post('/customers', (req, res) => {
    const data = req.body;

    if (data.email === undefined) {
      res.status(422).json({ error: 'Required parameter missing!' });
      return;
    }

    const customerEmail = data.email;
    let description;

    // FIXME validate email

    if (data.description !== undefined) {
      description = data.description;
    }

    stripe.customers.create({
      email: customerEmail,
      description,
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
