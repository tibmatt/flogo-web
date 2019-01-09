export interface ContributionsService {
  find(terms?: object, options?: object): Promise<any[]>;
}
