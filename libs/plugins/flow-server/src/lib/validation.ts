import { createValidator } from '@flogo-web/server/core';
const schema = require('./internal.schema.json');
const validateFlowData = createValidator(schema, { removeAdditional: true });
export { validateFlowData };
