export const ITERATOR_OUTPUT_KEY = '$current';

export function getIteratorOutputSchema() {
  return {
    type: 'object',
    properties: {
      [ITERATOR_OUTPUT_KEY]: {
        type: 'object',
        properties: {
          iteration: {
            type: 'object',
            properties: {
              key: {
                type: 'string'
              },
              value: {
                type: 'any'
              },
            },
          },
        },
      },
    }
  };
}
