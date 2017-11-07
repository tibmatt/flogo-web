import {BaseField} from '../field-base';

export class ObjectType extends BaseField<any> {
  controlType = 'FieldObject';

  constructor(opts: any = {}) {
    super(opts);
  }
}
