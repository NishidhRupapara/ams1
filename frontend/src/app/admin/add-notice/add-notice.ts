import { CONFIG } from '../../config';
import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar';

@Component({
  selector: 'app-add-notice',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AdminSidebarComponent],
  templateUrl: './add-notice.html',
  styleUrls: ['./add-notice.css']
})
export class AddNoticeComponent {
  // Form fields
  title: string = "";
  description: string = "";
  adminName: string = "Admin"; // Default value

  // Message states
  message: string | null = null;
  error: string | null = null;

  private apiUrl = `${CONFIG.API_URL}/Admin/AddNotice`;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  handleSubmit() {
    this.message = null;
    this.error = null;

    if (!this.title || !this.description) {
      this.error = "All fields are required!";
      return;
    }

    const payload = {
      noticeTitle: this.title,
      noticeMessage: this.description,
      postedBy: this.adminName
    };

    this.http.post(this.apiUrl, payload).subscribe({
      next: (res: any) => {
        this.message = "✅ Notice added successfully!";
        this.title = "";
        this.description = "";
        this.cdr.detectChanges(); // 🚀 Force UI refresh immediately
        
        // Auto-hide success message after 4 seconds
        setTimeout(() => {
          this.message = null;
          this.cdr.detectChanges();
        }, 4000);
      },
      error: (err) => {
        this.error = "❌ Error submitting notice: " + (err.error?.message || err.message);
        this.cdr.detectChanges();
      }
    });
  }
}
