import { ParsedImport } from '../../common/parsed-import';

const formatImport = ({ type: alias, isAliased, ref }: ParsedImport) =>
  isAliased ? `${alias} ${ref}` : ref;

export const formatImports = (parsedImports: ParsedImport[]) =>
  parsedImports.map(formatImport);
