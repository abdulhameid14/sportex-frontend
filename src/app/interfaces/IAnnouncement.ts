import { IDepartment } from "./IDepartment";
import { IUser } from "./IUser";

export interface IAnnouncement{
  id?: string;
  tenantId: string;
  title: string;
  content: string;
  creator?: IUser;
  creatorId?: string;
  department?: IDepartment;
  departmentId: string;
  attachments?: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
