import { IDepartment } from "./IDepartment";
import { IEmployee } from "./IEmployee";
import { IRequest } from "./IRequest";

export interface ITask {
  id?: string;
  tenantId: string; // Branch name
  title: string;
  description: string;
  priority: number; // 1 (highest) to 10 (lowest)
  department?: IDepartment;
  departmentId: string;
  status: taskStatus;
  assignedToEmployee?: IEmployee;
  assignedToEmployeeId: string;
  createdByEmployee?: IEmployee;
  createdByEmployeeId: string;
  consultantEmployee?: IEmployee;
  consultantEmployeeId: string;
  attachments?: string;
  deadline: Date;
  createdAt?: Date;
  updatedAt?: Date;
  submittedAt?: Date;
  deletedAt?: Date;
  submissionAttachments?: string;
  request?: IRequest[];
}

export enum taskStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  REVIEW = 'REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}
