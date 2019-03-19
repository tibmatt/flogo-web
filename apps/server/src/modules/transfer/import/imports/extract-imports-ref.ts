import { ContributionSchema, ContributionType } from '@flogo-web/core';
import { ImportsRefAgent } from '@flogo-web/server/core';
import { ParsedImport } from '../../common/parsed-import';
import { parseImports } from '../../common/parse-imports';

export function createFromImports(
  imports: string[],
  contribSchemas: Map<string, ContributionSchema>
): ImportsRefAgent {
  const parsedImports = parseImports(imports || []);
  return new ExtractImportsRef(parsedImports, contribSchemas);
}

export class ExtractImportsRef implements ImportsRefAgent {
  private imports: Map<ContributionType, Map<string, string>>;
  constructor(
    parsedImports: ParsedImport[],
    contribSchemas: Map<string, ContributionSchema>
  ) {
    this.imports = new Map();
    Object.values(ContributionType).forEach(type =>
      this.imports.set(type, new Map<string, string>())
    );
    parsedImports.forEach(parsedImport => {
      const contrib = contribSchemas.get(parsedImport.ref);
      if (contrib) {
        this.imports.get(contrib.type).set(parsedImport.type, parsedImport.ref);
      }
    });
  }

  getPackageRef(category: ContributionType, alias: string) {
    return this.imports.get(category).get(alias);
  }
}
