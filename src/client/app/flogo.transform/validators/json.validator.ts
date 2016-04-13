import { Control } from 'angular2/common';

export function jsonValidator(control:Control) {
  try {
    JSON.parse(control.value);
    let errors = control.errors;
    if (errors && errors['invalidJson']) {
      delete errors['invalidJson'];
      control.setErrors(errors, {emitEvent: false});
    }
    return null;
  } catch (e) {
    control.setErrors({invalidJson: true}, {emitEvent: false});
    return {
      invalidJson: {
        valid: false
      }
    };
  }
}
