import { Observable, OperatorFunction } from 'rxjs';
import { map } from 'rxjs/operators';
import { ItemActivityTask, ActivitySchema } from '@flogo-web/client/core';

export interface DebugActivityTask extends ItemActivityTask {
  schemaHomepage: string;
}

export function combineToDebugActivity(): OperatorFunction<[ActivitySchema, ItemActivityTask], DebugActivityTask> {
  return (source: Observable<[ActivitySchema, ItemActivityTask]>) =>
    source.pipe(
      map(([schema, activity]) => (activity && schema ? { ...activity, schemaHomepage: schema.homepage } : null))
    );
}
