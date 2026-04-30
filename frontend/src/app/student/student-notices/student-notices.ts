import { CONFIG } from '../../config';
import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { StudentSidebarComponent } from '../student-sidebar/student-sidebar';

@Component({
  selector: 'app-student-notices',
  standalone: true,
  imports: [CommonModule, StudentSidebarComponent],
  templateUrl: './student-notices.html',
  styleUrls: ['./student-notices.css']
})
export class StudentNoticesComponent implements OnInit {
  notices: any[] = [];
  isLoading = true;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit() {
    this.fetchNotices();
  }

  fetchNotices() {
    this.http.get<any[]>(`${CONFIG.API_URL}/Admin/notices`)
      .subscribe({
        next: (data) => {
          this.zone.run(() => {
            this.notices = data;
            this.isLoading = false;
            this.cdr.detectChanges();
          });
        },
        error: () => {
          this.zone.run(() => {
            this.isLoading = false;
            this.cdr.detectChanges();
          });
        }
      });
  }
}

