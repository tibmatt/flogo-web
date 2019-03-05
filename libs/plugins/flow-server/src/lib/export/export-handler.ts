import { FlogoAppModel, Handler, createResourceUri } from '@flogo-web/core';

export function exportHandler(
  exportedHandler: FlogoAppModel.NewHandler,
  internalHandler: Handler
): FlogoAppModel.NewHandler {
  exportedHandler.action.settings = {
    flowURI: createResourceUri(internalHandler.resourceId),
  };
  return exportedHandler;
}
