import { CONFIG } from '../../config';
import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { StudentSidebarComponent } from '../student-sidebar/student-sidebar';

@Component({
  selector: 'app-view-my-attendance',
  standalone: true,
  imports: [CommonModule, StudentSidebarComponent],
  templateUrl: './view-my-attendance.html',
  styleUrls: ['./view-my-attendance.css']
})
export class ViewMyAttendanceComponent implements OnInit {
  attendanceList: any[] = [];
  presentCount: number = 0;
  absentCount: number = 0;
  percentage: number = 0;
  loading: boolean = true;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    const rawSid = sessionStorage.getItem("sessionStudentId");
    const sid = rawSid ? rawSid.toString().replace(/['"]/g, '').trim() : null;
    if (sid) {
      this.fetchAttendance(sid);
    }
  }

  fetchAttendance(sid: string) {
    this.http.get<any[]>(`${CONFIG.API_URL}/Student/my-attendance/${sid}`)
      .subscribe({
        next: (data) => {
          this.zone.run(() => {
            this.attendanceList = data.sort((a, b) => {
              const dateA = new Date(a.date || a.Date).getTime();
              const dateB = new Date(b.date || b.Date).getTime();
              return dateB - dateA;
            });
            
            this.presentCount = data.filter(a => (a.status || a.Status) === 'Present').length;
            this.absentCount = data.filter(a => (a.status || a.Status) === 'Absent').length;
            
            const total = data.length;
            this.percentage = total > 0 ? Math.round((this.presentCount / total) * 100) : 0;
            this.loading = false;
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          this.zone.run(() => {
            console.error("Attendance Fetch Error:", err);
            this.loading = false;
            this.cdr.detectChanges();
          });
        }
      });
  }
}
