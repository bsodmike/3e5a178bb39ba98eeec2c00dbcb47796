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
    it('should return response with my Stripe customer details', () => {
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

      return chai.request(server)
          .post('/customers')
          .send(payload)
          .then((res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.have.all.keys(['id', 'email', 'created', 'accountBalance']);
          });
    });

    describe('Including optional description', () => {
      it('should return response with my Stripe customer details', () => {
        const payload = {
          email: 'john.doe@gmail.com',
          description: 'New customer',
          source: {
            name: 'John Dorian',
            number: '4242424242424242',
            cvc: '123',
            expMonth: '12',
            expYear: '20',
          },
        };

        return chai.request(server)
            .post('/customers')
            .send(payload)
            .then((res) => {
              expect(res).to.have.status(200);
              expect(res.body).to.have.all.keys(['id', 'email', 'created', 'accountBalance']);
            });
      });
    });

    describe('Including optional metadata', () => {
      it('should return response with my Stripe customer details', () => {
        const payload = {
          email: 'john.doe@gmail.com',
          metaData: {
            mobileOS: 'android',
            device: 'tablet',
          },
          source: {
            name: 'John Dorian',
            number: '4242424242424242',
            cvc: '123',
            expMonth: '12',
            expYear: '20',
          },
        };

        return chai.request(server)
            .post('/customers')
            .send(payload)
            .then((res) => {
              expect(res).to.have.status(200);
              expect(res.body).to.have.all.keys(['id', 'email', 'created', 'accountBalance']);
            });
      });
    });

    describe('Excluding required param for email', () => {
      it('should return 422 with error JSON', (done) => {
        const payload = {
          source: {},
        };
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

    describe('Excluding required param for payment source', () => {
      it('should return 422 with error JSON', (done) => {
        const payload = {
          email: 'john@doe.com',
        };
        chai.request(server)
            .post('/customers')
            .send(payload)
            .then(() => {})
            .catch((err) => {
              expect(err).to.have.status(422);
              expect(err.response.body.error).to.eql('Required parameter for payment source is missing!');
              done();
            });
      });
    });

    describe('With invalid email', () => {
      it('should return 422 with error JSON', (done) => {
        const payload = {
          email: '<script src="http://hax0r.js"></script>',
          source: {},
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
