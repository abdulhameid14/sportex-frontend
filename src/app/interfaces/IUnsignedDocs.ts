export interface IUnsignedDocs {
  id: string;
  requestId?: string;
  comment?: string;
  action: action;
  createdAt?: Date;
}

export enum action {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT'
}
