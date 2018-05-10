# Validation

Each validator should follow the convention:
- if the validation passes (i.e. no errors found) it should return `null`
- if the validation fails it should return an object where the keys represent the failed constraint and the values are 
  any additional information for the failed constraint.

For example when the required constraint is not met the "required validator returns:
```
{
  required: true
}
```

Another validator could return as error:

```
{
  max: {
    maxExpected: 10,
    actual: 20
  }
}
```

All the errors reported by the validators will be finally gathered into a single object, if the validation passed
then the corresponding key won't be in the result object.
For example:

```
{
  required: true,
  max: {
    maxExpected: 10,
    actual: 20
  }
}
```


# Adding new validators

Register new validators in`./attribute-validators/validator-resolvers`.

A validator resolver takes an attribute definition and returns a validator function only if the validator should be applied.  
