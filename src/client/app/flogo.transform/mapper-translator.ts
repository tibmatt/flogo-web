import {
  IFlogoFlowDiagramTask as FlowTile,
  IFlogoFlowDiagramTaskAttribute as FlowAttribute,
  IFlogoFlowDiagramTaskAttributeMapping as FlowMapping,
} from '../flogo.flows.detail.diagram/models';
import { FLOGO_TASK_TYPE, FLOGO_TASK_ATTRIBUTE_TYPE } from '../../common/constants';
import { REGEX_INPUT_VALUE_EXTERNAL, TYPE_ATTR_ASSIGNMENT } from './constants';
import { flogoIDDecode } from '../../common/utils';

export interface Schema {
  type: string;
  properties: {[name: string]: { type: string }};
  required?: string[];
  rootType?: string;
}

export class MapperTranslator {
  static createInputSchema(tile: FlowTile) {
    let attributes = [];
    if (tile.attributes && tile.attributes.inputs) {
      attributes = tile.attributes.inputs;
    }
    return MapperTranslator.attributesToObjectDescriptor(attributes);
  }

  static createOutputSchema(tiles: FlowTile[], includeEmptySchemas = false): Schema {
    const rootSchema = { type: 'object', properties: {} };
    tiles.forEach(tile => {
      let attributes;
      if (tile.type === FLOGO_TASK_TYPE.TASK) {
        // try to get data from task from outputs
        attributes = tile.attributes && tile.attributes.outputs ? tile.attributes.outputs : [];
      } else {
        // it's a trigger
        attributes = tile.attributes;
      }
      const hasAttributes = attributes && attributes.length > 0;
      if (hasAttributes || includeEmptySchemas) {
        const taskId = flogoIDDecode(tile.id);
        const tileSchema =  MapperTranslator.attributesToObjectDescriptor(attributes || []);
        tileSchema.rootType = this.getRootType(tile);
        rootSchema.properties[taskId] = tileSchema;
      }
    });
    return rootSchema;
  }

  static attributesToObjectDescriptor(attributes: FlowAttribute[]): Schema {
    const properties = {};
    const requiredPropertyNames = [];
    attributes.forEach(attr => {
      properties[attr.name] = { type: MapperTranslator.translateType(attr.type) };
      if (attr.required) {
        requiredPropertyNames.push(attr.name);
      }
    });
    return { type: 'object', properties, required: requiredPropertyNames };
  }

  // todo: change
  static translateType(type: FLOGO_TASK_ATTRIBUTE_TYPE) {
    return {
      [FLOGO_TASK_ATTRIBUTE_TYPE.ANY]: 'any',
      [FLOGO_TASK_ATTRIBUTE_TYPE.ARRAY]: 'array',
      [FLOGO_TASK_ATTRIBUTE_TYPE.BOOLEAN]: 'boolean',
      [FLOGO_TASK_ATTRIBUTE_TYPE.INT]: 'integer',
      [FLOGO_TASK_ATTRIBUTE_TYPE.INTEGER]: 'integer',
      [FLOGO_TASK_ATTRIBUTE_TYPE.NUMBER]: 'number',
      [FLOGO_TASK_ATTRIBUTE_TYPE.OBJECT]: 'object',
      [FLOGO_TASK_ATTRIBUTE_TYPE.PARAMS]: 'object',
      [FLOGO_TASK_ATTRIBUTE_TYPE.STRING]: 'string',
    }[type];
  }

  static translateMappingsIn(inputMappings: FlowMapping[]) {
    inputMappings = inputMappings || [];
    return inputMappings.reduce((mappings, input) => {
      let value = input.value;
      const legacyMapping = REGEX_INPUT_VALUE_EXTERNAL.exec(input.value);
      if (legacyMapping) {
        const [, type, name, property, tail] = legacyMapping;
        let head;
        if (type === 'T') {
          head = `trigger.${name}`;
        } else {
          head = `activity.${name}.${property}`;
        }
        value = `$\{${head}}${tail}`;
      }
      mappings[input.mapTo] = { expression: value };
      return mappings;
    }, {});
  }

  static translateMappingsOut(mappings: {[attr: string]: { expression: string} }): FlowMapping[] {
    return Object.keys(mappings || {})
      // filterOutEmptyExpressions
      .filter(attrName => mappings[attrName].expression && mappings[attrName].expression.trim())
      .map(attrName => ({
        type: TYPE_ATTR_ASSIGNMENT,
        mapTo: attrName,
        value: mappings[attrName].expression
      }));
  }

  static getRootType(tile: FlowTile) {
    if (tile.type === FLOGO_TASK_TYPE.TASK_ROOT) {
      return 'trigger';
    }
    return 'activity';
  }

}
