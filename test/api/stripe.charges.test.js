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

describe('Stripe API Tests', () => {
  describe('GET /charges', () => {
    it('it should return response with list of Stripe charges for supplied customer', (done) => {
      chai.request(server)
          .get('/charges?customer_id=cus_AIBgNxPoMy8ITG')
          .then((res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.have.all.keys(['customer', 'charges', 'chargesCount', 'hasMore', 'url']);

            done();
          })
          .catch((err) => {
            console.log('Error: %s', util.inspect(err.response.body.error));
            throw err;
          });
    });

    describe('Without customer token', () => {
      it('it should return 422 with error JSON', (done) => {
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
    it('it should return response with my Stripe charge details', (done) => {
      const charge = {
        customer: 'cus_AIBgNxPoMy8ITG',
        currency: 'usd',
        amount: 2000,
      };

      chai.request(server)
          .post('/charges')
          .send(charge)
          .then((res) => {
            const chargeResult = res.body;

            expect(res).to.have.status(200);
            expect(chargeResult.paid).to.eql(true);
            expect(chargeResult).to.have.all.keys(['id', 'customer', 'amount', 'currency', 'created', 'paid']);

            done();
          })
          .catch((err) => {
            console.log('Error: %s', util.inspect(err.response.body.error));
            throw err;
          });
    });

    describe('Excluding required param for Customer token', () => {
      it('it should return 422 with error JSON', (done) => {
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
      it('it should return 422 with error JSON', (done) => {
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
      it('it should return 422 with error JSON', (done) => {
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
      it('it should return 422 with error JSON', (done) => {
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
      it('it should return 422 with error JSON', (done) => {
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
      it('it should return 422 with error JSON', (done) => {
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
