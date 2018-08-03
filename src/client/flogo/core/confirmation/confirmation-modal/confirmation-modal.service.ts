import {Injectable} from '@angular/core';
import {
  CONFIRMATION_MODAL_TOKEN,
  ConfirmationModalComponent,
  ConfirmationService,
  ConfirmationModal
} from 'flogo/core/confirmation/index';

@Injectable()
export class ConfirmationModalService {
  constructor(public confirmationService: ConfirmationService) {
  }

  openModal({title, textMessage}) {
    const data = new WeakMap<any, any>();
    data.set(CONFIRMATION_MODAL_TOKEN, {title, textMessage} as ConfirmationModal);
    return this.confirmationService.openModal(ConfirmationModalComponent, data);
  }

}
