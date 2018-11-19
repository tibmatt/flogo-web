import {Component, HostBinding, Inject} from '@angular/core';
import {ImportErrorFormatterService} from '../core/import-error-formatter.service';
import {ValidationDetail} from '@flogo/core';
import {MODAL_TOKEN, modalAnimate, ModalControl} from '@flogo/core/modal';

export interface AppImportErrorData {
  importValidationErrors: ValidationDetail[];
}

@Component({
  selector: 'flogo-home-app-import',
  templateUrl: 'app-import.component.html',
  styleUrls: ['app-import.component.less'],
  animations: modalAnimate
})

export class FlogoAppImportComponent {

  @HostBinding('@modalAnimate')
  public errorDetails: ValidationDetail[];

  constructor(@Inject(MODAL_TOKEN) public appImportErrorData: AppImportErrorData, public control: ModalControl,
              public errorFormatter: ImportErrorFormatterService) {
    this.errorDetails = this.errorFormatter.getErrorsDetails(this.appImportErrorData.importValidationErrors);
  }

}
