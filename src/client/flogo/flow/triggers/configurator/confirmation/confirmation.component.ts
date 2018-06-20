import { Component } from '@angular/core';
import { ConfirmationControl } from './confirmation-control';

@Component({
  selector: 'flogo-triggers-configuration-settings-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.less']
})
export class ConfirmationComponent {
  constructor(public control: ConfirmationControl) {}
}
