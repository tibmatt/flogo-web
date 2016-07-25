import { Injectable } from '@angular/core';
import { RESTAPIConfigurationService } from './restapi/configuration-api-service';
import { formatServerConfiguration } from '../../common/utils';


@Injectable()
export class ConfigurationService {
    // TODO define config interface
    public configuration: any;
    configurationName: string;

    constructor(private _APIConfiguration:RESTAPIConfigurationService) {
        this.configuration = null;
        this.configurationName = 'FLOGO_GLOBAL';
    }

    getLocalOrServerConfiguration() {

        return new Promise((resolve, reject) => {
            //firs try local
            let config: any  = this.getFromLocalStorage();

            if(!config) {
                // if not get from server
                this.getFromServer()
                    .then((configuration:any) => {
                        resolve(configuration)
                    })
                    .catch((err) => {
                        reject(err);
                    })
            } else {
                resolve(config);
            }
        });

    }

    getConfiguration() {

        return new Promise((resolve, reject) => {
            if(this.configuration) {
                resolve(this.configuration)
            } else {
                this.getLocalOrServerConfiguration()
                    .then((config) => {
                        this.configuration = config;
                        resolve(this.configuration);
                    })
            }

        });

    }

    getFromLocalStorage() : any {
        var config: any;

        if ( localStorage ) {
            config = localStorage.getItem( this.configurationName );

            if ( config ) {

                try {
                    config = JSON.parse( config );
                } catch ( e ) {
                    console.warn( e );
                }

                //updateFlogoGlobalConfig( config );
                return config;
            }
        }

        return config;
    }

    getFromServer() {

        return new Promise((resolve, reject) => {

            this._APIConfiguration.getConfiguration()
                    .then((res) => {
                        try {
                            var config = formatServerConfiguration(res.json());
                            this.saveToLocalStorage(config);
                            resolve(config);
                        }catch(exc) {
                            reject(exc);
                        }
                    })
                    .catch((err) => {
                        reject(err);
                    })
        });
    }

    saveToLocalStorage(config) {

        if ( localStorage ) {
            localStorage.setItem( this.configurationName, JSON.stringify( config ) );
        }

    }

    save() {
        this._APIConfiguration.setConfiguration(this.configuration)
            .then((res:any) => {
                this.saveToLocalStorage(this.configuration);
            });

    }


    resetConfiguration () {

        return new Promise((resolve, reject) => {

            this._APIConfiguration.resetConfiguration()
                .then(() => {
                    this.getFromServer()
                        .then((config:any) => {
                            this.configuration = config;
                            resolve(config);
                    });
                })
                .catch((err) => {
                    reject(err);
                })
        });
    }


}
