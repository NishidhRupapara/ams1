import { CONFIG } from '../../config';
import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { StudentSidebarComponent } from '../student-sidebar/student-sidebar';

@Component({
  selector: 'app-view-assignments',
  standalone: true,
  imports: [CommonModule, StudentSidebarComponent],
  templateUrl: './view-assignments.html',
  styleUrls: ['./view-assignments.css']
})
export class ViewAssignmentsComponent implements OnInit {
  assignments: any[] = [];
  isLoading = true;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit() {
    const dept = sessionStorage.getItem("sessionStudentDept");
    if (dept) {
      this.fetchAssignments(dept);
    } else {
      this.isLoading = false;
    }
  }

  fetchAssignments(dept: string) {
    this.http.get<any[]>(`${CONFIG.API_URL}/Student/assignments/${dept}`)
      .subscribe({
        next: (data) => {
          this.zone.run(() => {
            this.assignments = data;
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

