import { FlogoAppModel } from '@flogo-web/core';
import { preFormatHandler } from './handler-format';

it('should work with empty input/output mappings', function() {
  let handler: FlogoAppModel.NewHandler;
  expect(() => {
    handler = preFormatHandler(
      {
        resourceId: 'resourceId',
        createdAt: null,
        updatedAt: null,
        settings: {},
        outputs: null,
      },
      'some/full/handler/ref',
      {
        getAliasRef(): string | undefined {
          return '#aliasedHandlerRef';
        },
        registerFunctionName(functionName: string): void {},
      }
    );
  }).not.toThrow();
  expect(handler.action.input).toBeFalsy();
  expect(handler.action.output).toBeFalsy();
});
