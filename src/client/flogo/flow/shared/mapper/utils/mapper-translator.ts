import * as _ from 'lodash';
import { resolveExpressionType } from 'flogo-parser';

import { FLOGO_ERROR_ROOT_NAME, FLOGO_TASK_TYPE, ValueType } from '@flogo/core/constants';
import { Task as FlowTile, AttributeMapping as FlowMapping, } from '@flogo/core';
import { MAPPING_TYPE, REGEX_INPUT_VALUE_EXTERNAL } from '../constants';

// todo: shared models should be moved to core
import { FlowMetadata, MapperSchema, Properties as MapperSchemaProperties } from '../../../task-configurator/models';
import { ROOT_TYPES } from '../constants';
import { Mappings, MapExpression } from '../models';

export type  MappingsValidatorFn = (mappings: Mappings) => boolean;
export interface AttributeDescriptor {
  name: string;
  type: ValueType;
  required?: boolean;
}

export class MapperTranslator {
  static createInputSchema(tile: FlowTile) {
    let attributes = [];
    if (tile.attributes && tile.attributes.inputs) {
      attributes = tile.attributes.inputs;
    }
    return MapperTranslator.attributesToObjectDescriptor(attributes);
  }

  static createOutputSchema(
    tiles: Array<FlowTile | FlowMetadata>, additionalSchemas?: MapperSchemaProperties, includeEmptySchemas = false
  ): MapperSchema {
    const rootSchema = {type: 'object', properties: {}};
    tiles.forEach(tile => {
      switch (tile.type) {
        case FLOGO_TASK_TYPE.TASK:
        case FLOGO_TASK_TYPE.TASK_SUB_PROC:
        case FLOGO_TASK_TYPE.TASK_ROOT:
          MapperTranslator.addTileToOutputContext(rootSchema, tile, includeEmptySchemas);
          break;
        case 'metadata':
          MapperTranslator.addFlowMetadataToOutputSchema(rootSchema, tile);
          break;
        default:
          rootSchema.properties[tile.name] = { type: tile.type };
        break;
      }
    });
    rootSchema.properties = Object.assign(rootSchema.properties, additionalSchemas);
    rootSchema.properties = sortObjectKeys(rootSchema.properties);
    return rootSchema;
  }

  private static addFlowMetadataToOutputSchema(rootSchema, flowMetadata: FlowMetadata) {
    const flowInputs = flowMetadata.input;
    if (flowInputs && flowInputs.length > 0) {
      const flowInputsSchema = MapperTranslator.attributesToObjectDescriptor(flowInputs);
      flowInputsSchema.rootType = 'flow';
      flowInputsSchema.title = 'flow';
      rootSchema.properties['flow'] = flowInputsSchema;
    }
  }

  static attributesToObjectDescriptor(attributes: AttributeDescriptor[], additionalProps?: { [key: string]: any }): MapperSchema {
    const properties = {};
    const requiredPropertyNames = [];
    attributes.forEach(attr => {
      let property = { type: attr.type };
      if (additionalProps) {
        property = Object.assign({}, additionalProps, property);
      }
      properties[attr.name] = property;
      if (attr.required) {
        requiredPropertyNames.push(attr.name);
      }
    });
    return { type: 'object', properties: sortObjectKeys(properties), required: requiredPropertyNames};
  }

  static translateMappingsIn(inputMappings: FlowMapping[]) {
    inputMappings = inputMappings || [];
    return inputMappings.reduce((mappings, input) => {
      let value = MapperTranslator.upgradeLegacyMappingIfNeeded(input.value);
      value = MapperTranslator.rawExpressionToString(value, input.type);
      mappings[input.mapTo] = {expression: value, mappingType: input.type};
      return mappings;
    }, {});
  }

  static rawExpressionToString(rawExpression: any, inputType?: number) {
    let value = rawExpression;
    if (inputType === MAPPING_TYPE.LITERAL_ASSIGNMENT && _.isString(rawExpression)) {
      value = `"${value}"`;
    } else if (!_.isString(value)) {
      value = JSON.stringify(value, null, 2);
    }
    return value;
  }

