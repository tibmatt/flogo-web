import { ParsedImport } from '../../common/parsed-import';
import { parseImports } from './parse-imports';

export class TypeToRefAgent {
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

export function createFromImports(imports: string[]): TypeToRefAgent {
  const parsedImports = parseImports(imports || []);
  return new TypeToRefAgent(parsedImports);
}
