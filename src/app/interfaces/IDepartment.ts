import { IAnnouncement } from "./IAnnouncement";
import { IEmployee } from "./IEmployee";
import { IRecruitment } from "./IRecruitment";
import { IReport } from "./IReport";
import { IRequest } from "./IRequest";
import { IStrategy } from "./IStrategy";
import { ITask } from "./ITask";

export interface IDepartment {
  id?: string;
  tenantId?: string;
  name: string;
  employees?: IEmployee[];
  Strategies?: IStrategy[];
  announcements?: IAnnouncement[];
  Recruitments?: IRecruitment[];
  Requests?: IRequest[];
  Tasks?: ITask[];
  reports?: IReport[];
  deletedAt?: Date;
}
