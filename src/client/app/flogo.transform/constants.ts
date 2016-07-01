export const TYPE_ATTR_ASSIGNMENT = 1;
export const TYPE_LITERAL_ASSIGNMENT = 2;
export const TYPE_EXPRESSION_ASSIGNMENT = 3;
export const VALID_TYPES = [
  TYPE_ATTR_ASSIGNMENT,
  TYPE_LITERAL_ASSIGNMENT
  // TYPE_EXPRESSION_ASSIGNMENT // not yet
];

export const REGEX_INPUT_VALUE_INTERNAL = /^(([\w-]+)\.([\w-]+))((?:\.[\w-]+)*)$/;
export const REGEX_INPUT_VALUE_EXTERNAL = /^\{(A([\w-]+)|T)\.([\w-]+)\}((?:\.[\w-]+)*)$/;
