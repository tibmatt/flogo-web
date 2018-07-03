import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpUtilsService } from './restapi/http-utils.service';
import { ServiceUrlConfig } from '@flogo/core/services/service-url-config.model';

@Injectable()
export class ConfigurationService {
  // TODO define config interface
  public configuration: any;
  configurationName: string;

  constructor(private http: HttpClient,
              private httpUtils: HttpUtilsService
  ) {
    this.configuration = null;
    this.configurationName = 'FLOGO_GLOBAL';
  }

  resetEngine() {
    return this.http.get(this.httpUtils.apiPrefix('engine/restart', 'v1'));
  }

  restartBuild() {
    const queryParams = new URLSearchParams();
    queryParams.set('name', 'build');
    return this.http.get(
      this.httpUtils.apiPrefix('engine/restart', 'v1'),
      { params: { name: 'build' } },
    );
  }

  pingService(config: ServiceUrlConfig) {
    return this.http.post(this.httpUtils.apiPrefix('ping/service', 'v1'),  { config });
  }

}
