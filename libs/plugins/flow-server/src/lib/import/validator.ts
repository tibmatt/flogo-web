import { createValidator, Schemas } from '@flogo-web/server/core';
export const validate = createValidator(Schemas.v1.flow, {
  removeAdditional: true,
  schemas: [Schemas.v1.common],
});
