import { IDepartment } from "./IDepartment";

export interface IStrategy {
  id?: string;
  tenantId?: string;
  title?: string;
  description?: string;
  goals?: IGoal[];
  budget: number;
  department?: IDepartment;
  departmentId: string;
  active: boolean;
  attachments?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface IGoal {
  name: string;
  description: string;
  deadline?: Date;
  reach: number;
  budget?: number;
  expenses?: number;
}
