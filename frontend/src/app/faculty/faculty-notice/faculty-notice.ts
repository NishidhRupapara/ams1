import { CONFIG } from '../../config';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FacultySidebarComponent } from '../faculty-sidebar/faculty-sidebar';

@Component({
  selector: 'app-faculty-notice',
  standalone: true,
  imports: [CommonModule, FacultySidebarComponent],
  templateUrl: './faculty-notice.html',
  styleUrls: ['./faculty-notice.css']
})
export class FacultyNoticeComponent implements OnInit {
  notices: any[] = [];
  loading: boolean = true;
  error: string | null = null;
  username: string = 'User';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Get username from session
    const storedUser = sessionStorage.getItem("sessionUsername");
    if (storedUser) {
      this.username = storedUser.replace(/['"]/g, '').trim();
    }

    this.fetchNotices();
  }

  fetchNotices(): void {
    this.loading = true;
    this.http.get<any[]>(`${CONFIG.API_URL}/Admin/AllNoticeAdmin`)
      .subscribe({
        next: (res) => {
          // Sort by createdAt descending (Newest first)
          this.notices = res.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = "❌ Error loading notices: " + err.message;
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  // ✅ Check if notice is NEW (within 3 days)
  isNew(createdAt: string): boolean {
    const noticeDate = new Date(createdAt).getTime();
    const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000);
    return noticeDate > threeDaysAgo;
  }
}
