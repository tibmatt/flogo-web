import { Component, Input, OnInit } from '@angular/core';
import { FlowMetadata } from '../models';

@Component({
  selector: 'flogo-flows-detail-flow-schema',
  styleUrls: ['flow-schema.component.less'],
  templateUrl: 'flow-schema.component.html'
})

export class FlowSchemaComponent implements OnInit {
  @Input()
  flowMetadata: FlowMetadata;

  constructor() {
  }

  ngOnInit() {
  }
}

