import { APIFlowsService } from '../../core/services/restapi/v2/flows-api.service';
import { AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { Observable } from 'rxjs/Observable';

import { timer } from 'rxjs/observable/timer';
import { of } from 'rxjs/observable/of';
import { map, switchMap } from 'rxjs/operators';

import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/switchMap';

export class UniqueNameValidator {

  static make(flowsService: APIFlowsService, appId: string): AsyncValidatorFn {
    return createUniqueNameValidator(flowsService, appId);
  }
}

function createUniqueNameValidator(flowsService: APIFlowsService, appId: string): AsyncValidatorFn {
  return (control: AbstractControl): Observable<any> | Promise<any> => {
    return timer(400).pipe(
      switchMap(() => {
        if (!control.value || !control.value.trim()) {
          return of(null);
        }
        return flowsService.findFlowsByName(control.value, appId);
      }),
      map(result => {
        let validationResult = null;
        if (result && result.length) {
          validationResult = { uniqueInvalid: true };
        }
        return validationResult;
      }),
    );
  };
}
