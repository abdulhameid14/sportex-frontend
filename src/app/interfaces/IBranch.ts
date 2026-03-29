export interface IBranch {
  id?: string;
  name: string;
  logo?: string | null;
  modules?: string[];
  enabledModuleKeys?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
