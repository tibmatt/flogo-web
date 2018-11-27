import { ParseResult } from 'flogo-parser';

export interface SettingValue {
  viewValue: string;
  parsedValue: any;
  parsingDetails?: ParseResult;
}
