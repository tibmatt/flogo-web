export interface MapperSchema {
  type: string;
  properties: {[name: string]: { type: string }};
  required?: string[];
  title?: string;
  rootType?: string;
}
