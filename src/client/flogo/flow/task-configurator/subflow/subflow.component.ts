import {Component, Input, OnInit} from '@angular/core';


@Component({
  selector: 'flogo-flow-task-configurator-subflow',
  templateUrl: 'subflow.component.html',
  styleUrls: ['subflow.component.less'],
})

export class SubFlowComponent implements OnInit {
  @Input() subFlowConfig;
  subFlowId;
  subFlowname;
  subFlowDescription;
  subFlowCreatedAt;

  ngOnInit() {
    this.initSubflowConfiguration();
  }


  private initSubflowConfiguration() {
    this.subFlowname = this.subFlowConfig.name;
    this.subFlowDescription = this.subFlowConfig.description;
    this.subFlowCreatedAt = this.subFlowConfig.createdAt;
    this.subFlowId = this.subFlowConfig.flowRef;
  }
}

