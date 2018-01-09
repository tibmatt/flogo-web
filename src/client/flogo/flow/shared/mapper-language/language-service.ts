import { parse, RecognitionException, LexingError } from 'flogo-mapping-parser';
export class LanguageService {
  static doValidation(expression: string): Promise<Array<RecognitionException|LexingError>> {
    if (!expression || !expression.trim()) {
      return Promise.resolve(<any>[]);
    }
    const parseResult = parse(expression);
    let errors = [];
    if (parseResult.lexErrors && parseResult.lexErrors.length > 0) {
      errors = errors.concat(parseResult.lexErrors);
    }
    if (parseResult.parseErrors && parseResult.parseErrors.length > 0) {
      errors = errors.concat(parseResult.parseErrors);
    }
    return Promise.resolve(errors);
  }
}
