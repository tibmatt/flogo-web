"use strict";
var mapping_validator_1 = require('./mapping.validator');
function mappingsValidatorFactory(tileInfo) {
    return mappingsValidator.bind(null, tileInfo);
}
exports.mappingsValidatorFactory = mappingsValidatorFactory;
function mappingsValidator(tileInfo, control) {
    if (control.getError('invalidJson') || !control.value || _.isEmpty(control.value.trim())) {
        return null;
    }
    var mappings = JSON.parse(control.value);
    if (!_.isArray(mappings)) {
        return {
            notArray: true
        };
    }
    var allErrors = [];
    mappings.forEach(function (mapping, index) {
        var errors = mapping_validator_1.mappingValidator(tileInfo, mapping);
        if (errors) {
            allErrors.push({
                index: index,
                errors: errors,
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
exports.mappingsValidator = mappingsValidator;
