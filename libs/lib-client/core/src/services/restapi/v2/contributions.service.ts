import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ContributionSchema } from '@flogo-web/core';
import { FLOGO_CONTRIB_TYPE } from '../../../constants';
import { RestApiService } from '../rest-api.service';

interface InstallationData {
  url: string;
  type?: string;
}

@Injectable()
export class ContributionsService {
  constructor(private restApi: RestApiService) {}

  getContributionDetails<T extends ContributionSchema = ContributionSchema>(
    ref: string
  ): Promise<T> {
    return this.restApi
      .get<Array<T>>(this.getApiPath() + '?filter[ref]=' + ref)
      .pipe(map(([schema]) => schema))
      .toPromise();
  }

  getShimContributionDetails<T extends ContributionSchema = ContributionSchema>() {
    return this.restApi.get<T[]>(this.getApiPath() + '?filter[shim]=' + true);
  }

  listContribs<T extends ContributionSchema = ContributionSchema>(
    type: FLOGO_CONTRIB_TYPE
  ) {
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
