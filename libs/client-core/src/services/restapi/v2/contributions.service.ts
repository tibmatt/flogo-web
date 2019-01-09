import { Injectable } from '@angular/core';
import { ContribSchema } from '../../../interfaces';
import { map } from 'rxjs/operators';
import { FLOGO_CONTRIB_TYPE } from '../../../constants';
import { RestApiService } from '../rest-api.service';
import { Observable } from 'rxjs';

interface InstallationData {
  url: string;
  type?: string;
}

@Injectable()
export class RESTAPIContributionsService {
  constructor(private restApi: RestApiService) {}

  getContributionDetails<T extends ContribSchema = ContribSchema>(
    ref: string
  ): Promise<T> {
    return this.restApi
      .get<Array<T>>(this.getApiPath() + '?filter[ref]=' + ref)
      .pipe(map(([schema]) => schema))
      .toPromise();
  }

  getShimContributionDetails<T extends ContribSchema = ContribSchema>() {
    return this.restApi.get<T[]>(this.getApiPath() + '?filter[shim]=' + true).toPromise();
  }

  listContribs<T extends ContribSchema = ContribSchema>(type: FLOGO_CONTRIB_TYPE) {
    return this.restApi.get<T[]>(this.getApiPath() + '?filter[type]=' + type).toPromise();
  }

  installContributions({
    installType,
    url,
  }): Observable<{ details: string; ref: string; originalUrl: string }> {
    const body = this.prepareBodyData(installType, url);
    return this.restApi.post(this.getApiPath(), body);
  }

  private prepareBodyData(type, url): InstallationData {
    const data: InstallationData = { url };
    data.type = type;
    return data;
  }

  private getApiPath(): string {
    return 'contributions/microservices';
  }
}
