import { ImportErrorFormatterService } from './message.formatter.service';
import { TranslateService } from 'ng2-translate';
import { mockImportErrorResponse } from '../mocks/error.response.mock';
import Spy = jasmine.Spy;

describe('Service: ImportErrorFormatterService', function (this: {
  service: ImportErrorFormatterService,
  mockTranslateService: TranslateService
}) {
  beforeEach(() => {
    this.mockTranslateService = jasmine.createSpyObj<TranslateService>('translateService', [
      'instant'
    ]);
    this.service = new ImportErrorFormatterService(this.mockTranslateService);
  });

  it('Should return the proper validation error label', () => {
    const spyTranslateService = <Spy>this.mockTranslateService.instant;
    spyTranslateService.and.callFake(function (key) {
      return key;
    });
    const errorLabel = this.service.formatMessageHeader(mockImportErrorResponse[0].meta.details[0].keyword);
    expect(errorLabel).toEqual('IMPORT-ERROR:TYPE_MISMATCH');
  });

  it('Should return the proper validation error message', () => {
    const spyTranslateService = <Spy>this.mockTranslateService.instant;
    spyTranslateService.and.callFake(function (key) {
      return key;
    });
    const errorLabel = this.service.formatErrorMessage(mockImportErrorResponse[0].meta.details[2]);
    expect(errorLabel).toEqual('IMPORT-ERROR:ACTIVITY_MISSING_CONTENT');
  });
});
