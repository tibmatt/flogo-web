import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/from';
import { LanguageService } from '@flogo/core';
import { Injectable } from '@angular/core';

@Injectable()
export class FakeLanguageService implements LanguageService {
  get(key: string | Array<string>, interpolateParams?: Object): Observable<string | any> {
    return Observable.of([key]);
  }

  instant(key: string | Array<string>, interpolateParams?: Object): string | any {
    return key;
  }
}



