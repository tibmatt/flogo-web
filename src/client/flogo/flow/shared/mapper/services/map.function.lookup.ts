import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
// import { PaletteService } from '../../shared/services/palette.service';
import { IMapFunctionsLookup } from '../models/map-model';
// import { STRING_MAP } from '../../../index';

// tslint:disable-next-line:interface-over-type-literal
type STRING_MAP<T> = {[key: string]: T};

@Injectable()
export class FunctionsLookup implements IMapFunctionsLookup {
  // constructor(private _paletteService: PaletteService) {
  // }

  // getFunctions(): Observable<STRING_MAP<IMappingFunction>> {
  getFunctions(): Observable<STRING_MAP<any>> {
    return Observable.of([[]]);
    // return this._paletteService.getContributionFunctionsFromServer();
  }

  isValidFunction(fqFunctionPath: string): boolean {
    return false;
  }

  // getFunction(fqFunctionPath: string): IMappingFunction {
  getFunction(fqFunctionPath: string): any {
    return null;
  }
}
