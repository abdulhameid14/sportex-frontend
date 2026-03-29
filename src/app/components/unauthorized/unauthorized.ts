import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterModule, TranslateModule],
  templateUrl: './unauthorized.html',
  styleUrls: ['./unauthorized.scss', '../../../styles.scss']
})
export class Unauthorized {

}
