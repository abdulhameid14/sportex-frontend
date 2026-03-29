import { IEmployee } from "./IEmployee";
import { IUser } from "./IUser";

export interface IUserPerformance {
  id?: string;
  tenantId?: string;
  employee?: IEmployee;
  employeeId: string;
  reviewPeriod?: string;
  goals?: IGoal[];
  overallRating?: number;
  feedback?: IFeedback[];
  ratifiedBy?: IUser;
  ratifiedById?: string;
  rating?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

interface IGoal {
  title: string;
  description: string;
  status: string;
  comments: string;
}

interface IFeedback {
  from: string;
  comments: string;
}
