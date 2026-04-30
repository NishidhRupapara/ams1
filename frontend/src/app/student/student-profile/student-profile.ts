import { CONFIG } from '../../config';
import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { StudentSidebarComponent } from '../student-sidebar/student-sidebar';

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [CommonModule, StudentSidebarComponent],
  templateUrl: './student-profile.html',
  styleUrls: ['./student-profile.css']
})
export class StudentProfileComponent implements OnInit {
  profile: any = null;
  isLoading = true;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit() {
    const rawSid = sessionStorage.getItem("sessionStudentId");
    const sid = rawSid ? rawSid.toString().replace(/['"]/g, '').trim() : null;
    if (sid) this.fetchProfile(sid);
  }

  fetchProfile(sid: string) {
    this.http.get<any>(`${CONFIG.API_URL}/Student/profile/${sid}`)
      .subscribe({
        next: (data) => {
          this.zone.run(() => {
            this.profile = data;
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

