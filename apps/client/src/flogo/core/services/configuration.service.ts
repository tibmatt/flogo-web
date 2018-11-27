import { Injectable } from '@angular/core';
import { ServiceUrlConfig } from '@flogo-web/client/core/services/service-url-config.model';
import { RestApiService } from '@flogo-web/client/core/services/restapi';

@Injectable()
export class ConfigurationService {
  constructor(private restApi: RestApiService,
  ) {}

  getConfig() {
    return this.restApi.get('services');
  }

  resetEngine() {
    return this.restApi.post('engine/restart');
  }

  pingService(config: ServiceUrlConfig) {
    return this.restApi.get(`services/${config.name}/health`);
  }

}
