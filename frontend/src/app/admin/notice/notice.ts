import { CONFIG } from '../../config';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar';

@Component({
  selector: 'app-notice',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebarComponent],
  templateUrl: './notice.html',
  styleUrls: ['./notice.css']
})
export class NoticeComponent implements OnInit {
  notices: any[] = [];
  loading: boolean = true;
  error: string | null = null;

  showViewModal: boolean = false;
  showEditModal: boolean = false;
  selectedNotice: any = null;
  editData = { noticeTitle: "", noticeMessage: "" };

  private apiUrl = `${CONFIG.API_URL}/Admin`;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.fetchNotices();
  }

  fetchNotices(): void {
    this.http.get<any[]>(`${this.apiUrl}/AllNoticeAdmin`).subscribe({
      next: (data) => {
        this.notices = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = "❌ Error fetching notices: " + err.message;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Example: View Logic
  handleView(id: number) {
    this.http.get(`${CONFIG.API_URL}/Admin/notice/${id}`).subscribe({
      next: (data) => {
        this.selectedNotice = data;
        this.showViewModal = true;
        this.cdr.detectChanges(); // 🚀 Crucial for instant UI update
      },
      error: (err) => console.error("405 Check: Ensure backend is running and URL matches", err)
    });
  }

  handleDelete(id: any): void {
    if (!confirm("Are you sure you want to delete this notice?")) return;

    this.http.delete(`${this.apiUrl}/notice/${id}`).subscribe({
      next: () => {
        this.notices = this.notices.filter(n => n.noticeId !== id);
        alert("Notice deleted successfully");
        this.cdr.detectChanges();
      },
      error: (err) => alert("Error deleting notice: " + err.message)
    });
  }

  handleEdit(notice: any): void {
    this.selectedNotice = notice;
    this.editData = { noticeTitle: notice.noticeTitle, noticeMessage: notice.noticeMessage };
    this.showEditModal = true;
    this.cdr.detectChanges();
  }

  handleUpdate(): void {
    this.http.put(`${this.apiUrl}/notice/${this.selectedNotice.noticeId}`, this.editData).subscribe({
      next: (res: any) => {
        // Construct the updated object based on your API response structure
        const updatedNotice = res.data ? res.data : { ...this.selectedNotice, ...this.editData };

        this.notices = this.notices.map(n =>
          n.noticeId === this.selectedNotice.noticeId ? updatedNotice : n
        );

        this.closeModals();
        alert("Notice updated successfully");
      },
      error: (err) => alert("Error updating notice: " + err.message)
    });
  }

  closeModals(): void {
    this.showViewModal = false;
    this.showEditModal = false;
    this.cdr.detectChanges();
  }
}
