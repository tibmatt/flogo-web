import { EventEmitter, Injectable } from '@angular/core';
import { ActivitySchema } from '@flogo-web/core';

@Injectable()
export class InstallerService {
  contribInstalled = new EventEmitter<ActivitySchema>();

  afterContribInstalled(contribDetails) {
    this.contribInstalled.emit(contribDetails);
  }
}
