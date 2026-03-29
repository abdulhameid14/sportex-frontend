import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [RouterModule, TranslateModule],
  templateUrl: './page-not-found.html',
  styleUrls: ['./page-not-found.scss', '../../../styles.scss']
})
export class PageNotFound {
}
