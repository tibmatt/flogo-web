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
  task: any;

  ngOnInit() {

    this.task = {
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
          "type": "number"
        },
        {
          "name": "password",
          "title": "Password",
          "description": "Password",
          required: true,
          validation: "",
          "validationMessage": "",
          "type": "boolean"
        },
        {
          "name": "query",
          "title": "Query",
          "description": "Query",
          required: true,
          validation: "",
          "validationMessage": "",
          "type": "object"
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

}
