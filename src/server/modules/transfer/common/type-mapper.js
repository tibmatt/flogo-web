import invert from 'lodash/invert';

export const TASK_TYPE = {
  ITERATOR: 'iterator',
  STANDARD: 'standard',
};
const taskTypeDictionary = {
  [TASK_TYPE.STANDARD]: 1,
  [TASK_TYPE.ITERATOR]: 2,
};

export const EXPRESSION_TYPE = {
  ASSIGN: 'assign',
  LITERAL: 'literal',
  EXPRESSION: 'expression',
  OBJECT: 'object',
  ARRAY: 'array',
};
const mappingTypesDictionary = {
  [EXPRESSION_TYPE.ASSIGN]: 1,
  [EXPRESSION_TYPE.LITERAL]: 2,
  [EXPRESSION_TYPE.EXPRESSION]: 3,
  [EXPRESSION_TYPE.OBJECT]: 4,
  [EXPRESSION_TYPE.ARRAY]: 5,
};

export const LINK_TYPE = {
  EXPRESSION: 'expression',
  SUCCESS: 'success',
};
const linkTypesDictionary = {
  [LINK_TYPE.SUCCESS]: 0,
  [LINK_TYPE.EXPRESSION]: 1,
};

const fromStandard = {
  taskTypes: taskTypeDictionary,
  mappingTypes: mappingTypesDictionary,
  linkTypes: linkTypesDictionary,
};

const toStandard = {
  taskTypes: invert(taskTypeDictionary),
  mappingTypes: invert(mappingTypesDictionary),
  linkTypes: invert(linkTypesDictionary),
};

export const typeMapper = {
  fromStandard() {
    return fromStandard;
  },
  toStandard() {
    return toStandard;
  },
};
