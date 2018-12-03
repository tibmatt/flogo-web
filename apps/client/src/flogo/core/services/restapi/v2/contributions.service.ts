import { Injectable } from '@angular/core';
import { ContribSchema } from '@flogo-web/client/core';
import { map } from 'rxjs/operators';
import { FLOGO_CONTRIB_TYPE, FLOGO_PROFILE_TYPE } from '@flogo-web/client/core/constants';
import { RestApiService } from '../rest-api.service';
import { Observable } from 'rxjs';

interface InstallationData {
  url: string;
  type?: string;
}

@Injectable()
export class RESTAPIContributionsService {
  contributionPathByProfileType = new Map<FLOGO_PROFILE_TYPE, string>([
    [FLOGO_PROFILE_TYPE.MICRO_SERVICE, 'contributions/microservices'],
    [FLOGO_PROFILE_TYPE.DEVICE, 'contributions/devices'],
  ]);

  constructor(private restApi: RestApiService) {}

  getContributionDetails<T extends ContribSchema = ContribSchema>(
    profileType: FLOGO_PROFILE_TYPE,
    ref: string
  ): Promise<T> {
    return this.restApi
      .get<Array<T>>(this.getApiPath(profileType) + '?filter[ref]=' + ref)
      .pipe(map(([schema]) => schema))
      .toPromise();
  }

  getShimContributionDetails<T extends ContribSchema = ContribSchema>(profileType: FLOGO_PROFILE_TYPE) {
    return this.restApi.get<T[]>(this.getApiPath(profileType) + '?filter[shim]=' + true).toPromise();
  }

  listContribs<T extends ContribSchema = ContribSchema>(profileType: FLOGO_PROFILE_TYPE, type: FLOGO_CONTRIB_TYPE) {
    return this.restApi.get<T[]>(this.getApiPath(profileType) + '?filter[type]=' + type).toPromise();
  }

  installContributions({
    profileType,
    installType,
    url,
  }): Observable<{ details: string; ref: string; originalUrl: string }> {
    const body = this.prepareBodyData(profileType, installType, url);
    return this.restApi.post(this.getApiPath(profileType), body);
  }

  private prepareBodyData(profileType, type, url): InstallationData {
    const data: InstallationData = { url };
    if (profileType === FLOGO_PROFILE_TYPE.MICRO_SERVICE) {
      data.type = type;
    }
    return data;
  }

  private getApiPath(profileType: FLOGO_PROFILE_TYPE): string {
    const pathToContribution = this.contributionPathByProfileType.get(profileType);
    if (!pathToContribution) {
      throw new Error(`Contributions API path for '${FLOGO_PROFILE_TYPE[profileType]}' profile is not found`);
    }
    return pathToContribution;
  }
}
