import { TYPE_ATTR_ASSIGNMENT, TYPE_EXPRESSION_ASSIGNMENT, VALID_TYPES, REGEX_INPUT_VALUE_INTERNAL } from '../constants';
import { FLOGO_TASK_ATTRIBUTE_TYPE } from '../../../common/constants';
import { TileInOutInfo } from '../models/tile-in-out-info.model';

const NESTABLE_ATTRIBUTE_TYPES = [
  FLOGO_TASK_ATTRIBUTE_TYPE[FLOGO_TASK_ATTRIBUTE_TYPE.OBJECT].toLowerCase(),
  FLOGO_TASK_ATTRIBUTE_TYPE[FLOGO_TASK_ATTRIBUTE_TYPE.PARAMS].toLowerCase(),
  FLOGO_TASK_ATTRIBUTE_TYPE[FLOGO_TASK_ATTRIBUTE_TYPE.ANY].toLowerCase()
];

export function mappingValidator(tileInfo:TileInOutInfo, mapping:any) {
  if (!_.isObject(mapping)) {
    return {
      notObject: true,
    };
  }

  let errors = [validateType, validateMapTo, validateValue]
    .reduce((errors : any, validate : (tileInfo:TileInOutInfo, mapping:any, errors:any) => any) => {
      return validate(tileInfo, mapping, errors);
    }, {});

  return _.isEmpty(errors) ? null : errors;

}

function validateType(tileInfo:TileInOutInfo, mapping:{type?: any}, errors:any) {
  if (mapping.type) {
    if (!_.includes(VALID_TYPES, mapping.type)) {
      errors.type = {
        invalidValue: true
      };
    }
  } else {
    errors.type = {
      missing: true
    };
  }
  return errors;
}

function validateMapTo(tileInfo:TileInOutInfo, mapping:{mapTo?:string}, errors:any) {
  if (!_.isEmpty(mapping.mapTo)) {
    let matches = /^([\w]+)(\.[\w-]+)*$/.exec(mapping.mapTo); // var-name[.sub-path]
    let attrName = matches ? matches[1] : null;
    if (attrName && tileInfo.attributes[attrName]) {
      if(matches[2] && !_.includes(NESTABLE_ATTRIBUTE_TYPES, tileInfo.attributes[attrName])) {
        errors.mapTo = {
          invalidValue: true,
        }
      }
    } else {
      errors.mapTo = {
        invalidValue: true,
      }
    }
  } else {
    errors.mapTo = {
      missing: true
    };
  }
  return errors;
}


function validateValue(tileInfo:TileInOutInfo, mapping:{value?:string,type?:any}, errors:any) {
  if (_.isEmpty(mapping.value)) {
    errors.value = {
      missing: true
    };
    return errors;
  }

  if (!errors.type) {
    if (mapping.type == TYPE_ATTR_ASSIGNMENT && !tileInfo.precedingOutputs[mapping.value]) {

      let matches = REGEX_INPUT_VALUE_INTERNAL.exec(mapping.value);
      if(matches) {
        let path = matches[1];
        let outputInfo = tileInfo.precedingOutputs[path];

        if(!outputInfo || !_.includes(NESTABLE_ATTRIBUTE_TYPES, outputInfo.type)) {
          errors.value = {
            invalidValue: true
          };
        }
      } else {
        errors.value = {
          invalidValue: true
        };
      }


    }
  }
  return errors;

}
