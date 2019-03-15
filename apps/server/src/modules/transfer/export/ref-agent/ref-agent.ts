import { AppImportsAgent } from '@flogo-web/server/core';
import { ParsedImport } from '../../common/parsed-import';
import { FunctionRefFinder } from './function-ref-finder';

const formatImport = ([ref, { type, isAliased }]) => (isAliased ? `${type} ${ref}` : ref);

interface ImportInfo {
  isAliased: boolean;
  type: string;
}

export class RefAgent implements AppImportsAgent {
  private imports = new Map<string, ImportInfo>();
  private uniqueTracker = new Map<string, number>();
  private predetermined = new Map<string, ImportInfo>();

  constructor(
    private functionsReverseLookup: FunctionRefFinder,
    predeterminedImports?: ParsedImport[]
  ) {
    if (predeterminedImports) {
      predeterminedImports.forEach(({ ref, type, isAliased }) => {
        this.predetermined.set(ref, { type, isAliased });
        this.uniqueTracker.set(type, 1);
      });
    }
  }

  registerRef(ref: string): string {
    let importInfo: ImportInfo;
    if (!this.imports.has(ref)) {
      importInfo = this.createImportInfo(ref);
      this.imports.set(ref, importInfo);
    } else {
      importInfo = this.imports.get(ref);
    }
    return importInfo && importInfo.type ? `#${importInfo.type}` : undefined;
  }

  registerFunctionName(functionName: string) {
    const ref = this.functionsReverseLookup.findPackage(functionName);
    if (ref && !this.imports.has(ref)) {
      this.imports.set(ref, { isAliased: false, type: undefined });
    }
  }

  formatImports(): string[] {
    return Array.from(this.imports.entries())
      .sort()
      .map(formatImport);
  }

  private createImportInfo(ref: string): ImportInfo {
    let importInfo: ImportInfo;
    if (this.predetermined.has(ref)) {
      importInfo = this.predetermined.get(ref);
    } else {
      const [defaultType] = ref.split('/').slice(-1);
      importInfo = this.ensureUniqueType(defaultType);
    }
    return importInfo;
  }

  private ensureUniqueType(type: string): { type: string; isAliased: boolean } {
    let isAliased = false;
    if (this.uniqueTracker.has(type)) {
      isAliased = true;
      const repeatCount = this.uniqueTracker.get(type);
      this.uniqueTracker.set(type, repeatCount + 1);
      type = `${type}_${repeatCount}`;
      this.uniqueTracker.set(type, 1);
    } else {
      this.uniqueTracker.set(type, 1);
    }
    return { type, isAliased };
  }
}
