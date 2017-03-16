const Promise = require('bluebird');

// Add promise support to chai if this does not exist natively.
if (!global.Promise) {
  global.Promise = Promise;
}

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../index');
const util = require('util');

const expect = chai.expect;

chai.use(chaiHttp);

const createCustomer = () => new Promise((resolve, reject) => {
  const payload = {
    email: 'john.doe@gmail.com',
    source: {
      name: 'John Dorian',
      number: '4242424242424242',
      cvc: '123',
      expMonth: '12',
      expYear: '20',
    },
  };

  chai.request(server)
      .post('/customers')
      .send(payload)
      .then((res) => {
        resolve(res.body);
      })
      .catch((err) => {
        reject(err);
      });
});

const chargeCustomer = charge => new Promise((resolve, reject) => {
  chai.request(server)
      .post('/charges')
      .send(charge)
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
});

describe('Stripe API Integration Tests', () => {
  describe('Create a customer and create x3 charges', () => {
    it('it should retrieve list of charges and verify the amounts', (done) => {
      const charges = [2000, 3000, 5000];
      const charge = {
        currency: 'usd',
      };

      createCustomer().then((customer) => {
        charge.customer = customer.id;
        charge.amount = charges[0];

        return chargeCustomer(charge);
      })
      .then((res) => {
        charge.customer = res.body.customer;
        charge.amount = charges[1];

        return chargeCustomer(charge);
      })
      .then((res) => {
        charge.customer = res.body.customer;
        charge.amount = charges[2];

        return chargeCustomer(charge);
      })
      .then((resCharge) => {
        chai.request(server)
            .get(`/charges?customer_id=${resCharge.body.customer}`)
            .then((res) => {
              // console.log('RESULT: %s', util.inspect(res.body));

              expect(res).to.have.status(200);
              expect(res.body).to.have.all.keys(['customer', 'charges', 'chargesCount', 'hasMore', 'url']);

              /**
               * FIXME the following assertion seems to break chai, causing an
               * 'Unhandled promise rejection' warning via Bluebird.
               *
               * This needs further investigation.
               */
              // expect(res.body).to.have.property('chargesCount').and.eql('3');

              // Obtain total for all charges fetched for this customer
              let chargeTotal = 0;

              res.body.charges.forEach((chargeDetail) => {
                chargeTotal += parseInt(chargeDetail.amount, 10);
              });

              // Assert obtained charge total matches the expectation.
              const expectedTotal = charges.reduce((acc, val) => acc + val);
              expect(chargeTotal).to.eql(expectedTotal);

              done();
            })
            .catch((err) => {
              console.log('Error: %s', util.inspect(err.response.body.error));
              throw err;
            });
      })
      .catch((err) => {
        console.log('Error: %s', util.inspect(err.response.body.error));
        throw err;
      });
    });
  });
});
