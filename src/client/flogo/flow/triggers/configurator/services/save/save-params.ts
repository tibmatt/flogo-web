import { MapperController } from '@flogo/flow/shared/mapper';
import { FormGroup } from '@angular/forms';

export interface SaveParams {
  settings: FormGroup;
  flowInputMapper: MapperController;
  replyMapper?: MapperController;
}
