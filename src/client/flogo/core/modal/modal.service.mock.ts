import {Injectable, Injector} from '@angular/core';
import {ModalContent, ModalService} from '@flogo/core/modal/modal.service';
import {ComponentType} from '@angular/cdk/portal';
import {ModalControl} from '@flogo/core/modal/modal-control';


@Injectable()
export class MockModalService extends ModalService {
  constructor() {
    super(null, null);
  }

  openModal<T>(contentComponent: ComponentType<ModalContent>, componentData?: T): ModalControl {

    return this.openModal<T>(contentComponent, componentData);
  }
}
