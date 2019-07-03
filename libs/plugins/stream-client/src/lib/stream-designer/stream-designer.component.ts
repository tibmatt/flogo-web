import { Component, OnInit } from '@angular/core';
import { ActivatedResourceRoute } from '@flogo-web/lib-client/core';

@Component({
  selector: 'flogo-stream-designer',
  templateUrl: './stream-designer.component.html',
  styleUrls: ['./stream-designer.component.less'],
})
export class StreamDesignerComponent implements OnInit {
  // todo: making it public for demo only
  constructor(public activatedResource: ActivatedResourceRoute) {}

  ngOnInit() {}
}
