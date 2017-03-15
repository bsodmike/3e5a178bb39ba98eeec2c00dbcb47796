const stripe = require('stripe')(process.env.STRIPE_KEY);

// const util = require('util');

module.exports = (app, router) => {
  router.post('/customers', (req, res) => {
    const customerEmail = req.body.email;

    // FIXME validate email

    stripe.customers.create({
      email: customerEmail,
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
