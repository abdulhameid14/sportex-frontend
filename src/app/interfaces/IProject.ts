import { IEmployee } from "./IEmployee";
import { IRequest } from "./IRequest";

export interface IProject {
  id?: string;
  name: string;
  tenantId?: string;
  terms?: ITerm[];
  managers?: IEmployee[];
  workers?: IEmployee[];
  totalBudget: number;
  document?: string;
  attachments?: string;
  request?: IRequest[];
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface ITerm {
  title: string;
  description: string;
  budget: number;
}
