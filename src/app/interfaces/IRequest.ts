import { IDepartment } from "./IDepartment";
import { IEmployee } from "./IEmployee";
import { IProject } from "./IProject";
import { ITask } from "./ITask";

export interface IRequest {
  id?: string;
  tenantId: string;
  type?: IRequestType;
  typeId: string;
  title: string;
  description: string;
  department?: IDepartment;
  departmentId: string;
  projectId?: string;
  project?: IProject;
  taskId?: string;
  task?: ITask;
  budget?: number;
  count?: number;
  requesterEmployee?: IEmployee;
  requesterEmployeeId: string;
  assigneeEmployeeId: string;
  assigneeEmployee?: IEmployee;
  status: status;
  signers?: IRequestSigners[];
  action?: request_action;
  documentToSign?: string;
  to?: string;
  attachments?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  fee?: boolean;
}

export interface IRequestType {
  id?: string;
  name: string;
  description?: string;
  tenantId?: string;
  templateDocument?: string;
  signers?: IRequestTypeSigners[]
  requests?: IRequest[]
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  fee?: boolean;
}

export interface IRequestSigners {
  id?: string;
  request?: IRequest;
  requestId: string;
  employee?: IEmployee;
  employeeId: string;
  order: number;
  signedAt?: Date;
  status: status;
  comment?: string;
  deletedAt?: Date;
}

export interface IRequestTypeSigners {
  id?: string;
  requestType?: IRequestType;
  requestTypeId: string;
  employee?: IEmployee;
  employeeId: string;
  order: number;
  deletedAt?: Date;
}

export enum request_action {
  Transaction = 'Transaction'
}

export enum status {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}
