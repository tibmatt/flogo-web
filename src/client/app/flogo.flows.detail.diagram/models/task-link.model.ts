export interface IFlogoTaskLink {
  id: string;
  from: string;
  to: string
  name ? : string;
};

export class FlogoTaskLink {
  static genTaskLinkID( ): string {
    return btoa( 'FlogoTaskLink::' + Date.now( ) );
  };
}
