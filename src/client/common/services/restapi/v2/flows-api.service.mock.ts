import {Injectable} from "@angular/core";
import {APIFlowsService} from "./flows-api.service";

@Injectable()
export class MockAPIFlowsService extends APIFlowsService{
  mockFlowDetails = {
    "id": "test_flow_1",
    "name": "Test flow 1",
    "description": "Hello world!!",
    "app": {
      "id": "e9712c97-4a9e-4e95-b815-33204ba1fb3a",
      "name": "Sample Application",
      "normalizedName": "sample-application",
      "version": "",
      "description": "",
      "createdAt": "2017-03-21T09:43:38.614Z",
      "updatedAt": "2017-03-21T09:43:53.073Z"
    },
    "trigger": {
      "id": "trigger_request",
      "name": "Trigger Request",
      "ref": "github.com/TIBCOSoftware/flogo-contrib/trigger/timer",
      "settings": {},
      "handlers": [
        {
          "settings": {
            "repeating": null,
            "startDate": null,
            "hours": null,
            "minutes": "5",
            "seconds": null
          },
          "actionId": "test_flow_1"
        }
      ]
    },
    "handlers": {
      "settings": {
        "repeating": null,
        "startDate": null,
        "hours": null,
        "minutes": "5",
        "seconds": null
      },
      "actionId": "test_flow_1"
    },
    "ref": "github.com/TIBCOSoftware/flogo-contrib/action/flow",
    "data": {
      "flow": {
        "type": 1,
        "attributes": [],
        "rootTask": {
          "id": 1,
          "type": 1,
          "activityRef": "",
          "name": "root",
          "tasks": [
            {
              "id": 2,
              "name": "First Log",
              "activityRef": "github.com/TIBCOSoftware/flogo-contrib/activity/log",
              "type": 1,
              "attributes": [
                {
                  "name": "message",
                  "value": "I am here 1",
                  "type": "string"
                },
                {
                  "name": "flowInfo",
                  "value": "true",
                  "type": "boolean"
                },
                {
                  "name": "addToFlow",
                  "value": "true",
                  "type": "boolean"
                }
              ]
            },
            {
              "id": 3,
              "name": "Counter1",
              "activityRef": "github.com/TIBCOSoftware/flogo-contrib/activity/counter",
              "type": 1,
              "attributes": [
                {
                  "name": "counterName",
                  "value": "counter1",
                  "type": "string"
                },
                {
                  "name": "increment",
                  "value": "true",
                  "type": "boolean"
                },
                {
                  "name": "reset",
                  "value": false,
                  "type": "boolean"
                }
              ]
            },
            {
              "id": 4,
              "name": "Second Log",
              "activityRef": "github.com/TIBCOSoftware/flogo-contrib/activity/log",
              "type": 1,
              "attributes": [
                {
                  "name": "message",
                  "value": "I am here 2",
                  "type": "string"
                },
                {
                  "name": "flowInfo",
                  "value": "true",
                  "type": "boolean"
                },
                {
                  "name": "addToFlow",
                  "value": "true",
                  "type": "boolean"
                }
              ]
            },
            {
              "id": 5,
              "name": "Third Log",
              "activityRef": "github.com/TIBCOSoftware/flogo-contrib/activity/log",
              "type": 1,
              "attributes": [
                {
                  "name": "message",
                  "value": "I am here 3",
                  "type": "string"
                },
                {
                  "name": "flowInfo",
                  "value": "true",
                  "type": "boolean"
                },
                {
                  "name": "addToFlow",
                  "value": "true",
                  "type": "boolean"
                }
              ]
            }
          ],
          "links": [
            {
              "id": 1,
              "from": 2,
              "to": 3,
              "type": 0
            },
            {
              "id": 2,
              "from": 3,
              "to": 4,
              "type": 1,
              "value": "true"
            },
            {
              "id": 3,
              "from": 3,
              "to": 5,
              "type": 1,
              "value": "false"
            }
          ]
        }
      }
    }
  };

  getFlow(flowId: string){
    return Promise.resolve(this.mockFlowDetails);
  }
}
