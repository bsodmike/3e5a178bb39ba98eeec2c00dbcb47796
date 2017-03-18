const Promise = require('bluebird');

// Add promise support to chai if this does not exist natively.
if (!global.Promise) {
  global.Promise = Promise;
}

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../index');

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

describe('Stripe API Tests', () => {
  describe('GET /charges', () => {
    it('should return response with list of Stripe charges for supplied customer', () => {
      const charge = {
        currency: 'usd',
        amount: 2000,
      };

      return createCustomer().then((customer) => {
        charge.customer = customer.id;

        return chargeCustomer(charge);
      })
      .then(resCharge =>
        chai.request(server)
            .get(`/charges?customer_id=${resCharge.body.customer}`)
            .then((res) => {
              expect(res).to.have.status(200);
              expect(res.body).to.have.all.keys(['customer', 'charges', 'chargesCount', 'hasMore', 'url']);
            })
      );
    });

    describe('Without customer token', () => {
      it('should return 422 with error JSON', (done) => {
        chai.request(server)
            .get('/charges')
            .then(() => {})
            .catch((err) => {
              expect(err).to.have.status(422);
              expect(err.response.body.error).to.eql('Required parameter missing!');
              done();
            });
      });
    });

    describe('With invalid customer token', () => {
      it('it should return 400 with error JSON', (done) => {
        chai.request(server)
            .get('/charges?customer_id=YOLO')
            .then(() => {})
            .catch((err) => {
              expect(err).to.have.status(400);
              expect(err.response.body.error).to.eql('No such customer: YOLO');
              done();
            });
      });
    });
  });

  describe('POST /charges', () => {
    it('should return response with my Stripe charge details', () => {
      const charge = {
        currency: 'usd',
        amount: 2000,
      };

      return createCustomer().then((customer) => {
        charge.customer = customer.id;

        return chargeCustomer(charge);
      })
      .then((res) => {
        const chargeResult = res.body;

        expect(res).to.have.status(200);
        expect(chargeResult.paid).to.eql(true);
        expect(chargeResult).to.have.all.keys(['id', 'customer', 'amount', 'currency', 'created', 'paid']);
      });
    });

    describe('Excluding required param for Customer token', () => {
      it('should return 422 with error JSON', (done) => {
        const charge = {
          currency: 'usd',
          amount: 2000,
        };

        chai.request(server)
            .post('/charges')
            .send(charge)
            .then(() => {})
            .catch((err) => {
              expect(err).to.have.status(422);
              expect(err.response.body.error).to.eql('Customer token is required!');
              done();
            });
      });
    });

    describe('Excluding required param for charge currency', () => {
      it('should return 422 with error JSON', (done) => {
        const charge = {
          customer: 'token',
          amount: 2000,
        };

        chai.request(server)
            .post('/charges')
            .send(charge)
            .then(() => {})
            .catch((err) => {
              expect(err).to.have.status(422);
              expect(err.response.body.error).to.eql('Charge currency is required!');
              done();
            });
      });
    });

    describe('Excluding required param for charge amount', () => {
      it('should return 422 with error JSON', (done) => {
        const charge = {
          customer: 'token',
          currency: 'usd',
        };

        chai.request(server)
            .post('/charges')
            .send(charge)
            .then(() => {})
            .catch((err) => {
              expect(err).to.have.status(422);
              expect(err.response.body.error).to.eql('Charge amount as cents is required!');
              done();
            });
      });
    });

    describe('With non-cents amount for purchase', () => {
      it('should return 422 with error JSON', (done) => {
        const charge = {
          customer: 'token',
          currency: 'usd',
          amount: '123.11',
        };

        chai.request(server)
            .post('/charges')
            .send(charge)
            .then(() => {})
            .catch((err) => {
              expect(err).to.have.status(422);
              expect(err.response.body.error).to.eql('Charge amount must be cents only!');
              done();
            });
      });
    });

    describe('With invalid amount for purchase', () => {
      it('should return 422 with error JSON', (done) => {
        const charge = {
          customer: 'token',
          currency: 'usd',
          amount: 'NEEGAN_WUZ_HERE',
        };

        chai.request(server)
            .post('/charges')
            .send(charge)
            .then(() => {})
            .catch((err) => {
              expect(err).to.have.status(422);
              expect(err.response.body.error).to.eql('Charge amount must be cents only!');
              done();
            });
      });
    });

    describe('With invalid purchase currency', () => {
      it('should return 422 with error JSON', (done) => {
        const charge = {
          customer: 'token',
          currency: 'CAKE',
          amount: '2000',
        };

        chai.request(server)
            .post('/charges')
            .send(charge)
            .then(() => {})
            .catch((err) => {
              expect(err).to.have.status(422);
              expect(err.response.body.error).to.eql('Charge currency is invalid!');
              done();
            });
      });
    });
  });
});
