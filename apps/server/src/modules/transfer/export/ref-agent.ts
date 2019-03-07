const formatImport = ([ref, { type, isAliased }]) => (isAliased ? `${type} ${ref}` : ref);

interface ImportInfo {
  isAliased: boolean;
  type: string;
}

export class RefAgent {
  private imports = new Map<string, ImportInfo>();
  private uniqueTracker = new Map<string, number>();

  registerRef(ref: string, skipTypeGen?: boolean): string {
    if (this.imports.has(ref)) {
      return !skipTypeGen ? this.imports.get(ref).type : undefined;
    }

    let importInfo: ImportInfo = { isAliased: false, type: undefined };
    if (!skipTypeGen) {
      const [defaultType] = ref.split('/').slice(-1);
      importInfo = this.ensureUniqueType(defaultType);
    }

    this.imports.set(ref, importInfo);
    return importInfo.type;
  }

  formatImports(): string[] {
    return Array.from(this.imports.entries()).map(formatImport);
  }

  hasRef(ref: string) {
    return this.imports.has(ref);
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
