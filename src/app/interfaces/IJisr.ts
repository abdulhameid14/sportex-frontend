export interface IJisrAttendanceSummary {
  id: string;
  code: string;
  name: string;
  total_working_hours: string;
  total_working_hours_inside_the_shifts: string;
  late_arrival: string;
  excuse_late_arrival: string;
  early_departure: string;
  excuse_early_departure: string;
  extra_working_time: string;
  approved_overtime: string;
  absence: number;
  no_records: number;
  leave_days: number;
  off_days: number;
  full_day_excuses: number;
  businiess_trip_days: number;
  worked_days: number;
  late_arrival_days: number;
  early_departure_days: number;
}

export interface IJisrPunchRecord {
  id: number;
  punch_time: string;
  employee_code: string;
  terminal_sn: string | null;
  clocking_id: number;
}

export enum paygroup_id {
  payrun = 'payrun',
  final_settlements = 'final_settlements',
  vacations_settlements = 'vacations_settlements',
  out_off_payroll_transactions = 'out_off_payroll_transactions'
}