  static translateMappingsOut(mappings: { [attr: string]: { expression: string, mappingType?: number } }): FlowMapping[] {
    return Object.keys(mappings || {})
    // filterOutEmptyExpressions
      .filter(attrName => mappings[attrName].expression && mappings[attrName].expression.trim())
      .map(attrName => {
        const mapping = mappings[attrName];
        const { value, mappingType } = MapperTranslator.parseExpression(mapping.expression);
        return {
          mapTo: attrName,
          type: mappingType,
          value
        };
      });
  }

  static parseExpression(expression: string) {
    const mappingType = mappingTypeFromExpression(expression);
    let value = expression;
    if (mappingType === MAPPING_TYPE.OBJECT_TEMPLATE || mappingType === MAPPING_TYPE.LITERAL_ASSIGNMENT) {
      value = JSON.parse(value);
    }
    return { mappingType, value };
  }

  static getRootType(tile: FlowTile | FlowMetadata) {
    if (tile.type === FLOGO_TASK_TYPE.TASK_ROOT) {
      return tile.triggerType === FLOGO_ERROR_ROOT_NAME ? ROOT_TYPES.ERROR : ROOT_TYPES.TRIGGER;
    } else if (tile.type === 'metadata') {
      return ROOT_TYPES.FLOW;
    }
    return ROOT_TYPES.ACTIVITY;
  }

  static makeValidator(): MappingsValidatorFn {
    return (mappings: Mappings) => {
      if (!mappings) {
        return true;
      }
      const invalidMapping = Object.keys(mappings)
        .find(mapTo => isInvalidMapping(mappings[mapTo]));
      return !invalidMapping;
    };
  }

  static isValidExpression(expression: string) {
    return isValidExpression(expression);
  }

  private static upgradeLegacyMappingIfNeeded(mappingValue: string) {
    const legacyMapping = REGEX_INPUT_VALUE_EXTERNAL.exec(mappingValue);
    if (!legacyMapping) {
      return mappingValue;
    }
    const [, type, name, property, tail] = legacyMapping;
    let head;
    if (type === 'T') {
      head = `trigger.${name}`;
    } else {
      head = `activity.${name}.${property}`;
    }
    return `$\{${head}}${tail}`;
  }

  private static addTileToOutputContext(rootSchema, tile, includeEmptySchemas: boolean = false) {
    const attributes = tile.attributes;
    let outputs;
    if (tile.type === FLOGO_TASK_TYPE.TASK
      || tile.type === FLOGO_TASK_TYPE.TASK_SUB_PROC) {
      // try to get data from task from outputs
      outputs = attributes && attributes.outputs ? attributes.outputs : [];
    } else {
      // it's a trigger, outputs for trigger doesn't seem to be consistent in the UI model impl
      // hence checking in two places
      outputs = (<any>tile).outputs || attributes && attributes.outputs;
    }
    const hasAttributes = outputs && outputs.length > 0;
    if (hasAttributes || includeEmptySchemas) {
      const tileSchema = MapperTranslator.attributesToObjectDescriptor(outputs || []);
      tileSchema.rootType = MapperTranslator.getRootType(tile);
      tileSchema.title = tile.name;
      const propName = tileSchema.rootType === ROOT_TYPES.ERROR ? 'error' : tile.id;
      rootSchema.properties[propName] = tileSchema;
    }
  }

}

function sortObjectKeys (object: {[key: string]: any}) {
  const keys = Object.keys(object);
  const sortedKeys = keys.sort();
  return _.fromPairs(sortedKeys.map(key => [key, object[key]]));
}

// TODO: only works for first level mappings
function isInvalidMapping(mapping: MapExpression) {
  const expression = mapping.expression;
  if (!expression || !expression.trim().length) {
    return false;
  }
  return !isValidExpression(expression);
}

function isValidExpression(expression: string) {
  if (!expression || !expression.trim().length) {
    return true;
  }
  const mappingType = resolveExpressionType(expression);
  return mappingType != null;
}

function mappingTypeFromExpression(expression: string) {
  const expressionType = resolveExpressionType(expression);
  let mappingType = null;
  switch (expressionType) {
    case 'json':
      mappingType = MAPPING_TYPE.OBJECT_TEMPLATE;
      break;
    case 'literal':
      mappingType = MAPPING_TYPE.LITERAL_ASSIGNMENT;
      break;
    case 'attrAccess':
      mappingType = MAPPING_TYPE.ATTR_ASSIGNMENT;
      break;
    default:
      mappingType = MAPPING_TYPE.EXPRESSION_ASSIGNMENT;
      break;
  }
  return mappingType;
}
