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

    describe('Including optional description', () => {
      it('it should return response with my Stripe customer details', (done) => {
        const payload = {
          email: 'john.doe@gmail.com',
          description: 'New customer',
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

    describe('Including optional metadata', () => {
      it('it should return response with my Stripe customer details', (done) => {
        const payload = {
          email: 'john.doe@gmail.com',
          metaData: {
            mobileOS: 'android',
            device: 'tablet',
          },
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

    describe('Excluding required param', () => {
      it('it should return 422 with error JSON', (done) => {
        const payload = {};
        chai.request(server)
            .post('/customers')
            .send(payload)
            .then(() => {})
            .catch((err) => {
              expect(err).to.have.status(422);
              expect(err.response.body.error).to.eql('Required parameter missing!');
              done();
            });
      });
    });

    describe('With invalid email', () => {
      it('it should return 422 with error JSON', (done) => {
        const payload = {
          email: '<script src="http://hax0r.js"></script>',
        };
        chai.request(server)
            .post('/customers')
            .send(payload)
            .then(() => {})
            .catch((err) => {
              expect(err).to.have.status(422);
              expect(err.response.body.error).to.eql('Required parameter has invalid format!');
              done();
            });
      });
    });
  });
});
