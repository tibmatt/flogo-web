import * as _ from 'lodash';

import {
  IFlogoFlowDiagramTask as FlowTile,
  IFlogoFlowDiagramTaskAttributeMapping as FlowMapping,
} from '../../flogo.flows.detail.diagram/models';

import { FLOGO_TASK_TYPE, FLOGO_TASK_ATTRIBUTE_TYPE, FLOGO_ERROR_ROOT_NAME } from '../../../common/constants';
import {
  REGEX_INPUT_VALUE_EXTERNAL, TYPE_ATTR_ASSIGNMENT,
  TYPE_OBJECT_TEMPLATE
} from '../../flogo.transform/constants';

import { flogoIDDecode } from '../../../common/utils';
import { MapperSchema, FlowMetadata } from '../../flogo.transform/models';
import { IMapping } from '../models/map-model';

export class MapperTranslator {
  static createInputSchema(tile: FlowTile) {
    let attributes = [];
    if (tile.attributes && tile.attributes.inputs) {
      attributes = tile.attributes.inputs;
    }
    return MapperTranslator.attributesToObjectDescriptor(attributes);
  }

  static createOutputSchema(tiles: Array<FlowTile|FlowMetadata>, includeEmptySchemas = false): MapperSchema {
    const rootSchema = { type: 'object', properties: {} };
    tiles.forEach(tile => {
      if (tile.type !== 'metadata') {
        const attributes = tile.attributes;
        let outputs;
        if (tile.type === FLOGO_TASK_TYPE.TASK) {
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
          const flowInputsSchema = MapperTranslator.attributesToObjectDescriptor(flowInputs, { rootType: 'flow' });
          rootSchema.properties = Object.assign(rootSchema.properties, flowInputsSchema.properties);
        }
      }
    });
    return rootSchema;
  }

  static attributesToObjectDescriptor(attributes: {
    name: string, type: string|FLOGO_TASK_ATTRIBUTE_TYPE, required?: boolean
  }[], additionalProps?: {[key: string]: any}): MapperSchema {
    const properties = {};
    const requiredPropertyNames = [];
    attributes.forEach(attr => {
      let property = { type: MapperTranslator.translateType(attr.type) };
      if (additionalProps) {
        property = Object.assign({}, additionalProps, property);
      }
      properties[attr.name] = property;
      if (attr.required) {
        requiredPropertyNames.push(attr.name);
      }
    });
    return { type: 'object', properties, required: requiredPropertyNames };
  }

  // todo: change
  static translateType(type: FLOGO_TASK_ATTRIBUTE_TYPE|string) {
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
      // complex_object case
      if (value && !_.isString(value)) {
        value = JSON.stringify(value);
      }
      mappings[input.mapTo] = { expression: value };
      return mappings;
    }, {});
  }

  static translateMappingsOut(mappings: {[attr: string]: { expression: string} }, propsDefinitions: {
    name: string, type: string|FLOGO_TASK_ATTRIBUTE_TYPE, required?: boolean
  }[]): FlowMapping[] {
    const attrTypes = new Map(<any>propsDefinitions.map(definition => [definition.name, MapperTranslator.translateType(definition.type)]));
    return Object.keys(mappings || {})
      // filterOutEmptyExpressions
      .filter(attrName => mappings[attrName].expression && mappings[attrName].expression.trim())
      .map(attrName => {
        const propType = attrTypes.get(attrName);
        if (attrTypes.get(attrName) && propType === 'complex_object') {
          return {
            type: TYPE_OBJECT_TEMPLATE,
            mapTo: attrName,
            value: JSON.parse(mappings[attrName].expression)
          };
        } else {
          return {
            type: TYPE_ATTR_ASSIGNMENT,
            mapTo: attrName,
            value: mappings[attrName].expression
          };
        }
      });
  }

  static getRootType(tile: FlowTile|FlowMetadata) {
    if (tile.type === FLOGO_TASK_TYPE.TASK_ROOT) {
      return tile.triggerType === FLOGO_ERROR_ROOT_NAME ? 'error-root' : 'trigger';
    } else if (tile.type === 'metadata') {
      return 'flow';
    }
    return 'activity';
  }

  static makeValidator(propsDefinitions: {
    name: string, type: string|FLOGO_TASK_ATTRIBUTE_TYPE, required?: boolean
  }[]) {
    const attrTypes = new Map(<any>propsDefinitions.map(definition => [definition.name, MapperTranslator.translateType(definition.type)]));
    return (imapping: IMapping) => {
      const mappings = imapping && imapping.mappings;
      if (mappings) {
        // TODO: only works for first level mappings
        const invalidMapping = Object.keys(mappings).find(mapTo => {
          if (attrTypes.get(mapTo) === 'complex_object') {
            const expression = mappings[mapTo].expression;
            if (!expression || !expression.trim().length) {
              return false;
            }
            let parsedProp = undefined;
            try {
              parsedProp = JSON.parse(expression);
            } catch (e) {}
            return parsedProp === undefined;
          }
          return false;
        });
        return !invalidMapping;
      }
      return true;
    };
  }

}
