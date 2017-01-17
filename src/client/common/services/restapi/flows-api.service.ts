import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class RESTAPIFlowsService{
  constructor(private http:Http){
  }

  createFlow(flowObj: any) {
    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({headers: headers});
    let body = JSON.stringify(flowObj);

    return this.http.post('/v1/api/flows', body, options).toPromise();
  }

  getFlows() {
    return this.http.get('/v1/api/flows').toPromise()
      .then(response=> {
        if (response.text()) {
          return response.json();
        } else {
          return response;
        }
      });
  }

  updateFlow(flowObj: Object){
    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({headers: headers});
    let body = JSON.stringify(flowObj);

    return this.http.post('/v1/api/flows/update', body, options).toPromise();
  }

  deleteFlow(flowId) {
    return this.http.delete('/v1/api/flows/' + flowId).toPromise();
  }

  getFlow( id : string ) {
    return this.http.get('/v1/api/flows/' + id + '/json').toPromise()
      .then(response=>{
        if(response.text()) {
            let flow = response.json();
            // temporary injection of application values
            flow.application = {
                id: 'DEFAULT-APP',
                name: 'test application'
            }
            return flow;
        }
        else
          return response;
      });
  }


  getFlowByName( flowName : string ) {
        let headers = new Headers(
            {
                'Accept' : 'application/json'
            }
        );
        let options = new RequestOptions( { headers : headers } );
        return this.http.get('/v1/api/flows?name='+flowName, options ).toPromise()
  }
  uploadFlow( process : any ) {
    //  upload current flow to process service server

    let body = JSON.stringify( process );
    let headers = new Headers(
      {
        'Content-Type' : 'application/json',
        'Accept' : 'application/json'
      }
    );
    let options = new RequestOptions( { headers : headers } );

    return this.http.post('/v1/api/flows/run/flows', body, options )
      .toPromise().then(
        ( response : Response ) => {
          if ( response.text() ) {
            return response.json()
          } else {
            // TODO
            //  need to handle the empty response
            //  maybe later on the /flows API should be changed to reply the exist process
            //  instead of an empty response, however, in that case this block won't be run
            return {};
          }
        }
      );
  }

  startFlow( id : string, data : any ) {
    let body = JSON.stringify(
      {
        "flowId" : id,
        "attrs" : data
      }
    );

    let headers = new Headers(
      {
        'Content-Type' : 'application/json',
        'Accept' : 'application/json'
      }
    );

    let options = new RequestOptions( { headers : headers } );


    return this.http.post( '/v1/api/flows/run/flow/start', body, options )
      .toPromise()
      .then(
        rsp => {
          if ( rsp.text() ) {
            return rsp.json();
          } else {
            return rsp;
          }
        }
      );
  }

  importFlow( importFile : File, flowName:string ) {
    return new Promise( ( resolve, reject ) => {
      var formData = new FormData();
      var xhr = new XMLHttpRequest();
      if(!importFile.type) {
        importFile = new File([importFile], importFile.name, {type: 'application/json'});
      }

      formData.append( 'importFile', importFile, importFile.name );

      xhr.onreadystatechange = function () {
        if ( xhr.readyState == 4 ) {
          if ( xhr.status == 200 ) {
            resolve( JSON.parse( xhr.response ) );
          } else {
            reject( {
              status : xhr.status,
              statusText : xhr.statusText,
              response : xhr.response
            } );
          }
        }
      };
      let url = '/v1/api/flows/upload' + (flowName ? '?name='+ flowName : '') ;

      xhr.open( 'POST', url, true );
      xhr.send( formData );
    } );
  }

  // restartFlow() TODO need to inject instance related APIs
}
