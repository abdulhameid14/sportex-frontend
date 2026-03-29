import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton-table.html',
  styleUrls: ['./skeleton-table.scss']
})
export class SkeletonTable {
  @Input() rows = 5;   // number of skeleton rows
  @Input() cols = 6;   // number of columns
}
