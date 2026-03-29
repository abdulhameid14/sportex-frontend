import { IDepartment } from "./IDepartment";
import { IUser } from "./IUser";

export interface IRecruitment{
  id?: string;
  tenantId?: string;
  position: string;
  department?: IDepartment;
  departmentId: string;
  description?: string;
  createdBy?: IUser;
  createdById?: string;
  requirements?: IRequirement[];
  status: recruitmentStatus;
  applications?: IApplication[];
  active: boolean;
  attachments?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export enum recruitmentStatus {
  OPEN = "OPEN",
  CLOSED = "CLOSED",
  FILLED = "FILLED",
}

export interface IRequirement {
  title: string;
  description: string;
  mandatory: boolean;
}

export interface IApplication {
  applicantName: string;
  applicantEmail: string;
  resume: string;
}
