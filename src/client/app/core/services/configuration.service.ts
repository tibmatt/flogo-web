import { Injectable } from '@angular/core';
import { RESTAPIConfigurationService } from './restapi/configuration-api-service';
import { formatServerConfiguration } from '../../shared/utils';
import { Http, URLSearchParams } from '@angular/http';
import { HttpUtilsService } from './restapi/http-utils.service';

export interface ServiceUrlConfig {
  protocol: string;
  host: string;
  port: string;
  name?: string;
  testPath?: string;
}

@Injectable()
export class ConfigurationService {
  // TODO define config interface
  public configuration: any;
  configurationName: string;

  constructor(private _APIConfiguration: RESTAPIConfigurationService,
              private http: Http,
              private httpUtils: HttpUtilsService
  ) {
    this.configuration = null;
    this.configurationName = 'FLOGO_GLOBAL';
  }

  getLocalOrServerConfiguration() {
    return this.getFromServer();
  }

  getConfiguration() {

    return new Promise((resolve, reject) => {
      if (this.configuration) {
        resolve(this.configuration);
      } else {
        this.getLocalOrServerConfiguration()
          .then((config) => {
            this.configuration = config;
            resolve(this.configuration);
          });
      }

    });

  }

  getFromServer() {

    return new Promise((resolve, reject) => {

      this._APIConfiguration.getConfiguration()
        .then((res) => {
          try {
            const config = formatServerConfiguration(res.json());
            resolve(config);
          } catch (exc) {
            reject(exc);
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  save() {
    this._APIConfiguration.setConfiguration(this.configuration);

  }

  resetConfiguration() {

    return new Promise((resolve, reject) => {

      this._APIConfiguration.resetConfiguration()
        .then(() => {
          this.getFromServer()
            .then((config: any) => {
              this.configuration = config;
              resolve(config);
            });
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  resetEngine() {
    return this.http.get(
      this.httpUtils.apiPrefix('engine/restart', 'v1'), this.httpUtils.defaultOptions()
    );
  }

  restartBuild() {
    const queryParams = new URLSearchParams();
    queryParams.set('name', 'build');
    return this.http.get(
      this.httpUtils.apiPrefix('engine/restart', 'v1'),
      this.httpUtils.defaultOptions({ search: queryParams })
    );
  }

  pingService(config: ServiceUrlConfig) {
    return this.http.post(
      this.httpUtils.apiPrefix('ping/service', 'v1'),
      { config },
      this.httpUtils.defaultOptions()
    );
  }

}
