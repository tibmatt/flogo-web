import { Component } from '@angular/core';
import { updateFlogoGlobalConfig, formatServerConfiguration } from '../../../common/utils';
import { Router, CanActivate } from '@angular/router-deprecated';
import { ServiceStatusIndicatorComponent } from './service-status-indicator.component';
import { Http, Headers, RequestOptions } from '@angular/http';
import { RESTAPIConfigurationService } from '../../../common/services/restapi/configuration-api-service';
import { ConfigurationService } from '../../../common/services/configuration.service';
import { isConfigurationLoaded } from '../../../common/services/configurationLoaded.service'

const MAIN_DB = 'db';
const DBS_ARR = [ 'activities', 'triggers', MAIN_DB ];
const SERVERS_ARR = [ 'engine', 'stateServer', 'flowServer' ];

@Component( {
  selector : 'flogo-config',
  moduleId : module.id,
  directives: [ServiceStatusIndicatorComponent],
  templateUrl : 'config.tpl.html',
  styleUrls : [ 'config.component.css' ]
} )

@CanActivate((next) => {
  return isConfigurationLoaded();
})
export class FlogoConfigComponent {
  private _config : any;
  private _servers : any[];
  private _dbs : any[];
  private _appDB : any;
  private location = location; // expose window.location

  constructor( private _router : Router, private http:Http, private _RESTAPIConfigurationService:RESTAPIConfigurationService, private _configurationService: ConfigurationService  ) {
    this.init();
  }

  init() {
        this._config = this._configurationService.configuration;
        this._appDB = _.cloneDeep( this._config[MAIN_DB] );

        this._dbs = _.reduce( this._config, ( result : any[], value : any, key : string ) => {
          if ( DBS_ARR.indexOf( key ) !== -1 ) {
            if(!value.testPath) {
              value.testPath = value.name;
            }

            value.name = value.testPath;
            result.push( {
              _label : _.startCase( key ),
              _key : key,
              config : value
            } );
          }

          return result;
        }, [] );

        this._servers = _.reduce( this._config, ( result : any[], value : any, key : string ) => {
          if ( SERVERS_ARR.indexOf( key ) !== -1 ) {
            let _display = false;

            // for now we just has the restart feature for 8080(default engine)
            if(value&&value.port == '8080'){
              _display = true
            }
            value.name = key;
            result.push( {
              _label : _.startCase( key ),
              _key : key,
              _display: _display,
              config : value
            } );
          }

          return result;
        }, [] );




      //});




  }

  onSave() {
    let config = <any>{};

    //config.db = _.cloneDeep( this._appDB );

    _.each( this._servers, ( server : any )=> {
      if ( SERVERS_ARR.indexOf( server._key ) !== -1 ) {
        config[ server._key ] = _.cloneDeep( server.config );
      }
    } );

    _.each( this._dbs, ( db : any )=> {
      if ( DBS_ARR.indexOf( db._key ) !== -1 ) {
        config[ db._key ] =  _.cloneDeep( db.config ) ;
      }
    } );


    console.groupCollapsed( 'Save configuration' );
    console.log( _.cloneDeep( config ) );
    console.groupEnd();

    updateFlogoGlobalConfig( config );
    this._RESTAPIConfigurationService.setConfiguration(config)
        .then((res:any) => {
    });
  }

  onCancel() {
    this._router.navigate( [ 'FlogoHome' ] );
  }

  onRestart(server:any){
    console.log(server);
    let port = server&&server.config&&server.config.port||undefined;
    if(port == '8080'){
      let headers = new Headers(
        {
          'Accept' : 'application/json'
        }
      );

      let options = new RequestOptions( { headers : headers } );

      this.http.get( `/v1/api/engine/restart`, options )
        .toPromise()
        .then((res)=>{
          console.log("Restart test engine successful. res: ", res);
        }).catch((err)=>{
          console.log("Restart test engine errror. err: ", err);
        });

    }
  }

  onRestartBuild(){
    let headers = new Headers(
      {
        'Accept' : 'application/json'
      }
    );

    let options = new RequestOptions( { headers : headers } );

    this.http.get( `/v1/api/engine/restart?name=build`, options )
      .toPromise()
      .then((res)=>{
        console.log("Restart build engine successful. res: ", res);
      }).catch((err)=>{
        console.log("Restart build engine errror. err: ", err);
      });
  }

  onResetDefault () {
    /*
    this._RESTAPIConfigurationService.getConfiguration()
        .then((res:any) => {
          try {
            let config:any = JSON.parse(res._body);
            (<any>window).FLOGO_GLOBAL = formatServerConfiguration(config);
            this.init();
          }catch(err) {
            console.log(err);
          }
        });
    */
    //resetFlogoGlobalConfig();
  }

  getDatabaseName(db) {
    db = db || "";
    return db.replace("Database","");
  }
}
