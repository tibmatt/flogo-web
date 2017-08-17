# Important JSON structures

## Things to remember
- The actions as per flogo engine are also known as "flows" in flogo-web
- The diagram component in flow designer page depends on a different JSON structure rather than the normal action's JSON structure. So we depend on a ui-model-converter service which will convert the acion's JSON to the required format 

## Action's "name" property in Application JSON
As per flogo engine the name property of actions are not mandatory and are to be placed in the following path:
```
"actions": [
    {
      "id": "test_flow",
      "ref": "github.com/TIBCOSoftware/flogo-contrib/action/flow",
      "data": {
        "flow": {
          "name": "Test Flow",  <--- Here
          "type": 1,
          "attributes": [],
          "rootTask": {
            "id": 1,
            ...
          }
        }
      }
    }
  ]
```

But flogo-web required the flow names at the action's root definition as follows:
```
"actions": [
    {
      "id": "test_flow",
      "ref": "github.com/TIBCOSoftware/flogo-contrib/action/flow",
      "name": "Test Flow",  <--- Here
      "data": {
        "flow": {
          "type": 1,
          "attributes": [],
          "rootTask": {
            "id": 1,
            ...
          }
        }
      }
    }
  ]
```
For this reason, when user imports an application we will set the action's name at it's root level taking the priority as follows:
1. `/data/flow/name`
2. `/name`
3. `/id` (A case where the name is not set for an action. We will set the name with id of the action)

When user exports an application we will move the `name` attribute from root level to the `data.flow` level. 