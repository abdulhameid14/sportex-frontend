import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgChartsModule, BaseChartDirective } from 'ng2-charts';
import { TranslateModule } from '@ngx-translate/core';
import { Chart, ChartData, registerables } from 'chart.js';
import { TranslationService } from '../../services/translation';
import { Branch } from '../../services/branch';
import { HasAnyPermissionDirective } from '../../directives/hasAnyPermission';
import { HasPermissionDirective } from '../../directives/has-permission';
import { Hero } from "../hero/hero";
import { CustomTables } from '../../services/custom-tables';
import { ICustomTables } from '../../interfaces/ICustomTables';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NgChartsModule,
    TranslateModule,
    HasAnyPermissionDirective,
    HasPermissionDirective,
    Hero
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit {

  @ViewChild('tasksPieChart') tasksPieChart?: BaseChartDirective;
  @ViewChild('requestsPieChart') requestsPieChart?: BaseChartDirective;

  currentModules: string[] = [];
  dashboardModuleMap: Record<string, string[]> = {
    board: ['board'],
    hr: ['players', 'players_performance'],
    players: ['players'],
    players_performance: ['players_performance'],
    departments: ['players', 'players_performance'],
    finance: ['financial_reports'],
    reports: ['financial_reports'],
    chat: ['chat'],
    tasks: ['tasks'],
    requests: ['requests', 'request_types'],
    request_types: ['request_types'],
    esign: ['sign'],
    jisr: ['jisr'],
    strategy: ['strategies'],
    projects: ['projects'],
    branches: ['branches'],
    recruitment: ['player_scout', 'recruitment'],
    announcement: ['announcements'],
    send_notification: ['send_notification'],
    notification: ['notification'],
    roles: ['roles'],
    my_profile: ['my_profile'],
    my_archives: ['my_archives'],
    all_archives: ['all_archives'],
    archived_data: ['archived_data'],
    external_reports: ['external_reports'],
    settings: ['settings'],
    meeting: ['meetings']
  };

  totalEmployees = signal<number>(0);
  totalDepartments = signal<number>(0);
  pendingTasks = signal<number>(0);
  pendingRequests = signal<number>(0);
  totalTasks = signal<number>(0);
  totalRequests = signal<number>(0);
  totalAnnouncements = signal<number>(0);

  // ** Custom tables as signal for reactive updates **
  customTables = signal<ICustomTables[]>([]);

  tasksPieData: ChartData<'pie'> = {
    labels: ['المهام غير المعلقة', 'المهام المعلقة'],
    datasets: [{ data: [0, 0], backgroundColor: ['#0096b1ff', '#150cc0ff'], hoverOffset: 10 }]
  };

  requestsPieData: ChartData<'pie'> = {
    labels: ['الطلبات غير المعلقة', 'الطلبات المعلقة'],
    datasets: [{ data: [0, 0], backgroundColor: ['#0ed81fff', '#c40404ff'], hoverOffset: 10 }]
  };

  constructor(
    private translation: TranslationService,
    private branchService: Branch,
    private customTablesService: CustomTables
  ) {
    this.branchService.currentBranchModules$.subscribe((modules) => {
      this.currentModules = modules || [];
    });
  }

  ngOnInit() {
    this.loadDashboardData();
    this.loadCustomTables();
  }

  loadDashboardData() {
    this.branchService.getDashboardData().subscribe((data: any) => {
      this.pendingRequests.set(data.pendingRequests);
      this.pendingTasks.set(data.pendingTasks);
      this.totalAnnouncements.set(data.totalAnnouncements);
      this.totalDepartments.set(data.totalDepartments);
      this.totalEmployees.set(data.totalEmployees);
      this.totalRequests.set(data.totalRequests);
      this.totalTasks.set(data.totalTasks);

      const nonPendingTasks = data.totalTasks - data.pendingTasks;
      const nonPendingRequests = data.totalRequests - data.pendingRequests;

      this.tasksPieData.datasets[0].data = [nonPendingTasks, data.pendingTasks];
      this.requestsPieData.datasets[0].data = [nonPendingRequests, data.pendingRequests];

      // Force update for charts
      this.tasksPieChart?.update();
      this.requestsPieChart?.update();
    });
  }

  loadCustomTables() {
    this.customTablesService.getCustomTables().subscribe({
      next: (res: ICustomTables[]) => {
        this.customTables.set(res); // reactive update
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  isModuleVisible(cardKey: string): boolean {
    if (!this.currentModules.length) {
      return true;
    }
    const moduleKeys = this.dashboardModuleMap[cardKey] || [];
    if (!moduleKeys.length) {
      return false;
    }
    return moduleKeys.some(key => this.currentModules.includes(key));
  }
}
