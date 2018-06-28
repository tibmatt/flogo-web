import { Injectable } from '@angular/core';
import { AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { TriggersApiService } from '@flogo/core/services/restapi/v2/triggers-api.service';
import { timer } from 'rxjs/observable/timer';
import { Observable } from 'rxjs/Observable';
import { filter, map, switchMap } from 'rxjs/operators';

const DEBOUNCE_MS = 300;
const isSameTrigger = (triggers, currentTriggerId) => triggers.length === 1 && triggers[0].id === currentTriggerId;

@Injectable()
export class TriggerNameValidatorService {
  constructor(private triggersService: TriggersApiService) {
  }

  create(appId: string, triggerId: string): AsyncValidatorFn {
    return (control: AbstractControl): Observable<any> | Promise<any> => {
      return timer(DEBOUNCE_MS)
        .pipe(
          filter(() => control.value && control.value.trim()),
          switchMap(() => this.triggersService.listTriggersForApp(appId, { name: control.value })),
          map(foundTriggers => {
            if (foundTriggers && foundTriggers.length && !isSameTrigger(foundTriggers, triggerId)) {
              return { nameNotUnique: true };
            }
            return null;
          }),
      );
    };
  }
}
