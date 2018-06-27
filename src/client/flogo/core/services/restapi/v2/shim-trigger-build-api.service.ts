import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {HttpUtilsService} from '@flogo/core/services/restapi/http-utils.service';
import {getFileName} from '@flogo/core/services/restapi/restapi-utils';

@Injectable()
export class ShimTriggerBuildApiService {
  constructor(private httpUtilsService: HttpUtilsService,
              private http: HttpClient) {
  }


  public buildShimTrigger(shimTrigger) {
    const buildURL = this.getShimTriggerBuildLink(shimTrigger.triggerId);
    let params = new HttpParams();
    if (shimTrigger.env) {
       params = params.append ('os', shimTrigger.env.os);
       params = params.append('arch', shimTrigger.env.arch);
    }
    this.http.get(buildURL, {params, responseType: 'blob', observe: 'response'})
      .subscribe((response) => {
        const url = window.URL.createObjectURL(response.body);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        const responseHeader = response.headers.get('content-disposition');
        link.setAttribute('download', getFileName(responseHeader));
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
  }

  private getShimTriggerBuildLink(triggerId: string) {
    return this.httpUtilsService.apiPrefix(`triggers/${triggerId}:shim`);
  }

}
