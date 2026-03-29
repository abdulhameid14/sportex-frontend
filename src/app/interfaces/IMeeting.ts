import { IEmployee } from "./IEmployee";
export interface IMeeting {
  id: string;
  tenantId: string;
  title: string;
  participants: Participant[] ;
  deadline: string;
  createdById: string;
  departmentId: string;
  attachments: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;

}
export interface Participant {
  userId: string;
  vote: string;
  comment: string;
}
