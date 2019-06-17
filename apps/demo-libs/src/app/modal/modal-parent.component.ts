import { Component } from '@angular/core';
import { ModalService } from '@flogo-web/lib-client/modal';
import { ModalContentComponent, UserParams } from './modal-content.component';

@Component({
  selector: 'demo-modal',
  templateUrl: './modal-parent.component.html',
  styleUrls: ['./modal-parent.component.less'],
})
export class ModalParentComponent {
  lastReply?: { user: string; reply?: string } = null;

  constructor(private modalService: ModalService) {}

  openModal(user?: string) {
    user = user ? user.trim() : 'stranger';
    const modalControl = this.modalService.openModal<UserParams>(
      // our modal content
      ModalContentComponent,
      { name: user }
    );

    // subscribe to the modal result
    modalControl.result.subscribe((reply?) => {
      this.lastReply = {
        user,
        reply,
      };
    });
  }
}
