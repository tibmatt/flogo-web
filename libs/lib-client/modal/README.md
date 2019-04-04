# @flogo-web/lib-client/modal

## Usage

1. Create the component that will be used as the content of the modal.

```typescript
// user-modal.component.ts
import { Component, Inject } from '@angular/core';
import { MODAL_TOKEN, ModalControl } from '@flogo-web/lib-client/modal';

interface User {
  name: string;
  lastName: string;
}

@Component({
  selector: 'user-modal-component',
  template: `
    Are you {{ user.name }} {{ user.lastName }}? <br />
    <button (click)="reply('yes')">Yes</button> <button (click)="reply('no')">No</button>
  `,
})
class UserModalComponent {
  constructor(
    // use MODAL_TOKEN to inject into this component the data sent by the modal caller
    // we're using the User interface defined above as the data type
    @Inject(MODAL_TOKEN) user: User,
    // inject the modal control to control this modal's instance state and to communicate to the caller
    private control: ModalControl
  ) {}

  reply(answer: string) {
    // close the modal and send the answer back to the caller
    this.control.close(answer);
  }
}
```

2. Add your modal component to the entrypoints of its module

```typescript
// my.module.ts
import { NgModule } from '@angular/core';
import { UserModalComponent } from './user-modal.component';
import { ParentComponent } from './parent.component';

@NgModule({
  declarations: [ParentComponent, UserModalComponent],
  // it is important the modal content component is declared as an entryComponents
  // so it can be dynamically instantiated
  entryComponents: [UserModalComponent],
})
export class ModalModule {}
```

3. Instantiate your modal

```typescript
// parent.component.ts

import { Component } from '@angular/core';
import { ModalService } from '@flogo-web/lib-client/modal';

import { UserModalComponent, User } from './user-modal.component';

@Component({...})
export class ParentComponent {
  constructor(private modalService: ModalService) {
  }

  openModal() {
    // open the modal
    const modalControl = this.modalService
      .openModal<User>(
        // our modal content
        UserModalComponent,
        // data we want to send to the modal
        { name: 'Jon', lastName: 'Snow' }
        );

    // subscribe to the modal result
    modalControl.result.subscribe(answer => console.log(answer));

    // or close the modal yourself
    modalControl.close();
  }

}

```
