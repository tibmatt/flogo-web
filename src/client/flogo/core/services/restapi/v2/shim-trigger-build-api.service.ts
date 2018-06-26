import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {HttpUtilsService} from '@flogo/core/services/restapi/http-utils.service';
import {getFileName} from '@flogo/shared/utils';

@Injectable()
export class ShimTriggerBuildApiService {
  constructor(private httpUtilsService: HttpUtilsService,
              private http: HttpClient) {
  }


  private getShimTriggerBuildLink(triggerId: string) {
    return this.httpUtilsService.apiPrefix(`triggers/${triggerId}:shim`);
  }

  public buildShimTrigger(shimTrigger) {
    let buildURL = this.getShimTriggerBuildLink(shimTrigger.triggerId);
    if (shimTrigger.env) {
      buildURL = buildURL + '?os=' + shimTrigger.env.os + '&arch=' + shimTrigger.env.arch;
    }
    this.http.get(buildURL, {responseType: 'blob', observe: 'response'})
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
}
