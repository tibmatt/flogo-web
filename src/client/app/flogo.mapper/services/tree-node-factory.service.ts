import { Injectable } from '@angular/core';
import * as lodash from 'lodash';

import { TreeNode } from 'primeng/components/common/api';
import { MapperTreeNode } from '../models/mapper-treenode.model';
import { ArrayMappingInfo } from '../models/array-mapping';

@Injectable()
export class TreeNodeFactoryService {

  fromJsonSchema(schema: any, visitor?: (treeNode: TreeNode, level: number, path: string) => any): MapperTreeNode[] {
    if (!schema) {
      return [];
    }
    return this.makeTreeNodes(schema, visitor, { level: 0, path: null });
  }

  applyArrayFilterToJsonSchema(schema: any, mappedArrayChain: ArrayMappingInfo[], path?: string, isInFilterPath = false) {
    // let properties = {};
    // const { level, path } = params;
    // const nodeLevel = level + 1;

    mappedArrayChain = mappedArrayChain || [];
    if (!schema || schema !== Object(schema)) {
      return {};
    }

    // let hasFilteredArray = false;
    let properties;
    const result = Object.assign({}, schema);
    if (schema.type === 'object') {
      properties = result.properties;
    } else if (schema.type === 'array') {
      const arrayMapping = mappedArrayChain ? mappedArrayChain[0] : null;
      if (arrayMapping && arrayMapping.params[0] !== path) {
        return null;
      }
      mappedArrayChain = mappedArrayChain.slice(1);
      properties = this.isObject(result.items) ? result.items.properties : null;
    } else {
      return result;
    }

    if (this.isObject(properties)) {
      const filteredName = null;
      result.properties = Object.keys(properties).map(propName => {
        const propPath = (path ? `${path}.` : '') + propName;
        const propertyDescriptor = this.applyArrayFilterToJsonSchema(properties[propName], mappedArrayChain, propPath, isInFilterPath);

        if (propertyDescriptor) {
          return [propName, propertyDescriptor];
          // allowedProperties[propName] = propertyDescriptor;
        }
        return null;
      })
        .filter(prop => {
          if (!prop) {
            return false;
          }
          const [propName] = prop;
          return !filteredName || filteredName === propName;
        })
        .reduce((allowedProperties, [propName, descriptor]) => {
          allowedProperties[propName] = descriptor;
          return allowedProperties;
        });
    }

    return result;
    // return result;
  }

  // todo: functions type
  fromFunctions(functionMap: any) {
    // is it an object?
    if (functionMap !== Object(functionMap)) {
      return [];
    }

    const categoryMap = new Map<any, TreeNode>();
    const namespaceDivider = '/';

    const pushToCategory = (categoryId, value) => {
      let category = categoryMap.get(categoryId);
      if (!category) {
        category = { label: categoryId, children: [], styleClass: 'node--has-children' };
        categoryMap.set(categoryId, category);
      }
      category.children.push(value);
    };

    const nodes = [];
    Object.keys(functionMap).forEach(func => {
      const currentFunction = functionMap[func];
      // const functionName = currentFunction.category;
      const nameParts = currentFunction.category.split(namespaceDivider);

      const name = currentFunction.name;

      // const name = nameParts.pop();
      // removing the subpackage name
      nameParts.pop();
      const namespace = nameParts.join(namespaceDivider);

      // const node = { label: name, data: Object.assign(functionMap) };
      const help = currentFunction.function.help;
      const args = currentFunction.function.args
        .reduce((allArgs, current) => {
          // is var args?
          if (/\.\.\.(.+)/g.test(current.type)) {
            allArgs.push(`${current.name}1`, `${current.name}2`);
          } else {
            allArgs.push(current.name);
          }
          return allArgs;
        }, []);

      const functionName = `${name}(${args.join(', ')})`;
      // const snippetArgs = args.map((argName, i) => `\${${i}:${argName}`).join(", ");
      // const snippet = `${name}(${snippetArgs})`;
      const snippet = nameParts.concat(functionName).join('.');
      const node = {
        label: functionName,
        isSelectable: true,
        styleClass: 'node--selectable node--has-no-children',
        data: { help, snippet }
      };

      if (namespace) {
        pushToCategory(namespace, node);
      } else {
        nodes.push(node);
      }
    });

    const sort = (sortNodes) => lodash.sortBy(sortNodes, 'label');
    const allNodes = nodes.concat(Array.from(categoryMap.values())).map(node => {
      if (node.children) {
        node.children = sort(node.children);
      } else {
        node.isSelectable = true;
      }
      return node;
    });

    return sort(allNodes);
  }

  fromJsonSchemaToSymbolTable(from: any, level = 0) {
    let properties = {};

    if (from.type === 'object') {
      properties = from.properties;
    } else if (from.type === 'array' && from.items && from.items.properties) {
      properties = from.items.properties;
    }
    // not and object, bye
    if (properties !== Object(properties)) {
      return [];
    }

    return Object.keys(properties).reduce((nodes, propName) => {
      const property = properties[propName];
      const node: { name: string, type: string, children?: any, memberType?: string } = {
        name: propName,
        type: property.type
      };

      if (property.type === 'object' || property.type === 'array') {
        node.children = this.fromJsonSchemaToSymbolTable(property);
      }

      if (property.type === 'array') {
        node.memberType = property.items && property.items.type;
      }

      if (property.type === 'object' && level === 0) {
        node.type = 'namespace';
      }

      nodes[propName] = node;
      return nodes;
    }, {});
  }

