import { AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { Observable, timer, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { APIFlowsService } from '@flogo-web/client-core/services';

export class UniqueNameValidator {
  static make(flowsService: APIFlowsService, appId: string): AsyncValidatorFn {
    return createUniqueNameValidator(flowsService, appId);
  }
}

function createUniqueNameValidator(
  flowsService: APIFlowsService,
  appId: string
): AsyncValidatorFn {
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
      })
    );
  };
}
