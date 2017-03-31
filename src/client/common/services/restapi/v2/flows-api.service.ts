import {Injectable} from "@angular/core";
import {Http} from "@angular/http";

@Injectable()
export class APIFlowsService {
  constructor(private http:Http ){
  }

  getFlow(flowID: string) {
    return this.http.get('/api/v2/actions/' + flowID).toPromise()
      .then(response=>{
        if(response.text()) {
          return response.json().data;
        }
        else
          return response;
      });
  }
}
