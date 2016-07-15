import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class RESTAPIPingService {
    constructor(private http:Http) {
    }

    getConfiguration() {
        return this.http.get('/v1/api/ping/configuration')
                    .toPromise();
    }
}
