import * as ts from 'typescript';
import {
  insertImport,
  findNodes,
  insertAfterLastOccurrence,
} from '@schematics/angular/utility/ast-utils';
import { InsertChange } from '@schematics/angular/utility/change';
import {
  Rule,
  Tree,
  SchematicContext,
  SchematicsException,
} from '@angular-devkit/schematics';

import { PluginNames, resolvePluginNames } from './utils';

const PLUGIN_CONFIGURATOR_FUNCTION_NAME = 'loadPlugins';
const PLUGINS_CONFIG_PATH = 'apps/server/src/plugins.ts';

export function createServerRule(resourceType: string, options): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const pluginNames = resolvePluginNames(resourceType);
    createPluginTemplate(resourceType, options.ref, pluginNames.server, tree);
    registerPluginInServer(pluginNames.server, tree);
    return tree;
  };
}

function createPluginTemplate(
  pluginType: string,
  pluginRef: string,
  pluginNames: PluginNames,
  tree: Tree
) {
  tree.create(
    `${pluginNames.rootPath}/src/lib/plugin.ts`,
    `
  import { FlogoAppModel } from '@flogo-web/core';
  import {
    FlogoPlugin,
    PluginServer,
    ResourceImportContext,
    HandlerImportContext,
    HandlerExportContext,
    HookContext,
  } from '@flogo-web/lib-server/core';

  const RESOURCE_TYPE = '${pluginType}';
  const RESOURCE_REF = '${pluginRef}';
  
  export const ${pluginNames.entrySymbol}: FlogoPlugin = {
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
              console.log(\`before creating resource of type \${context.resource.type}\`);
            } else {
              console.log(\`ignoring resources of type \${context.resource.type}\`);
            }
          },
        },
      });
    },
  };

  `
  );

  tree.overwrite(
    `${pluginNames.rootPath}/src/index.ts`,
    `import { ${pluginNames.entrySymbol} } from './lib/plugin'`
  );
}

function registerPluginInServer(pluginNames: PluginNames, tree: Tree) {
  const pluginsConfigFileContent = tree.read(PLUGINS_CONFIG_PATH);
  if (pluginsConfigFileContent === null) {
    throw new SchematicsException(
      `Could not find server's plugin configuration file (apps/server/src/plugins.ts).`
    );
  }
  const source = ts.createSourceFile(
    PLUGINS_CONFIG_PATH,
    pluginsConfigFileContent.toString('utf-8'),
    ts.ScriptTarget.Latest,
    true
  );

  const importChange = insertImport(
    source,
    PLUGINS_CONFIG_PATH,
    pluginNames.entrySymbol,
    `@flogo-web/plugins/${pluginNames.directoryName}`
  );

  const pluginConfigChange = configurePlugin(
    tree,
    source,
    PLUGINS_CONFIG_PATH,
    pluginNames.entrySymbol
  );

  const recorder = tree.beginUpdate(PLUGINS_CONFIG_PATH);
  if (importChange instanceof InsertChange) {
    recorder.insertLeft(importChange.pos, importChange.toAdd);
  }
  if (pluginConfigChange instanceof InsertChange) {
    recorder.insertLeft(pluginConfigChange.pos, pluginConfigChange.toAdd);
  }
  tree.commitUpdate(recorder);
}

function configurePlugin(
  tree: Tree,
  source: ts.SourceFile,
  pathToFile: string,
  pluginSymbol: string
) {
  const functions = findNodes(source, ts.SyntaxKind.FunctionDeclaration);
  const configuratorFn = functions.find(
    (n: ts.FunctionDeclaration) =>
      n.name && n.name.text === PLUGIN_CONFIGURATOR_FUNCTION_NAME
  ) as ts.FunctionDeclaration;

  if (!configuratorFn) {
    throw new SchematicsException(
      `Could not find server's plugins configuration function ("${PLUGIN_CONFIGURATOR_FUNCTION_NAME}" in "apps/server/src/plugins.ts).`
    );
  }

  const registratorParam = configuratorFn.parameters[0];
  if (!registratorParam) {
    throw new SchematicsException(
      `Missing registrator parameter in function "${PLUGIN_CONFIGURATOR_FUNCTION_NAME}()" in "apps/server/src/plugins.ts).`
    );
  }

  if (registratorParam.name.kind !== ts.SyntaxKind.Identifier) {
    throw new SchematicsException(
      `Could not register the server plugin. Function "${PLUGIN_CONFIGURATOR_FUNCTION_NAME}()" in "apps/server/src/plugins.ts" is missing its parameter's name. Expected parameter name to be an Identifier.`
    );
  }
  const registratorName = registratorParam.name.text;
  return insertAfterLastOccurrence(
    Array.from(configuratorFn.body.statements),
    `\n  ${registratorName}.use(${pluginSymbol});
`,
    pathToFile,
    0
  );
}
