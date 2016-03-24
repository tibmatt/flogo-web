import {Component} from 'angular2/core';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {FlogoTaskContainerComponent} from '../../flogo.task.container/components/task.container.component';

@Component({
  selector: 'flogo-task',
  moduleId: module.id,
  templateUrl: 'task.tpl.html',
  directives: [ROUTER_DIRECTIVES, FlogoTaskContainerComponent]
})

export class FlogoTaskComponent{
  configuration: any;

  ngOnInit() {

    this.configuration = [
      {
        "name": "petName",
        "type": "string"
      },
      {
        "name": "age",
        "type": "number"
      }
    ];

  }

}
