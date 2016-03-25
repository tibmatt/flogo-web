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
      "name": "tibco-log",
      "version": "0.1.0",
      "description": "Log  your message to console",
      title: "TIBCO Log",
      inputs: [
        {
          "name": "petName",
          "title": "Pet name",
          "description": "The full name of the pet",
          "required": true,
          "validation": "",
          "validationMessage": "",
          "type": "string"
        },
        {
          "name": "age",
          "title": "Age",
          "description": "The current pet's age",
          required: true,
          validation: "",
          "validationMessage": "",
          "type": "number"
        },
        {
          "name": "brave",
          "title": "Is brave?",
          "description": "If the pet is brave",
          required: true,
          validation: "",
          "validationMessage": "",
          "type": "boolean"
        },
        {
          "name": "configuration",
          "title": "Configuration",
          "description": "Configuration of the pet",
          required: true,
          validation: "",
          "validationMessage": "",
          "type": "object"
        }

      ]
    };
  }

}
