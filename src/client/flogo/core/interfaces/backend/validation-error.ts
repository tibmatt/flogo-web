
export interface ServerValidationError {
  meta: ErrorMetaData;
  detail: string;
  status: number;
  title: string;
}

interface ErrorMetaData {
  details: ValidationDetails[];
}

export interface ValidationDetails {
  keyword: string;
  dataPath: string;
  schemaPath: string;
  message: string;
  data: any;
}
