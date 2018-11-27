import { Component, Input } from '@angular/core';
import { FlowMetadata } from '@flogo-web/client/core/interfaces';

@Component({
  selector: 'flogo-flow-params-schema-button',
  styleUrls: ['button.component.less'],
  templateUrl: 'button.component.html'
})

export class ButtonComponent {
  @Input()
  flowMetadata: FlowMetadata;
}

