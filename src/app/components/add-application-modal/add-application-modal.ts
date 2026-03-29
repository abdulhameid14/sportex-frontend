import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { IRecruitment } from '../../interfaces/IRecruitment.js';

@Component({
  selector: 'app-add-application-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './add-application-modal.html',
  styleUrls: ['./add-application-modal.scss', '../../../styles.scss']
})
export class AddApplicationModal {
  recruitment!: IRecruitment | null;
  @Output() save = new EventEmitter<any>();
  isOpen = signal(false);
  resume: File[] = [];

  open(recruitment: IRecruitment) {
    this.recruitment = { ...recruitment };
    this.isOpen.set(true);
  }

  close() {
    this.isOpen.set(false);
  }

  removeResume() {
    this.resume = [];
  }

  handleFileInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.resume = [...input.files];
    }
    input.value = ''; // reset input field
  }

  submit(form: NgForm) {
    if (form.valid) {
      const formData = new FormData();
      this.resume.forEach(file => {
        formData.append('files', file);
      });
      const NewRecruitment: any = {
        id: this.recruitment?.id,
        currentApplications: this.recruitment?.applications || [],
        applicantEmail: form.value.applicantEmail,
        applicantName: form.value.applicantName,
        resume: formData,
        position: this.recruitment?.position,
        departmentId: this.recruitment?.departmentId
      };
      console.log('Submitting Application from modal: ', NewRecruitment);
      this.save.emit(NewRecruitment);
      this.close();
      form.resetForm();
      this.resume = [];
    }
  }
}
