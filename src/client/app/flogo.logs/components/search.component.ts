import {Pipe} from "@angular/core";

@Pipe({
    name: "logsSearch"
})
export class SearchPipe{
    transform(value, term:string){
        return value.filter((item)=> item.message.toLowerCase().indexOf(term.toLowerCase()) !== -1 );
    }
}