import { Provider } from '@angular/core';
import { LanguageService } from '../..';
import { FakeLanguageService } from './fake-language.service';

export const fakeLanguageProvider: Provider = {
  provide: LanguageService,
  useClass: FakeLanguageService,
};
