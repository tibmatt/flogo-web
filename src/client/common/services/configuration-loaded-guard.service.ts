import { Injector } from '@angular/core';
import { ConfigurationService } from './configuration.service';

import { Injectable }     from '@angular/core';
import { CanActivate }    from '@angular/router';

@Injectable()
export class ConfigurationLoadedGuard implements CanActivate {

  private _config : ConfigurationService;

  constructor(config : ConfigurationService) {
    this._config = config;
  }

  canActivate() {

    console.log('can activate');

    return this._config.getConfiguration()
      .then(() => {
        console.log('got config');
        return true;
      })
      .catch((err) => {
        console.log('dd not get sconfig');
        console.log(err);
        return false;
      });
  }
}
