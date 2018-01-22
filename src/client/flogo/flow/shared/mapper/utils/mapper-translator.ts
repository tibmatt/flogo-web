import * as _ from 'lodash';
import { resolveExpressionType } from '@flogo/packages/mapping-parser';

import { IFlogoFlowDiagramTask as FlowTile, IFlogoFlowDiagramTaskAttributeMapping as FlowMapping, } from '../../diagram/models';

import { FLOGO_ERROR_ROOT_NAME, FLOGO_TASK_ATTRIBUTE_TYPE, FLOGO_TASK_TYPE } from '../../../../core/constants';
import { MAPPING_TYPE, REGEX_INPUT_VALUE_EXTERNAL } from '../constants';

import { flogoIDDecode } from '@flogo/shared/utils';
import { FlowMetadata, MapperSchema } from '../../../task-mapper/models';
import { IMapping } from '../models/imapping';
import { IMapExpression } from '@flogo/flow/shared/mapper';

export type  MappingsValidatorFn = (imapping: IMapping) => boolean;

export class MapperTranslator {
  static createInputSchema(tile: FlowTile) {
    let attributes = [];
    if (tile.attributes && tile.attributes.inputs) {
      attributes = tile.attributes.inputs;
    }
    return MapperTranslator.attributesToObjectDescriptor(attributes);
  }

  static createOutputSchema(tiles: Array<FlowTile | FlowMetadata>, includeEmptySchemas = false): MapperSchema {
    const rootSchema = {type: 'object', properties: {}};
    tiles.forEach(tile => {
      if (tile.type !== 'metadata') {
        const attributes = tile.attributes;
        let outputs;
        if (tile.type === FLOGO_TASK_TYPE.TASK || tile.type === FLOGO_TASK_TYPE.TASK_ITERATOR) {
          // try to get data from task from outputs
          outputs = attributes && attributes.outputs ? attributes.outputs : [];
        } else {
          // it's a trigger, outputs for trigger doesn't seem to be consistent in the UI model impl
          // hence checking in two places
          outputs = (<any>tile).outputs || attributes && attributes.outputs;
        }
        const hasAttributes = outputs && outputs.length > 0;
        if (hasAttributes || includeEmptySchemas) {
          const taskId = flogoIDDecode(tile.id);
          const tileSchema = MapperTranslator.attributesToObjectDescriptor(outputs || []);
          tileSchema.rootType = this.getRootType(tile);
          tileSchema.title = tile.title;
          rootSchema.properties[taskId] = tileSchema;
        }
      } else {
        const flowInputs = (<FlowMetadata>tile).input;
        if (flowInputs && flowInputs.length > 0) {
          const flowInputsSchema = MapperTranslator.attributesToObjectDescriptor(flowInputs);
          flowInputsSchema.rootType = 'flow';
          flowInputsSchema.title = 'flow';
          rootSchema.properties['flow'] = flowInputsSchema;
        }
      }
    });
    return rootSchema;
  }

  static attributesToObjectDescriptor(attributes: {
    name: string, type: string | FLOGO_TASK_ATTRIBUTE_TYPE, required?: boolean
  }[], additionalProps?: { [key: string]: any }): MapperSchema {
    const properties = {};
    const requiredPropertyNames = [];
    attributes.forEach(attr => {
      let property = {type: MapperTranslator.translateType(attr.type)};
      if (additionalProps) {
        property = Object.assign({}, additionalProps, property);
      }
      properties[attr.name] = property;
      if (attr.required) {
        requiredPropertyNames.push(attr.name);
      }
    });
    return {type: 'object', properties, required: requiredPropertyNames};
  }

  // todo: change
  static translateType(type: FLOGO_TASK_ATTRIBUTE_TYPE | string) {
    const translatedType = {
      [FLOGO_TASK_ATTRIBUTE_TYPE.ANY]: 'any',
      [FLOGO_TASK_ATTRIBUTE_TYPE.ARRAY]: 'array',
      [FLOGO_TASK_ATTRIBUTE_TYPE.BOOLEAN]: 'boolean',
      [FLOGO_TASK_ATTRIBUTE_TYPE.INT]: 'integer',
      [FLOGO_TASK_ATTRIBUTE_TYPE.INTEGER]: 'integer',
      [FLOGO_TASK_ATTRIBUTE_TYPE.NUMBER]: 'number',
      [FLOGO_TASK_ATTRIBUTE_TYPE.OBJECT]: 'object',
      [FLOGO_TASK_ATTRIBUTE_TYPE.PARAMS]: 'object',
      [FLOGO_TASK_ATTRIBUTE_TYPE.STRING]: 'string',
      [FLOGO_TASK_ATTRIBUTE_TYPE.COMPLEX_OBJECT]: 'complex_object',
    }[type];
    return translatedType || type;
  }

  static translateMappingsIn(inputMappings: FlowMapping[]) {
    inputMappings = inputMappings || [];
    return inputMappings.reduce((mappings, input) => {
      let value = this.upgradeLegacyMappingIfNeeded(input.value);
      if (input.type === MAPPING_TYPE.LITERAL_ASSIGNMENT && _.isString(value)) {
        value = `"${value}"`;
      } else if (!_.isString(value)) {
        // complex_object case
        value = JSON.stringify(value, null, 2);
      }
      mappings[input.mapTo] = {expression: value, mappingType: input.type};
      return mappings;
    }, {});
  }

  static translateMappingsOut(mappings: { [attr: string]: { expression: string, mappingType?: number } }): FlowMapping[] {
    return Object.keys(mappings || {})
    // filterOutEmptyExpressions
      .filter(attrName => mappings[attrName].expression && mappings[attrName].expression.trim())
      .map(attrName => {
        const mapping = mappings[attrName];
        let value = mapping.expression;
        const mappingType = mappingTypeFromExpression(value);
        if (mappingType === MAPPING_TYPE.OBJECT_TEMPLATE || mappingType === MAPPING_TYPE.LITERAL_ASSIGNMENT) {
          value = JSON.parse(value);
        }
        return {
          mapTo: attrName,
          type: mappingType,
          value
        };
      });
  }

  static getRootType(tile: FlowTile | FlowMetadata) {
    if (tile.type === FLOGO_TASK_TYPE.TASK_ROOT) {
      return tile.triggerType === FLOGO_ERROR_ROOT_NAME ? 'error-root' : 'trigger';
    } else if (tile.type === 'metadata') {
      return 'flow';
    }
    return 'activity';
  }

  static makeValidator(): MappingsValidatorFn {
    return (imapping: IMapping) => {
      const mappings = imapping && imapping.mappings;
      if (!mappings) {
        return true;
      }
      const invalidMapping = Object.keys(mappings)
        .find(mapTo => isInvalidMapping(mappings[mapTo]));
      return !invalidMapping;
    };
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

}

// TODO: only works for first level mappings
function isInvalidMapping(mapping: IMapExpression) {
  const expression = mapping.expression;
  if (!expression || !expression.trim().length) {
    return false;
  }
  let isInvalid = false;
  if (mapping.mappingType === MAPPING_TYPE.OBJECT_TEMPLATE) {
    try {
      JSON.parse(expression);
    } catch (e) {
      isInvalid = true;
    }
  } else {
    const mappingType = resolveExpressionType(mapping.expression);
    isInvalid = mappingType == null;
  }
  return isInvalid;
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
