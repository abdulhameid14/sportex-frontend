import { IUser } from "./IUser";

export interface IRole {
  id?: string;
  tenantId?: string;
  name: string;
  users?: IUser[];
  permissions: IRolePermission[];
  deletedAt?: Date;
}

export interface IPermission {
  id: string;
  code: string;
  description: string;
  roles?: IRolePermission[];
}

export interface IRolePermission {
  id: string;
  role: IRole;
  roleId: string;
  permission: IPermission;
  permissionId: string;
  deletedAt?: Date;
}
