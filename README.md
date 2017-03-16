# bsodmike-billing-task

## Setup

Run `npm install -g yarn && yarn` in the app root.  Then run `npm test`.

This was tested with `node v6.9.4`.

## API

The RESTful API exposed in this app is documented below.  For the purpose of this task, this API remains 'unsecured'.  Any production use, should implement token-authentication, and include other basic-safeguards such as CORS/CSRF protection via modules such as `helmet` or `lusca`.

### POST /customers
Stripe purchases are typically made using `stripe.js` in the browser to obtain a token for the purchase card details; where this token is passed to internal APIs to process the actual charge.

However, the rules of this task state that only 3-API end-points are 'exposed', and since all end-points are public, I did not create a 4th end-point so as to obtain a customer given the customer token &mdash; although I could have done so, and made that a token-authenticated URI only, but I did not want to risk breaking the previously mentioned rule.

Therefore, creating a customer requires the card details to be passed as well.  This end-point expects a JSON payload with the following required details:

```
{
    // required
    email:  'john.dorian@cia.gov',
    source: {
      name: 'John Dorian',
      number: '4242424242424242',
      cvc: '123',
      expMonth: '12',
      expYear: '20',
    }

    // optional
    // An arbitrary string that you can attach to a customer object
    description: 'New Customer',

    // A set of key/value pairs that you can attach to a customer object
    meta_data: { }
}
```

Any failure will return a `422` status with error details as the JSON response.

### POST /charges

This end-point expects a JSON payload with the following required details:

```
{
    // required
    // The customer token
    customer: 'cus_AIBgNxPoMy8ITG',

    currency: 'usd',

    // amount in cents; string is also fine.
    amount: 2000,
}
```

Any failure will return a `422` status with error details as the JSON response.

### GET /charges?customer_id=\<id\>

This end-point requires a `customer_id` param.

If this param is missing the response will be a `422` status; however, if this is invalid, the response will be `400` with the error message returned in the response body.

## Improvements

* Split up the `api/stripe.router.js` into separate files, one for customers and one for charges.
* Use [`apidocjs`](http://apidocjs.com/) to maintain API docs (or an alternative).

## Stories

Here's the output of `npm test`, during my last run:

```
mdesilva@MacBook-Pro-15-inch [09:10:41] work/manageflitter-billing-task {2.2.3} ⭠ master±
-> % npm test                                                                                        1 ↵

> @ test /Users/mdesilva/work/manageflitter-billing-task
> NODE_ENv=test && mocha --recursive --timeout=10000



✓ App is running at http://localhost:3000 in development mode
  Press CTRL-C to stop

  Stripe API Tests
    GET /charges
      ✓ it should return response with list of Stripe charges for supplied customer (4283ms)
      Without customer token
        ✓ it should return 422 with error JSON
      With invalid customer token
        ✓ it should return 400 with error JSON (1203ms)
    POST /charges
      ✓ it should return response with my Stripe charge details (2446ms)
      Excluding required param for Customer token
        ✓ it should return 422 with error JSON
      Excluding required param for charge currency
        ✓ it should return 422 with error JSON
      Excluding required param for charge amount
        ✓ it should return 422 with error JSON
      With non-cents amount for purchase
        ✓ it should return 422 with error JSON
      With invalid amount for purchase
        ✓ it should return 422 with error JSON
      With invalid purchase currency
        ✓ it should return 422 with error JSON

  Stripe API Tests
    POST /customers
      ✓ it should return response with my Stripe customer details (1092ms)
      Including optional description
        ✓ it should return response with my Stripe customer details (1066ms)
      Including optional metadata
        ✓ it should return response with my Stripe customer details (1082ms)
      Excluding required param for email
        ✓ it should return 422 with error JSON
      Excluding required param for payment source
        ✓ it should return 422 with error JSON
      With invalid email
        ✓ it should return 422 with error JSON

  Stripe API Integration Tests
    Create a customer and create x3 charges
      ✓ it should retrieve list of charges and verify the amounts (6022ms)

  eslint

/Users/mdesilva/work/manageflitter-billing-task/index.js
  17:3  warning  Unexpected console statement  no-console
  18:3  warning  Unexpected console statement  no-console
  21:5  warning  Unexpected console statement  no-console

/Users/mdesilva/work/manageflitter-billing-task/routes/api/stripe.router.js
  57:7  warning  Unexpected console statement  no-console

/Users/mdesilva/work/manageflitter-billing-task/test/api/stripe.charges.test.js
   75:15  warning  Unexpected console statement  no-console
   80:9   warning  Unexpected console statement  no-console
  134:9   warning  Unexpected console statement  no-console

/Users/mdesilva/work/manageflitter-billing-task/test/api/stripe.integration.test.js
  109:15  warning  Unexpected console statement  no-console
  114:9   warning  Unexpected console statement  no-console

✖ 9 problems (0 errors, 9 warnings)

    ✓ should have no errors in ./ (1107ms)


  18 passing (22s)
```

## Submission

The repo name was generated as a MD5 hash as per the requirements

```
-> % echo "bsodmike-billing-task" | openssl md5
3e5a178bb39ba98eeec2c00dbcb47796
```
