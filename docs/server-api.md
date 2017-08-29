# REST API Summary

Request/response details in the [swagger.yml](swagger.yml) file

## Workflow example
```javascript
// (Javascript inspired pseudocode)

// create the app
app = request.post('/apps', appData);

// create an action
action = request.post(`/apps/${app.id}/actions`, actionData);

// create a trigger
trigger = request.post(`/apps/${app.id}/triggers`, triggerData);

// link the trigger with the action
handler = request.post(`/triggers/${trigger.id}/handlers/${action.id}`, handlerData);

// get the app with action and trigger linked
finalApp = request.get('/apps/${app.id}');

```

## Endpoints

All endpoints have a suffix of `/api/v2`

### Apps
- `GET /apps` - List all apps
- `POST /apps` - Create an app
- `GET /apps/{appId}` - Get an app [(See example)](#get-an-app)
- `PATCH /apps` - Update an app
- `DELETE /apps/{appId}` - Delete an app
- `GET /apps/{appId}/build` - Get an app binary
- `POST /apps:import` - Import an app from a flogo.json (Create an app with all its triggers and actions)
- `GET /apps/{appId}:export?type=application` - Export an app to a flogo.json (export an app with all its triggers and actions)
- `GET /apps/{appId}:export?type=flows` - Export an app's all flows to a flogo.json (export an app with all its actions only)
- `GET /apps/{appId}:export?type=flows&flowids=xyz,zef` - Export an app's selected flows to a flogo.json (export an app with selected actions only)

### Triggers
- `GET /apps/{appId}/triggers` - List all triggers in an app [(See example)](#list-all-triggers-in-an-app)
- `POST /apps/{appId}/triggers` - Create a new trigger in an app
- `PATCH /triggers/{triggerId}` - Update a trigger
- `DELETE /triggers/{triggerId}` - Delete a trigger

### Handlers
- `GET /triggers/{triggerId}/handlers` - List all handlers in a trigger
- `PUT /triggers/{triggerId}/handlers/{actionId}` - Link an action with a handler and/or modify the handler settings
- `DELETE /triggers/{triggerId}/handlers/{actionId}` - Remove a handler (Unlink an action from a handler)

### Actions (flows)
- `POST /apps/{appId}/actions` - Create a flow/action
- `GET /actions/{actionId}` - Get a flow/action [(See example)](#get-one-action-flow)
- `PATCH /actions/{actionId}` - Edit a flow
- `DELETE /actions/{actionId}` - Delete a flow
- `GET /actions/recent` - Get recent flows

### Contributions
TODO: upgrade contribs
- `GET /v1/api/triggers` - List all installed triggers applicable for MicroServices
- `POST /v1/api/triggers` - Install a trigger for MicroServices in engine
- `DELETE /v1/api/triggers` - Uninstall an installed trigger for MicroServices from engine
- `GET /v1/api/activities` - List all installed activities applicable for MicroServices
- `POST /v1/api/activities` - Install an activity for MicroServices in engine
- `DELETE /v1/api/activities` - Uninstall an installed activity for MicroServices from engine
- `GET /api/v2/contributions/devices` - List all installed contributions applicable for device profile
- `POST /api/v2/contributions/devices` - Install new contributions for device profile

### Services

Get info about dependency services

- `GET /services` - List all services
- `GET /services/{serviceName}/status` - Ping a service (test its status)

### Engine
TBA

### Flows tester
TBA

## Examples

### Get an app
Request: `GET /apps/{appId}`

Response
```json
{
  "id": "aXd345",
  "name": "myApp",
  "type": "flogo:app",
  "updatedAt": "017-07-14T01:00:00+01:00Z",
  "createdAt": "017-07-14T01:00:00+01:00Z",
  "version": "0.0.1",
  "description": "My flogo application description",
  "triggers": [
    {
      "id": "my_rest_trigger",
      "name": "My rest trigger",
      "description": "My trigger description",
      "updatedAt": "017-07-14T01:00:00+01:00Z",
      "createdAt": "017-07-14T01:00:00+01:00Z",
      "ref": "github.com/TIBCOSoftware/flogo-contrib/trigger/rest",
      "settings": {
        "port": "9233"
      },
      "handlers": [{
          "actionId": "my_simple_flow",
          "updatedAt": "017-07-14T01:00:00+01:00Z",
          "createdAt": "017-07-14T01:00:00+01:00Z",
          "settings": {
            "method": "GET",
            "path": "/test"
          },
          "outputs": {
            "...": {}
          }
      }]
  }
  ],
  "actions": [
    {
      "id": "my_simple_flow",
      "name": "My simple flow",
      "description": "A simple flow description",
      "ref": "github.com/TIBCOSoftware/flogo-contrib/incubator/flow",
      "updatedAt": "017-07-14T01:00:00+01:00Z",
      "createdAt": "017-07-14T01:00:00+01:00Z",
      "data": {
        "flow": {
          "attributes": [],
          "rootTask": {
            "id": 1,
            "tasks": [
              {
                "id": 2,
                "type": 1,
                "activityRef": "github.com/TIBCOSoftware/flogo-contrib/activity/log",
                "name": "log attr value",
                "description": "",
                "attributes": [
                ],
                "inputMappings": [
                  {
                    "type": 1,
                    "value": "{A2.value}",
                    "mapTo": "message"
                  }
                ]
              },
              {
                "id": 3,
                "type": 1,
                "activityRef": "github.com/TIBCOSoftware/flogo-contrib/activity/reply",
                "name": "reply",
                "description": "",
                "attributes": [
                  {
                    "name": "code",
                    "type": "integer",
                    "value": 201
                  }
                ]
              }
            ],
            "links": [
              {
                "id": 1,
                "type": 0,
                "name": "",
                "from": 2,
                "to": 3
              }
            ]
          }
        }
      }
    }
  ]
}
```

### List all triggers in an app

Request: `GET /apps/{appId}/triggers`

```json
{
  "data": [
    {
      "id": "my_rest_trigger",
      "name": "My rest trigger",
      "description": "My trigger description",
      "updatedAt": "017-07-14T01:00:00+01:00Z",
      "createdAt": "017-07-14T01:00:00+01:00Z",
      "ref": "github.com/TIBCOSoftware/flogo-contrib/trigger/rest",
      "settings": {
        "port": "9233"
      },
      "handlers": [{
        "actionId": "my_simple_flow",
        "updatedAt": "017-07-14T01:00:00+01:00Z",
        "createdAt": "017-07-14T01:00:00+01:00Z",
        "settings": {
          "method": "GET",
          "path": "/test"
        },
        "outputs": {
          "...": {}
        }
      }]
    }
  ]
 }
```

### Get one action/flow

Request: `GET /actions/{actionId}`

Empty flow, for example when just created:

```json
{
   "data": {
     "id": "my_simple_flow",
     "name": "My simple flow",
     "description": "A simple description",
     "ref": "github.com/TIBCOSoftware/flogo-contrib/incubator/flow",
     "updatedAt": "017-07-14T01:00:00+01:00Z",
     "createdAt": "017-07-14T01:00:00+01:00Z",
     "trigger": null,
     "handler": null,
     "data": { },
     "app": { },
     "appId": "aXedsx" 
   }
 }
```

Action with flow, trigger and handler:

```json
{
   "data": {
     "id": "my_simple_flow",
     "app": { },
     "appId": "aXedsx" ,
     "name": "My simple flow",
     "description": "A simple description",
     "ref": "github.com/TIBCOSoftware/flogo-contrib/incubator/flow",
     "updatedAt": "017-07-14T01:00:00+01:00Z",
     "createdAt": "017-07-14T01:00:00+01:00Z",
     "trigger": {
       "id": "my_rest_trigger",
       "name": "My rest trigger",
       "description": "My trigger description",
       "updatedAt": "017-07-14T01:00:00+01:00Z",
       "createdAt": "017-07-14T01:00:00+01:00Z",
       "ref": "github.com/TIBCOSoftware/flogo-contrib/trigger/rest",
       "settings": {
         "port": "9233"
       },
       "handlers": [{
         "actionId": "my_simple_flow",
         "updatedAt": "017-07-14T01:00:00+01:00Z",
         "createdAt": "017-07-14T01:00:00+01:00Z",
         "settings": {
           "method": "GET",
           "path": "/test"
         },
         "outputs": {
           "...": {}
         }
       }]
     },
     "handler": {
       "actionId": "my_simple_flow",
       "updatedAt": "017-07-14T01:00:00+01:00Z",
       "createdAt": "017-07-14T01:00:00+01:00Z",
       "settings": {
         "method": "GET",
         "path": "/test"
       },
       "outputs": {
         "...": {}
       }
     },
     "data": {
       "flow": {
         "attributes": [],
         "rootTask": {
           "id": 1,
           "tasks": [{
               "id": 2,
               "type": 1,
               "activityRef": "github.com/TIBCOSoftware/flogo-contrib/activity/log",
               "name": "log attr value",
               "description": "",
               "attributes": [],
               "inputMappings": [{
                 "type": 1,
                 "value": "{A2.value}",
                 "mapTo": "message"
               }]
             },
             {
               "id": 3,
               "type": 1,
               "activityRef": "github.com/TIBCOSoftware/flogo-contrib/activity/reply",
               "name": "reply",
               "description": "",
               "attributes": [{
                 "name": "code",
                 "type": "integer",
                 "value": 201
               }]
             }
           ],
           "links": [{
             "id": 1,
             "type": 0,
             "name": "",
             "from": 2,
             "to": 3
           }]
         }
       }
     }
   }
 }
```