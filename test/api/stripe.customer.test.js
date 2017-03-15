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

describe('Stripe API Tests', () => {
  describe('POST /customers', () => {
    it('it should return response with my Stripe customer details', (done) => {
      const payload = {
        email: 'john.doe@gmail.com',
      };
      chai.request(server)
          .post('/customers')
          .send(payload)
          .then((res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.have.all.keys(['id', 'email', 'created', 'accountBalance']);
            done();
          })
          .catch((err) => {
            throw err;
          });
    });
  });
});
