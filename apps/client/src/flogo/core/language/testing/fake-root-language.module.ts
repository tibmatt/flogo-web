import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '@flogo-web/client/core';
import { NgModule } from '@angular/core';

@NgModule({
  imports: [ TranslateModule.forRoot() ],
  providers: [  { provide: LanguageService, useExisting: TranslateService } ],
  exports: [ TranslateModule ],
})
export class FakeRootLanguageModule {
}
