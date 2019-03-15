import { ParsedImport } from '../../common/parsed-import';
import { parseImports } from './parse-imports';
import { ImportsRefAgent } from '@flogo-web/server/core';

export function createFromImports(imports: string[]): ImportsRefAgent {
  const parsedImports = parseImports(imports || []);
  return new ExtractImportsRef(parsedImports);
}

export class ExtractImportsRef implements ImportsRefAgent {
  private imports: Map<string, string>;
  constructor(parsedImports: ParsedImport[]) {
    this.imports = new Map<string, string>(
      parsedImports.map(i => [i.type, i.ref] as [string, string])
    );
  }

  getRef(type: string) {
    return this.imports.get(type);
  }
}
