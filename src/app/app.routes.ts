import { Routes, CanActivate } from '@angular/router';
import { AuthGuard } from './guards/auth-gaurd';
import { permissionGuard } from './guards/permission-guard';
import { Login } from './components/login/login';
import { Dashboard } from './components/dashboard/dashboard';
import { Tasks } from './components/tasks/tasks';
import { Finance } from './components/finance/finance';
import { Hr } from './components/hr/hr';
import { Reports } from './components/reports/reports';
import { Requests } from './components/requests/requests';
import { Meeting, MeetingsComponent } from './components/meeting/meeting';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'dashboard', component: Dashboard, canActivate: [AuthGuard] },
  {path: 'meeting', component: MeetingsComponent, canActivate: [AuthGuard, permissionGuard], data: { permission: ['meeting:read', 'meeting:all', 'meeting:update', 'meeting:delete'] } },
  { path: 'tasks', component: Tasks, canActivate: [AuthGuard, permissionGuard], data: { permission: ['task:read', 'task:all', 'task:update', 'task:delete'] } },
  { path: 'finance', component: Finance, canActivate: [AuthGuard, permissionGuard], data: { permission: ['report:read', 'report:all', 'report:update', 'report:delete'] } },
  { path: 'hr', component: Hr, canActivate: [AuthGuard, permissionGuard], data: { permission: ['employee:read', 'employee:all', 'employee:update', 'employee:delete'] } },
  { path: 'reports', component: Reports, canActivate: [AuthGuard, permissionGuard], data: { permission: ['report:read', 'report:all', 'report:update', 'report:delete'] } },
  { path: 'requests', component: Requests, canActivate: [AuthGuard, permissionGuard], data: { permission: ['request:read', 'request:all', 'request:update', 'request:delete'] } },
  { path: 'settings', canActivate: [AuthGuard], loadComponent: () => import('./components/settings/settings').then(m => m.Settings) },
  { path: 'strategy', canActivate: [AuthGuard, permissionGuard], data: { permission: ['strategy:read', 'strategy:all', 'strategy:update', 'strategy:delete'] }, loadComponent: () => import('./components/strategy/strategy').then(m => m.Strategy) },
  { path: 'jisr', canActivate: [AuthGuard], loadComponent: () => import('./components/jisr/jisr').then(m => m.Jisr) },
  { path: 'projects', canActivate: [AuthGuard, permissionGuard], data: { permission: ['project:read', 'project:all', 'project:update', 'project:delete'] }, loadComponent: () => import('./components/projects/projects').then(m => m.Projects) },
  { path: 'external-reports', canActivate: [AuthGuard, permissionGuard], data: { permission: ['external-report:read', 'external-report:all', 'external-report:update', 'external-report:delete'] }, loadComponent: () => import('./components/external-reports/external-reports').then(m => m.ExternalReports) },
  { path: 'branches', canActivate: [AuthGuard, permissionGuard], data: { permission: 'tenant:manage' }, loadComponent: () => import('./components/branches/branches').then(m => m.Branches) },
  { path: 'departments', canActivate: [AuthGuard, permissionGuard], data: { permission: ['department:read', 'department:all', 'department:update', 'department:delete'] }, loadComponent: () => import('./components/departments/departments').then(m => m.Departments) },
  { path: 'esign', canActivate: [AuthGuard], loadComponent: () => import('./components/e-sign/e-sign').then(m => m.ESign) },
  { path: 'recruitment', canActivate: [AuthGuard, permissionGuard], data: { permission: ['recruitment:read', 'recruitment:all', 'recruitment:update', 'recruitment:delete'] }, loadComponent: () => import('./components/recruitment/recruitment').then(m => m.Recruitment) },
  { path: 'announcement', canActivate: [AuthGuard, permissionGuard], data: { permission: ['announcement:read', 'announcement:all', 'announcement:update', 'announcement:delete'] }, loadComponent: () => import('./components/announcement/announcement').then(m => m.Announcements) },
  { path: 'notifications', canActivate: [AuthGuard, permissionGuard], data: { permission: 'notification:send' }, loadComponent: () => import('./components/notification-page/notification-page').then(m => m.NotificationPage) },
  { path: 'custom-table/:tableId', canActivate: [AuthGuard], loadComponent: () => import('./components/custom-table/custom-table').then(m => m.CustomTableComponent) },
  { path: 'chat', canActivate: [AuthGuard], loadComponent: () => import('./components/chat/chat').then(m => m.Chat) },
  {path: 'work-space', canActivate: [AuthGuard], loadComponent: () => import('./components/work-space/work-space').then(m => m.WorkSpace) },
  { path: 'not-found', loadComponent: () => import('./components/page-not-found/page-not-found').then(m => m.PageNotFound) },
  { path: 'unauthorized', loadComponent: () => import('./components/unauthorized/unauthorized').then(m => m.Unauthorized) },
  { path: '**', redirectTo: '/not-found', pathMatch: 'full' }
];
