import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
  name: "logsSearch"
})
export class SearchPipe implements PipeTransform {
  transform(value, term: string) {
    term = term.toLowerCase();
    return value.filter(item => (item.message || '').toLowerCase().indexOf(term) !== -1);
  }
}
