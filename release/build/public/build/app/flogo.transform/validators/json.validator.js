"use strict";
function jsonValidator(control) {
    try {
        JSON.parse(control.value);
        var errors = control.errors;
        if (errors && errors['invalidJson']) {
            delete errors['invalidJson'];
            control.setErrors(errors, { emitEvent: false });
        }
        return null;
    }
    catch (e) {
        control.setErrors({ invalidJson: true }, { emitEvent: false });
        return {
            invalidJson: {
                valid: false
            }
        };
    }
}
exports.jsonValidator = jsonValidator;
