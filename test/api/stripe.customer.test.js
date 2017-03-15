const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../index');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Stripe API Tests', () => {
  describe('POST /customers', () => {
    it('it should return response with my Stripe customer details', (done) => {
      const payload = {};
      chai.request(server)
          .post('/customers')
          .send(payload)
          .end((err, res) => {
            console.log('Error: %s', err);
            expect(res).to.have.status(200);
            done();
          });
    });
  });
});
