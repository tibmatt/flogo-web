import { Injectable } from '@angular/core';
import { MapperTreeNode } from '../models/mapper-treenode.model';

@Injectable()
export class IconsService {

  private iconMap = {
    date: '#flogo-mapper-icon-date',
    array: '#flogo-mapper-icon-array',
    boolean: '#flogo-mapper-icon-boolean',
    number: '#flogo-mapper-icon-number',
    integer: '#flogo-mapper-icon-number',
    object: '#flogo-mapper-icon-object',
    string: '#flogo-mapper-icon-string',
    stringArray: '#flogo-mapper-icon-string-array',
    numberArray: '#flogo-mapper-icon-number-array',
    booleanArray: '#flogo-mapper-icon-boolean-array',
    dateArray: '#flogo-mapper-icon-date-array',
    objectArray: '#flogo-mapper-icon-object-array',
  };

  getIcon(node: MapperTreeNode) {
    let dataType = node.dataType;
    if (dataType === 'array' && node.memberType) {
      dataType = `${node.memberType}Array`;
    }

    return this.iconMap[dataType];
  }

}
