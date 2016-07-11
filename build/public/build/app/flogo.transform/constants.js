"use strict";
exports.TYPE_ATTR_ASSIGNMENT = 1;
exports.TYPE_LITERAL_ASSIGNMENT = 2;
exports.TYPE_EXPRESSION_ASSIGNMENT = 3;
exports.VALID_TYPES = [
    exports.TYPE_ATTR_ASSIGNMENT,
    exports.TYPE_LITERAL_ASSIGNMENT
];
exports.REGEX_INPUT_VALUE_INTERNAL = /^(([\w-]+)\.([\w-]+))((?:\.[\w-]+)*)$/;
exports.REGEX_INPUT_VALUE_EXTERNAL = /^\{(A([\w-]+)|T)\.([\w-]+)\}((?:\.[\w-]+)*)$/;
