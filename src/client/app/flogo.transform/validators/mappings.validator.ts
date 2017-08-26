import { FormControl } from '@angular/forms';
import { mappingValidator } from './mapping.validator';
import { TileInOutInfo } from '../models/tile-in-out-info.model';

export function mappingsValidatorFactory(tileInfo: TileInOutInfo) {
  return mappingsValidator.bind(null, tileInfo);
}

export function mappingsValidateField(tileInfo: TileInOutInfo, value: string): any {

  const mappings = JSON.parse(value);
  if (!_.isArray(mappings)) {
    return {
      notArray: true
    };
  }

  const allErrors: any[] = [];
  mappings.forEach((mapping: any, index: number) => {
    const errors: any[] = mappingValidator(tileInfo, mapping);
    if (errors) {
      allErrors.push({
        index,
        errors,
        value: mapping,
      });
    }
  });

  return _.isEmpty(allErrors) ? null : {
      invalidMappings: {
        valid: false,
        errors: allErrors
      }
    };


}

export function mappingsValidator(tileInfo: TileInOutInfo, control: FormControl): any {

  if (control.getError('invalidJson') || !control.value || _.isEmpty(control.value.trim())) {
    return null;
  }

  return mappingsValidateField(tileInfo, control.value);

}

