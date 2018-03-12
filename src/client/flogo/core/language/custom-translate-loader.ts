import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';

export class CustomTranslateLoader implements TranslateLoader {
  constructor(private http: HttpClient) {
  }

  public getTranslation(lang: string): Observable<any> {
    return this.http.get(`/i18n/${lang}.json`)
      .catch((err: any) => {
        console.warn(`Could not load translations for language "${lang}"`);
        return Observable.of({});
      });
  }
}

export function createTranslateLoader(http: HttpClient) {
  return new CustomTranslateLoader(http);
}
