import { Injectable } from '@angular/core';
import { IMapperResult, IMapContextValidator, IMapperContext } from '../models';

@Injectable()
export class MapContextValidator implements IMapContextValidator {
  validate(context: IMapperContext): IMapperResult {
    return null;
  }
}
