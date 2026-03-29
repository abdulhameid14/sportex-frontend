import { IDepartment } from "./IDepartment";
import { IEmployee } from "./IEmployee";

export interface IReport {
  id?: string;
  tenantId?: string;
  title?: string;
  content?: string;
  creator?: IEmployee;
  creatorId?: string;
  department?: IDepartment;
  departmentId?: string;
  data?: IReportData;
  attachments?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

interface IReportData {
  reportType: reportType;
  reportTypeObject: ITypeObject;
}

interface ITypeObject {
  title: string;
  description: string;
  fees: number;
  date: Date;
}

export enum reportType {
  Support = 'Support',
  Transaction = 'Transaction',
}
