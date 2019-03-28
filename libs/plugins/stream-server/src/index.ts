import { FlogoAppModel } from '@flogo-web/core';
import {
  FlogoPlugin,
  PluginServer,
  ResourceImportContext,
  HandlerImportContext,
  HandlerExportContext,
} from '@flogo-web/lib-server/core';

export const streamPlugin: FlogoPlugin = {
  register(server: PluginServer) {
    server.resources.addType({
      type: 'stream',
      ref: 'github.com/project-flogo/stream',
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
          (resource.data as any).decoratedField = 'hey there';
          return resource;
        },
        handler(handler: FlogoAppModel.NewHandler, context: HandlerExportContext) {
          (handler as any).decoratedField = 'hey there';
          return handler;
        },
      },
    });
    // server.resources.useHooks({
    //   before: {
    //     create() {},
    //     update() {},
    //     remove() {},
    //     list() {},
    //   },
    //   after: {
    //     create() {},
    //     update() {},
    //     remove() {},
    //     list() {},
    //   },
    // });
  },
};
