import { IEmployee } from './IEmployee';
import { IDepartment } from './IDepartment';

export interface IExternalReport {
  id?: string;
  tenantId?: string | null;
  title: string;
  content: string;
  creatorId?: string;
  departmentId?: string | null;
  assignedToId?: string | null;
  signed?: boolean;
  attachments?: string | null;
  documentToSign?: string | null;
  department?: IDepartment | null;
  assignedTo?: IEmployee | null;
  creator?: IEmployee | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}
