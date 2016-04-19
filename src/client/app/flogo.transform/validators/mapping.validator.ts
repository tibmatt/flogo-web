import { TYPE_ATTR_ASSIGNMENT, TYPE_EXPRESSION_ASSIGNMENT, VALID_TYPES, REGEX_INPUT_VALUE_INTERNAL } from '../constants';
import { TileInOutInfo } from '../models/tile-in-out-info.model'

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
    if (!_.includes(tileInfo.attributes, mapping.mapTo)) {
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
        if(!outputInfo || outputInfo.type !== 'object') {
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
