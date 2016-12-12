import {Pipe} from "@angular/core";

@Pipe({
    name: "logsSearch"
})
export class SearchPipe{
    transform(value, term:string) {
      term = term.toLowerCase();
        return value.filter(item => (item.message||'').toLowerCase().indexOf(term) !== -1 );
    }
}
