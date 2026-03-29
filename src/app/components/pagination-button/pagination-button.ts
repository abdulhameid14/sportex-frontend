import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-pagination-button',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './pagination-button.html',
  styleUrl: './pagination-button.scss'
})
export class PaginationButton {
  @Input() isJisr: boolean = false;
  @Input() currentPage = 1;
  @Input() pageLimit = 15;
  @Input() itemsPerPage = 15;
  @Input() lastPageReached = false;
  @Output() pageChange = new EventEmitter<number>();
  // Jisr specific inputs
  @Input() nextPage: number | null = null;
  @Input() previousPage: number | null = null;
  @Input() totalPages = 1;

  changePage(page: number) {
    this.pageChange.emit(page);
  }


  goToPage(page: number) {
    if (page && page >= 1 && page <= this.totalPages)
      this.pageChange.emit(page);
  }

}