  fromFunctionsToSymbolTable(functionMap: any) {
    // is it an object?
    if (functionMap !== Object(functionMap)) {
      return {};
    }

    const categoryMap = new Map<any, { name: string, type: string, children?: any }>();
    const namespaceDivider = '/';

    const pushToCategory = (categoryId, value) => {
      let category = categoryMap.get(categoryId);
      if (!category) {
        category = { name: categoryId, type: 'namespace', children: {} };
        categoryMap.set(categoryId, category);
      }
      category.children[value.name] = value;
    };

    const nodes = [];
    Object.keys(functionMap).forEach(func => {
      const currentFunction = functionMap[func];
      // const functionName = currentFunction.category;
      const nameParts = currentFunction.category.split(namespaceDivider);

      const name = currentFunction.name;

      // const name = nameParts.pop();
      // removing the subpackage name
      nameParts.pop();
      const namespace = nameParts.join(namespaceDivider);

      // const node = { label: name, data: Object.assign(functionMap) };
      // const help = currentFunction.function.help;
      // const args = currentFunction.function.args.map((arg) => `${arg.name}`);
      //
      // const functionName = `${name}(${args.join(", ")})`;
      // const snippetArgs = args.map((argName, i) => `\${${i}:${argName}`).join(", ");
      // const snippet = `${name}(${snippetArgs})`;
      // const snippet = nameParts.concat(functionName).join(".");
      const node = Object.assign({}, currentFunction.function, { name, type: 'function' });

      if (namespace) {
        pushToCategory(namespace, node);
      } else {
        nodes.push(node);
      }
    });

    return Array.from(categoryMap.values()).reduce((all, c) => {
      all[c.name] = c;
      return all;
    }, {});
  }

  private makeTreeNodes(from: any,
                        visitor: (node: MapperTreeNode, level, path) => MapperTreeNode,
                        params: { level, path }): MapperTreeNode[] {
    let properties = {};
    // let memberType = null;
    const { level, path } = params;
    let required: string[];

    const nodeLevel = level + 1;

    if (from.type === 'object') {
      properties = from.properties;
      required = from.required || [];
    } else if (from.type === 'array' && from.items) {
      // memberType = from.items.type;
      required = from.items.required || [];
      if (from.items.properties) {
        properties = from.items.properties;
      }
    }
    // not and object, bye
    if (properties !== Object(properties)) {
      return [];
    }

    return Object.keys(properties).map(propName => {
      const property = properties[propName];
      const nodePath = (path ? `${path}.` : '') + propName;
      let dataType: string = property.type;

      if (dataType === 'string' && (property.format === 'date' || property.format === 'date-time')) {
        dataType = 'date';
      }

      let node: MapperTreeNode = {
        label: propName,
        isSelectable: true,
        styleClass: 'mapper-tree__node',
        path: nodePath,
        snippet: nodePath,
        dataType: dataType,
        data: {}
      };

      // if (memberType) {
      //   node.memberType = memberType;
      // }

      if (property.type === 'object' || property.type === 'array') {
        node.children = this.makeTreeNodes(property, visitor, { path: nodePath, level: nodeLevel });

        // if is an array of primitives
        const nodeProperties = lodash.get(property, 'items.properties', null);
        const nodeType = lodash.get(property, 'items.type', null);
        if (!nodeProperties && property.type === 'array' && nodeType) {
          node.memberType = property.items.type;
        }

        const hasChildren = (node.children && node.children.length);
        node.isSelectable = true;
        node.styleClass = node.styleClass + ' ' + ( hasChildren ? 'node--has-children' : 'node--has-no-children');
      } else {
        node.styleClass = node.styleClass + ' node--has-no-children';
      }

      if (visitor) {
        node = visitor(node, nodeLevel, nodePath);
      }

      if (node.isSelectable) {
        node.styleClass = `${node.styleClass} node--selectable`;
      }

      if (required && required.length) {
        if (required.indexOf(propName) >= 0) {
          node.styleClass = `${node.styleClass} node--required`;
        }
      }

      return node;
    });
  }

  private linkCurrentContextToParent(key: string, mappings: any) {
    for (const property in mappings) {
      if (mappings.hasOwnProperty(property)) {
        const newKey = property.replace(/\$/gi, key);
        mappings[newKey] = mappings[property];
        delete mappings[property];
      }
    }
  }

  private traverseMappings(mappings: any, flatten: any = {}) {
    for (const key in mappings) {
      if (mappings.hasOwnProperty(key)) {
        const property = mappings[key];
        if (property.expression) {
          flatten[key] = property.expression;
        }
        if (property.mappings) {
          this.linkCurrentContextToParent(key, property.mappings);
          this.traverseMappings(property.mappings || {}, flatten);
        }
      }
    }
    return flatten;
  }

  public flatMappings(mappings: any) {
    return this.traverseMappings(lodash.cloneDeep(mappings));
  }

  private isObject(value: any) {
    return value && value === Object(value);
  }


}
