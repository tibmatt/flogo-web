import { FormGroup } from '@angular/forms';
import { BaseField } from '@flogo-web/client/flow/shared/dynamic-form/field-base';

export interface FieldsInfo {
  form: FormGroup;
  metadata: {
    input: BaseField<any>[],
    output: BaseField<any>[]
  };
}
