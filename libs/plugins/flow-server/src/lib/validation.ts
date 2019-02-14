import { createValidator } from '@flogo-web/server/core';
const schema = require('./internal.schema.json');
export const validateFlowData = createValidator(schema, { removeAdditional: true });
