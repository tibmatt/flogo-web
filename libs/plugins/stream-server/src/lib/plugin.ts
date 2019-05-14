import { FlogoAppModel } from '@flogo-web/core';
import {
  FlogoPlugin,
  PluginServer,
  ResourceImportContext,
  HandlerImportContext,
  HandlerExportContext,
  HookContext,
} from '@flogo-web/lib-server/core';

const RESOURCE_TYPE = 'stream';
const RESOURCE_REF = 'github.com/project-flogo/stream';

export const streamPlugin: FlogoPlugin = {
  register(server: PluginServer) {
    // register resource type
    server.resources.addType({
      type: RESOURCE_TYPE,
      ref: RESOURCE_REF,
      import: {
        resource(data: any, context: ResourceImportContext) {
          return data;
        },
        handler(data: any, context: HandlerImportContext) {
          return data;
        },
      },
      export: {
        resource(resource) {
          return resource;
        },
        handler(handler: FlogoAppModel.NewHandler, context: HandlerExportContext) {
          return handler;
        },
      },
    });

    // register resource hooks
    // this is optional, you can remove it if your resource does not need hooks
    server.resources.useHooks({
      before: {
        create(context: HookContext) {
          if (context.resource.type === RESOURCE_TYPE) {
            console.log(`before creating resource of type ${context.resource.type}`);
          } else {
            console.log(`ignoring resources of type ${context.resource.type}`);
          }
        },
      },
    });
  },
};
