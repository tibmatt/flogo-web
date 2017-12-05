import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { Http, Response } from '@angular/http';
import { TranslateLoader } from 'ng2-translate';

export class CustomTranslateLoader implements TranslateLoader {
  constructor(private http: Http) {
  }

  public getTranslation(lang: string): Observable<any> {
    return this.http.get(`/i18n/${lang}.json`)
      .map((res: Response) => res.json())
      .catch((err: any) => {
        console.warn(`Could not load translations for language "${lang}"`);
        return Observable.of({});
      });
  }
}
