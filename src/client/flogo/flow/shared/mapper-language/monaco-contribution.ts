import * as mode from './mode';
import { LanguageServiceDefaultsImpl } from './language-service-defaults-impl';

export function load() {
  const diagnosticDefault: monaco.languages.json.DiagnosticsOptions = {
  };
  const langDefaults = new LanguageServiceDefaultsImpl('flogomapping', diagnosticDefault);

  monaco.languages.register({
    id: 'flogomapping',
    extensions: [],
  });
  monaco.languages.onLanguage('flogomapping', () => {
    mode.setupMode(langDefaults);
  });

}
