"use strict";
var constants_1 = require('../constants');
var constants_2 = require('../../../common/constants');
var NESTABLE_ATTRIBUTE_TYPES = [
    constants_2.FLOGO_TASK_ATTRIBUTE_TYPE[constants_2.FLOGO_TASK_ATTRIBUTE_TYPE.OBJECT].toLowerCase(),
    constants_2.FLOGO_TASK_ATTRIBUTE_TYPE[constants_2.FLOGO_TASK_ATTRIBUTE_TYPE.PARAMS].toLowerCase(),
];
function mappingValidator(tileInfo, mapping) {
    if (!_.isObject(mapping)) {
        return {
            notObject: true,
        };
    }
    var errors = [validateType, validateMapTo, validateValue]
        .reduce(function (errors, validate) {
        return validate(tileInfo, mapping, errors);
    }, {});
    return _.isEmpty(errors) ? null : errors;
}
exports.mappingValidator = mappingValidator;
function validateType(tileInfo, mapping, errors) {
    if (mapping.type) {
        if (!_.includes(constants_1.VALID_TYPES, mapping.type)) {
            errors.type = {
                invalidValue: true
            };
        }
    }
    else {
        errors.type = {
            missing: true
        };
    }
    return errors;
}
function validateMapTo(tileInfo, mapping, errors) {
    if (!_.isEmpty(mapping.mapTo)) {
        var matches = /^([\w]+)(\.[\w-]+)*$/.exec(mapping.mapTo);
        var attrName = matches ? matches[1] : null;
        if (attrName && tileInfo.attributes[attrName]) {
            if (matches[2] && !_.includes(NESTABLE_ATTRIBUTE_TYPES, tileInfo.attributes[attrName])) {
                errors.mapTo = {
                    invalidValue: true,
                };
            }
        }
        else {
            errors.mapTo = {
                invalidValue: true,
            };
        }
    }
    else {
        errors.mapTo = {
            missing: true
        };
    }
    return errors;
}
function validateValue(tileInfo, mapping, errors) {
    if (_.isEmpty(mapping.value)) {
        errors.value = {
            missing: true
        };
        return errors;
    }
    if (!errors.type) {
        if (mapping.type == constants_1.TYPE_ATTR_ASSIGNMENT && !tileInfo.precedingOutputs[mapping.value]) {
            var matches = constants_1.REGEX_INPUT_VALUE_INTERNAL.exec(mapping.value);
            if (matches) {
                var path = matches[1];
                var outputInfo = tileInfo.precedingOutputs[path];
                if (!outputInfo || !_.includes(NESTABLE_ATTRIBUTE_TYPES, outputInfo.type)) {
                    errors.value = {
                        invalidValue: true
                    };
                }
            }
            else {
                errors.value = {
                    invalidValue: true
                };
            }
        }
    }
    return errors;
}
