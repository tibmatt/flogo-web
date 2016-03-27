import {Component} from 'angular2/core';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {FlogoTaskContainerComponent} from '../../flogo.task.container/components/task.container.component';
import {BehaviorSubject} from 'rxjs/Rx';

@Component({
  selector: 'flogo-task',
  styleUrls: ['task.css'],
  moduleId: module.id,
  templateUrl: 'task.tpl.html',
  directives: [ROUTER_DIRECTIVES, FlogoTaskContainerComponent]
})

export class FlogoTaskComponent{
  modifiedState: any;
  inputSchema: string;
  inputState: string;
  inputSchemaSubject: any;
  inputStateSubject: any;
  modifiedStateSubject: any;

  getStateData() {
    return {};
  }

  getSchema() {
    return {};
  }

  stringify(json:any) {
    return JSON.stringify(json, null, 2);
  }

  changeInputSchema(event:any) {
    this.inputSchemaSubject.next(event.value);
  }

  changeInputState(event:any) {
    this.inputStateSubject.next(event.value);
  }

  ngOnInit() {
    this.inputSchema = this.stringify(this.getSchema());
    this.inputState  = this.stringify(this.getStateData());

    this.inputSchemaSubject = new BehaviorSubject(this.inputSchema);
    this.inputStateSubject  = new BehaviorSubject(this.inputState);
    this.modifiedStateSubject  = new BehaviorSubject({});

    this.modifiedStateSubject.subscribe(
      (value:any) => {
        this.modifiedState = JSON.stringify(value, null, 2);
      }

    );
  }

  onGetModifiedState(state:any) {
  }

}
