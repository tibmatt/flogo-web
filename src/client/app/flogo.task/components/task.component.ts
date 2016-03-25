import {Component} from 'angular2/core';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {FlogoTaskContainerComponent} from '../../flogo.task.container/components/task.container.component';

@Component({
  selector: 'flogo-task',
  styleUrls: ['task.css'],
  moduleId: module.id,
  templateUrl: 'task.tpl.html',
  directives: [ROUTER_DIRECTIVES, FlogoTaskContainerComponent]
})

export class FlogoTaskComponent{
  schema: any;
  stateData: any;

  getStateData() {

    return {
      "name": "Find User",
      "tasks": [
        {
          "name": "tibco-routing",
          "inputs": [
            {
              "name": "serverName",
              "value": "185.422.134.16"
            },
            {
              "name": "userName",
              "value": "admin"
            },
            {
              "name": "password",
              "value": "1234"
            },
            {
              "name": "query",
              "value": "select user_id where privileges != 'admin'"
            }
          ],
          "outputs": [
            {
              "name": "queryStatus",
              "value": "success"
            }
          ]
        }
      ]
    }

  }



  getSchema() {

    return {
      "name": "tibco-routing",
      "version": "0.1.0",
      "description": "Routing your request",
      title: "TIBCO Routing",
      inputs: [
        {
          "name": "serverName",
          "title": "Server name",
          "description": "Server name",
          "required": true,
          "validation": "",
          "validationMessage": "",
          "type": "string"
        },
        {
          "name": "userName",
          "title": "User name",
          "description": "User name",
          required: true,
          validation: "",
          "validationMessage": "",
          "type": "string"
        },
        {
          "name": "password",
          "title": "Password",
          "description": "Password",
          required: true,
          validation: "",
          "validationMessage": "",
          "type": "string"
        },
        {
          "name": "query",
          "title": "Query",
          "description": "Query",
          required: true,
          validation: "",
          "validationMessage": "",
          "type": "string"
        }
      ],
      outputs: [
        {
          "name": "queryStatus",
          "title": "Query status",
          "description": "Query status",
          required: true,
          validation: "",
          "validationMessage": "",
          "type": "string"
        }
      ]
    };

  }

  ngOnInit() {
    this.schema = this.getSchema();
    this.stateData = this.getStateData();
  }

}
