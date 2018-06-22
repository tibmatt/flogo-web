import { Component, Inject } from '@angular/core';
import { TriggerStatus } from '../interfaces';
import { ConfirmationControl } from './confirmation-control';
import { TRIGGER_STATUS_TOKEN } from './status.token';

@Component({
  selector: 'flogo-triggers-configuration-settings-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.less']
})
export class ConfirmationComponent {
  constructor(@Inject(TRIGGER_STATUS_TOKEN) public status: TriggerStatus, public control: ConfirmationControl) {}
}
