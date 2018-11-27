import { ParseResult } from '@flogo-web/parser';

export interface SettingValue {
  viewValue: string;
  parsedValue: any;
  parsingDetails?: ParseResult;
}
