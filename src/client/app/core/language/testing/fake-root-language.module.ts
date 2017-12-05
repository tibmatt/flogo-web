import { TranslateModule, TranslateService } from 'ng2-translate';
import { LanguageService } from '@flogo/core';
import { NgModule } from '@angular/core';

@NgModule({
  imports: [ TranslateModule.forRoot() ],
  providers: [  { provide: LanguageService, useExisting: TranslateService } ],
  exports: [ TranslateModule ],
})
export class FakeRootLanguageModule {
}
