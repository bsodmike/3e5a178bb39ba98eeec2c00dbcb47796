# bsodmike-billing-task

## API

The RESTful API exposed in this app is documented below.  For the purpose of this task, this API remains 'unsecured'.  Any production use, should implement token-authentication, and include other basic-safeguards such as CORS/CSRF protection via modules such as `helmet` or `lusca`.

### POST /customers

This end-point expects a JSON payload with the following required keys:

```
{
    // required

    email:  'john.dorian@cia.gov',
    
    // optional
    // An arbitrary string that you can attach to a customer object
    description: 'New Customer',
    
    // A set of key/value pairs that you can attach to a customer object
    meta_data: { }
}
```

Any failure will return a `422` status with error details as the JSON response. 