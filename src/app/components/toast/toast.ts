import { Component, computed } from '@angular/core';
import { NgClass } from '@angular/common';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [NgClass],
  templateUrl: './toast.html',
  styleUrls: ['./toast.scss']
})
export class Toast {
  constructor(public toast: ToastService) {}
}
