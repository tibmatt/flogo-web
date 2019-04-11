import { resolvePluginNames, PluginNames, toClassName } from './utils';
import * as ts from 'typescript';
import {
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

const PLUGINS_CONFIG_FILE = 'apps/client/src/plugins.ts';
const CLIENT_TS_CONFIG = 'apps/client/tsconfig.app.json';
const RESOURCE_PLUGINS_DECLARATOR = 'resourcePlugins';

const pluginModule = subpackageName => `@flogo-web/plugins/${subpackageName}`;

export function createClientRule(pluginType: string, options): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const pluginNames = resolvePluginNames(pluginType);
    registerPluginInClient(pluginType, pluginNames.client, tree);
    includePluginInTsConfig(pluginNames.client.directoryName, tree);
    return tree;
  };
}

export function registerPluginInClient(
  pluginType: string,
  pluginNames: PluginNames,
  tree: Tree
) {
  const pluginsConfigFileContent = tree.read(PLUGINS_CONFIG_FILE);
  if (pluginsConfigFileContent === null) {
    throw new SchematicsException(
      `Could not find client app's plugin configuration file (${PLUGINS_CONFIG_FILE}).`
    );
  }
  const source = ts.createSourceFile(
    PLUGINS_CONFIG_FILE,
    pluginsConfigFileContent.toString('utf-8'),
    ts.ScriptTarget.Latest,
    true
  );
  const variables = findNodes(source, ts.SyntaxKind.VariableDeclaration);
  const resourcePluginDeclarations = variables.find(
    (v: ts.VariableDeclaration) =>
      v.name && v.name.getText() === RESOURCE_PLUGINS_DECLARATOR
  ) as ts.VariableDeclaration;
  if (
    resourcePluginDeclarations.initializer.kind !== ts.SyntaxKind.ArrayLiteralExpression
  ) {
    throw new SchematicsException(
      `Could not register the client plugin. "resourcePlugins" in ${PLUGINS_CONFIG_FILE} is not an array literal expression`
    );
  }

  const elements = Array.from(
    (resourcePluginDeclarations.initializer as ts.ArrayLiteralExpression).elements
  );
  const pluginAsClassName = toClassName(pluginType);
  const change = insertAfterLastOccurrence(
    Array.from(elements),
    `${elements.length > 0 ? ',' : ''}
   {
      label: '${pluginAsClassName}',
      type: '${pluginType}',
      path: '${pluginType}',
      loadChildren: '${pluginModule(pluginNames.directoryName)}#${
      pluginNames.entrySymbol
    }',
      color: '#33c6d8',
   }`,
    PLUGINS_CONFIG_FILE,
    0
  );

  if (change instanceof InsertChange) {
    const recorder = tree.beginUpdate(PLUGINS_CONFIG_FILE);
    recorder.insertLeft(change.pos, change.toAdd);
    tree.commitUpdate(recorder);
  }
}

function includePluginInTsConfig(pluginFolderName: string, tree: Tree) {
  const clientTsConfig = tree.read(CLIENT_TS_CONFIG);
  const source = ts.createSourceFile(
    CLIENT_TS_CONFIG,
    clientTsConfig.toString('utf-8'),
    ts.ScriptTarget.Latest,
    true
  );
  const includeStart = source.text.indexOf('"include":');
  const endOfInclude = source.text.indexOf(']', includeStart);

  const recorder = tree.beginUpdate(CLIENT_TS_CONFIG);
  recorder.insertLeft(
    endOfInclude,
    `, "../../libs/plugins/${pluginFolderName}/src/index.ts"\n`
  );
  tree.commitUpdate(recorder);
}
