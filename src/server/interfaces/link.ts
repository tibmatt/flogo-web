export interface Link {
  id: number|string;
  name?: string;
  from: string;
  to: string;
  type?: number;
  value?: string;
}
