import { Pipe, PipeTransform } from '@angular/core';
import { formatDistance } from 'date-fns';

@Pipe({
  name: 'timeFromNow',
})
export class TimeFromNowPipe implements PipeTransform {
  transform(value: any): string {
    if (typeof value === 'string') {
      value = new Date(value);
    }
    return formatDistance(value, new Date(), { addSuffix: true });
  }
}
