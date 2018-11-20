import { Pipe, PipeTransform } from '@angular/core';
import { formatDistance } from 'date-fns';

@Pipe({
  name: 'timeFromNow'
})
export class TimeFromNowPipe implements PipeTransform {
  transform(value: any): string {
    return formatDistance(value, new Date(),  { addSuffix: true });
  }
}
