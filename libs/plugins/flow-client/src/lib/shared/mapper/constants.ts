export const ROOT_TYPES = {
  FLOW: 'flow',
  ACTIVITY: 'activity',
  TRIGGER: 'trigger',
  ERROR: 'error',
  ITERATOR: 'iterator',
};

export const REGEX_INPUT_VALUE_INTERNAL = /^(([\w-]+)\.([\w-]+))((?:\.[\w-]+)*)$/;
export const REGEX_INPUT_VALUE_EXTERNAL = /^\{(A([\w-]+)|T|E)\.([\w-]+)\}((?:\.[\w-]+)*)$/;
