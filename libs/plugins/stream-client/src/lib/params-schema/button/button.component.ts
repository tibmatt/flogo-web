import { Component, Input } from '@angular/core';
import { Metadata } from '@flogo-web/core';

@Component({
  selector: 'flogo-stream-params-schema-button',
  styleUrls: ['button.component.less'],
  templateUrl: 'button.component.html',
})
export class ButtonComponent {
  @Input()
  flowMetadata: Metadata;
}
