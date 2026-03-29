import { IAnnouncement } from "./IAnnouncement";
import { IEmployee } from "./IEmployee";
import { IRecruitment } from "./IRecruitment";
import { IRole } from "./IRole";
import { IUserPerformance } from "./IUserPerformance";

export interface IUser {
  id: string;
  tenantId: string;
  email: string;
  devices?: any[];
  passwordHash: string;
  signature?: string;
  role?: IRole;
  roleId?: string;
  nationalId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  jisrEmployeeId?: string;
  otp?: string;
  employee?: IEmployee;
  announcements?: IAnnouncement[];
  userPerformances?: IUserPerformance[];
  recruitments?: IRecruitment[];
}
