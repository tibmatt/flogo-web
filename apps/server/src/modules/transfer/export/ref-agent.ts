import { ParsedImport } from '../common/parsed-import';

const formatImport = ([ref, { type, isAliased }]) => (isAliased ? `${type} ${ref}` : ref);

interface ImportInfo {
  isAliased: boolean;
  type: string;
}

export class RefAgent {
  private imports = new Map<string, ImportInfo>();
  private uniqueTracker = new Map<string, number>();
  private predetermined = new Map<string, ImportInfo>();

  constructor(predeterminedImports?: ParsedImport[]) {
    if (predeterminedImports) {
      predeterminedImports.forEach(({ ref, type, isAliased }) => {
        this.predetermined.set(ref, { type, isAliased });
        this.uniqueTracker.set(type, 1);
      });
    }
  }

  registerRef(ref: string, skipTypeGen?: boolean): string {
    if (this.imports.has(ref)) {
      return !skipTypeGen ? this.imports.get(ref).type : undefined;
    }

    let importInfo: ImportInfo = { isAliased: false, type: undefined };
    if (!skipTypeGen) {
      importInfo = this.createImportInfo(ref);
    }

    this.imports.set(ref, importInfo);
    return importInfo.type;
  }

  formatImports(): string[] {
    return Array.from(this.imports.entries()).map(formatImport);
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
