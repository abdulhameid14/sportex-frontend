import { FormsModule } from '@angular/forms';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ModuleItem {
  title: string;
  category: string;
  icon: string;
}

@Component({
  selector: 'app-hero',
  standalone: true,
   imports: [FormsModule,CommonModule],
  templateUrl: './hero.html',
  styleUrl: './hero.scss'
})
export class Hero {

  searchValue: string = '';

  modules: ModuleItem[] = [
    { title: 'Authentication', category: 'security', icon: 'ri-lock-line' },
    { title: 'Dashboard', category: 'ui', icon: 'ri-dashboard-line' },
    { title: 'Analytics', category: 'data', icon: 'ri-line-chart-line' },
    { title: 'User Management', category: 'users', icon: 'ri-user-settings-line' }
  ];

  get filteredModules(): ModuleItem[] {
    const value = this.searchValue.toLowerCase();

    return this.modules.filter(module =>
      module.title.toLowerCase().includes(value) ||
      module.category.toLowerCase().includes(value)
    );
  }
}
