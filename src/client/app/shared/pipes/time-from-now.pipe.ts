import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeFromNow'
})
export class TimeFromNowPipe implements PipeTransform {
  transform(value: any): string {
    return moment(value).fromNow();
  }
}
