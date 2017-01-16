import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeFromNow'
})
export class TimeFromNowPipe implements  PipeTransform {
  transform(value: any, format = 'YYYYMMDD hh:mm:ss') : string {
    return moment(value, format).fromNow();
  }
}
