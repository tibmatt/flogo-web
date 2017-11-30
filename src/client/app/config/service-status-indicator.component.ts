import { Component, Input, OnInit, DoCheck, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { IntervalObservable } from 'rxjs/observable/IntervalObservable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/switchMap';

import { getURL } from '../shared/utils';
import { ConfigurationService } from '@flogo/core/services/configuration.service';
import { ServiceUrlConfig } from '@flogo/core/services/configuration.service';

const PING_INTERVAL_MS = 2500;

@Component({
  selector: 'flogo-config-service-status-indicator',
  template: `
    <i [title]="info" class="fa" [style.color]="color"
       [ngClass]="{'fa-circle': status == 'online' || status == 'offline' || status == 'online-warning', 'fa-circle-o': !status}">       
    </i>`
})
export class ServiceStatusIndicatorComponent implements OnInit, DoCheck, OnDestroy {

  @Input() urlConfig: ServiceUrlConfig = null;
  status: string = null;
  statusCode: any = null;

  private configChangeSubject: BehaviorSubject<any> = null;
  private subscription: Subscription = null;
  private colors: any = {
    'online': 'green',
    'online-warning': 'gold',
    'offline': 'red',
    'unknown': 'orange'
  };

  constructor(private configService: ConfigurationService) {
    this.configChangeSubject = new BehaviorSubject(this.urlConfig);
  }

  ngOnInit() {
    const configChangeStream = this.configChangeSubject.distinctUntilChanged();

    configChangeStream.subscribe(() => this.status = null);

    this.subscription = IntervalObservable.create(PING_INTERVAL_MS)
      .combineLatest(configChangeStream, (_, config) => config)
      .switchMap((config: ServiceUrlConfig) => this.configService.pingService(config))
      .catch((error: any) => {
        this.statusCode = error.status;
        // status 200 means no response from server
        if (error.status !== 500) {
          this.status = 'online-warning';
        } else {
          this.status = 'offline';
        }
        // TODO: report if error 500?
        // TODO: when there are cors issues we get also 200 code
        return Observable.throw(error);
      })
      .retry()
      .subscribe((result: any) => {
        this.status = 'online';
        this.statusCode = result.status;
      });

  }

  ngDoCheck() {
    this.configChangeSubject.next(this.urlConfig);
  }

  ngOnDestroy() {
    console.log('Destroying', this.buildUrl());
    if (this.subscription) {
      console.log('Unsubscribing');
      this.subscription.unsubscribe();
    } else {
      console.log('Not unsubscribing');
    }
  }

  get color() {
    return this.colors[this.status] || this.colors.unknown;
  }

  get info() {
    if (this.status === 'online-warning') {
      return `Online but returned status code ${this.statusCode}`;
    }
    return '';
  }

  private buildUrl() {
    if (this.urlConfig) {
      const config = this.urlConfig;
      const name = this.urlConfig.name ? `/${this.urlConfig.name}` : '';
      const testPath = this.urlConfig.testPath ? `/${this.urlConfig.testPath}` : '';
      return `${getURL(config)}${name}${testPath}`;
    }
    return null;
  }


}
