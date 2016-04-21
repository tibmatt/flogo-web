import {Component, Input, OnInit, DoCheck, OnDestroy} from 'angular2/core';
import {Http} from 'angular2/http';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject,Subscription} from "rxjs/Rx";

const PING_INTERVAL_MS = 2000;

@Component({
  selector: 'flogo-_config-service-status-indicator',
  moduleId: module.id,
  template: `<i class="fa" [style.color]="color"
                [ngClass]="{'fa-circle': status == 'reached' || status == 'not-reached', 'fa-circle-o': !status}"></i>`
})
export class ServiceStatusIndicatorComponent implements OnInit, DoCheck, OnDestroy {

  @Input() urlConfig:{protocol:string, host:string, port:string, name?:string} = null;
  status : string = null;

  private configChangeSubject : BehaviorSubject<any> = null;
  private subscription : Subscription = null;
  private colors : any = {
    'reached': 'green',
    'not-reached': 'red',
    'unknown': 'orange'
  };

  constructor(private http:Http) {
    this.configChangeSubject = new BehaviorSubject(this.buildUrl());
  }

  ngOnInit() {
    let configChangeStream = this.configChangeSubject.distinctUntilChanged();

    configChangeStream.subscribe(() => this.status = null);

    this.subscription = Observable
      .interval(PING_INTERVAL_MS)
      .combineLatest(configChangeStream)
      .map(combined => combined[1])
      .map((url:string) => this.http.get(url))
      .switch()
      .catch((error:any) => {
        // status 200 means no response from server
        if(error.status != 200) {
          this.status = 'reached';
        } else {
          this.status = 'not-reached'
        }
        // TODO: report if error 500?
        // TODO: when there are cors issues we get also 200 code
        return Observable.throw(error);
      })
      .retry()
      .subscribe((result:any) => this.status = 'reached');

  }

  ngDoCheck() {
    this.configChangeSubject.next(this.buildUrl());
  }

  ngOnDestroy() {
    if(this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  get color() {
    return this.colors[this.status] || this.colors.unknown;
  }

  private buildUrl() {
    if(this.urlConfig) {
      let config = this.urlConfig;
      let port = this.urlConfig.port ? `:${this.urlConfig.port}` : '';
      let name = this.urlConfig.name ? `/${this.urlConfig.name}` : '';
      return `${config.protocol}://${config.host}${port}${name}`;
    }
    return null;
  }


}
