import { Component, Inject } from '@angular/core';
import { ModalControl, MODAL_TOKEN } from '@flogo-web/lib-client/modal';

export interface UserParams {
  name: string;
}

@Component({
  selector: 'demo-modal-content',
  template: `
    <h2>Hello {{ user.name || 'stranger' }}, do you like this modal?</h2>

    <button data-testid="modal-response-yes" (click)="reply('yup!')">Yup!</button>
    <button data-testid="modal-response-no" (click)="reply('meh')">Meh</button>
  `,
  styles: [
    `
      :host {
        display: block;
        background-color: #fff;
        padding: 1.5rem;
      }
    `,
  ],
})
export class ModalContentComponent {
  constructor(
    @Inject(MODAL_TOKEN) public user: UserParams,
    public control: ModalControl
  ) {}

  reply(message: string) {
    this.control.close(message);
  }
}
