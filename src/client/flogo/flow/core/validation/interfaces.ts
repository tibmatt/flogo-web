import { ItemTask, SchemaAttribute } from '@flogo/core';

export type ItemValidatorFn = (item: ItemTask) => { [key: string]: any } | null;
export type AttributeValidatorFactoryFn = (attribute: SchemaAttribute) => ItemValidatorFn | null;

export interface ErrorMap {
  [errorName: string]: any;
}

export interface Validator {
  propertyName: string;
  validate: ItemValidatorFn;
}
