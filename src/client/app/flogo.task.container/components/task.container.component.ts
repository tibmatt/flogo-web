import {Component, Input, DynamicComponentLoader, ElementRef, Injectable} from 'angular2/core';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {FlogoTaskFieldStringComponent} from '../../flogo.task.field/components/field-string.component'

@Component({
  selector: 'flogo-task-container',
  inputs:['configuration'],
  moduleId: module.id,
  templateUrl: 'task.container.tpl.html',
  directives: [ROUTER_DIRECTIVES]
})

export class FlogoTaskContainerComponent{

  constructor(public dcl: DynamicComponentLoader, public elefRef:ElementRef) {
  }

  ngOnInit() {
    this.dcl.loadIntoLocation(FlogoTaskFieldStringComponent, this.elefRef, 'controls');
  }
}
