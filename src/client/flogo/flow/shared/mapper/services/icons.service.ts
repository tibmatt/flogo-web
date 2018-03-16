import { Injectable } from '@angular/core';
import { ValueTypes } from '@flogo/core/constants';
import { MapperTreeNode } from '../models/mapper-treenode.model';

@Injectable()
export class IconsService {

  private iconMap = {
    date: '#flogo-mapper-icon-date',
    [ValueTypes.ARRAY]: '#flogo-mapper-icon-array',
    [ValueTypes.BOOLEAN]: '#flogo-mapper-icon-boolean',
    [ValueTypes.DOUBLE]: '#flogo-mapper-icon-double',
    [ValueTypes.INTEGER]: '#flogo-mapper-icon-integer',
    [ValueTypes.LONG]: '#flogo-mapper-icon-long',
    [ValueTypes.PARAMS]: '#flogo-mapper-icon-params',
    [ValueTypes.COMPLEX_OBJECT]: '#flogo-mapper-icon-complex-object',
    [ValueTypes.ANY]: '#flogo-mapper-icon-any',
    [ValueTypes.OBJECT]: '#flogo-mapper-icon-object',
    [ValueTypes.STRING]: '#flogo-mapper-icon-string',
    [`${ValueTypes.STRING}Array`]: '#flogo-mapper-icon-string-array',
    [`${ValueTypes.DOUBLE}Array`]: '#flogo-mapper-icon-double-array',
    [`${ValueTypes.BOOLEAN}Array`]: '#flogo-mapper-icon-boolean-array',
    dateArray: '#flogo-mapper-icon-date-array',
    [`${ValueTypes.OBJECT}Array`]: '#flogo-mapper-icon-object-array',
  };

  getIcon(node: MapperTreeNode) {
    let dataType = node.dataType;
    if (dataType === 'array' && node.memberType) {
      dataType = `${node.memberType}Array`;
    }

    return this.iconMap[dataType];
  }

}
