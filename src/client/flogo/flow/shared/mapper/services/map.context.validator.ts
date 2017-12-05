import { IMapContextValidator, IMapperContext, IMapperResult } from '../models/map-model';
import { Injectable } from '@angular/core';

@Injectable()
export class MapContextValidator implements IMapContextValidator {
  validate(context: IMapperContext): IMapperResult {
    return null;
  }
}
