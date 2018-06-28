import { Component, Inject } from '@angular/core';
import { TriggerStatus } from '../interfaces';
import { ConfirmationControl } from './confirmation-control';
import { TRIGGER_STATUS_TOKEN } from './status.token';
import { ConfirmationContent } from './confirmation-content';

@Component({
  selector: 'flogo-triggers-configuration-settings-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.less']
})
export class ConfirmationComponent implements ConfirmationContent {
  constructor(@Inject(TRIGGER_STATUS_TOKEN) public status: TriggerStatus, public control: ConfirmationControl) {}
}
