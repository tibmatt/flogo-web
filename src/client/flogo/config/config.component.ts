import * as _ from 'lodash';

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ConfigurationService } from '../core/services/configuration.service';

const SEVER_NAMES = ['engine', 'stateServer', 'flowServer'];

@Component({
  selector: 'flogo-config',
  templateUrl: 'config.component.html',
  styleUrls: ['config.component.less']
})
export class FlogoConfigComponent {
  _config: any;
  _servers: any[];
  location = location; // expose window.location

  constructor(private _router: Router, private _configurationService: ConfigurationService) {
    this.init();
  }

  init() {
    this._config = this._configurationService.configuration;

    this._servers = _.reduce(this._config, (result: any[], value: any, key: string) => {
      if (SEVER_NAMES.indexOf(key) !== -1) {
        let _display = false;

        // for now we just has the restart feature for 8080(default engine)
        if (value && (value.port === '8080' || value.port === 8080)) {
          _display = true;
        }
        value.name = key;
        result.push({
          _label: _.startCase(key),
          _key: key,
          _display: _display,
          config: value
        });
      }

      return result;
    }, []);

  }

  onSave() {
    const config = <any>{};

    _.each(this._servers, (server: any) => {
      if (SEVER_NAMES.indexOf(server._key) !== -1) {
        config[server._key] = _.cloneDeep(server.config);
      }
    });

    console.groupCollapsed('Save configuration');
    console.log(_.cloneDeep(config));
    console.groupEnd();
    // this._configurationService.save();

  }

  onCancel() {
    this._router.navigate(['/']);
  }

  onRestart(server: any) {
    console.log(server);
    const port = server && server.config && server.config.port || undefined;
    if (port === '8080' || port === 8080) {
      this._configurationService.resetEngine()
        .toPromise()
        .then((res) => {
          console.log('Restart test engine successful. res: ', res);
        }).catch((err) => {
          console.log('Restart test engine errror. err: ', err);
        });
    }
  }

  onRestartBuild() {
    this._configurationService.restartBuild()
      .toPromise()
      .then((res) => {
        console.log('Restart build engine successful. res: ', res);
      })
      .catch((err) => {
        console.log('Restart build engine errror. err: ', err);
      });
  }

  onResetDefault() {
    // this._configurationService.resetConfiguration()
    //   .then((config) => {
    //     this.init();
    //     console.log('Configuration restored');
    //   });
  }
}
