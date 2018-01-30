import * as mode from './mode';
import { LanguageServiceDefaultsImpl } from './language-service-defaults-impl';
import { load as loadTokenizer } from './tokenizer';

export function load() {
  const languageId = 'flogomapping';
  const diagnosticDefault: monaco.languages.json.DiagnosticsOptions = {};
  const langDefaults = new LanguageServiceDefaultsImpl(languageId, diagnosticDefault);

  monaco.languages.register({
    id: languageId,
    extensions: [],
  });
  monaco.languages.onLanguage(languageId, () => {
    mode.setupMode(langDefaults);
  });
  monaco.languages.setMonarchTokensProvider(languageId, <any>loadTokenizer());
  monaco.languages.setLanguageConfiguration(languageId, {
    brackets: [
      ['{', '}'],
      ['[', ']']
    ],

    autoClosingPairs: [
      { open: '{', close: '}', notIn: ['string'] },
      { open: '[', close: ']', notIn: ['string'] },
      { open: '"', close: '"', notIn: ['string'] }
    ]
  });
}
